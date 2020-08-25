import os
import uuid
import cv2
import json
import io
from PIL import Image as PImage
import numpy as np
from awascovid.celery import app
from api.models.image import Image as Image_object
from api.models.face import Face as Face_object
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import InMemoryUploadedFile
import logging

@app.task(bind=True, name='detect_faces')
def detect_faces(self, *args, **kwargs):

    device_id = kwargs.get("device_id")
    image_id = kwargs.get("image_id")

    image_object = Image_object.objects.filter(device_id=device_id).get(image_id=image_id)
    filename = image_object.photo_filename

    image = PImage.open(default_storage.open(filename))
    image = image.convert('RGB')
    # Load the cascade
    face_cascade = cv2.CascadeClassifier('./haarcascade_frontalface_default.xml')
    # Read the input image
    img = np.asarray(image)
    # NOTE: OpenCV follows BGR convention and PIL follows RGB color convention
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    # # convert back pillow image
    # im_pil = PImage.fromarray(img)

    # Convert into grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # Check the image_id face, if exist delete it
    Face_object.objects.filter(image_id=image_id).delete()

    # extract the bounding box from the faces
    detected_faces = list()
    for (x, y, width, height) in faces:

        face_object = Face_object()
        face_id = str(uuid.uuid4())
        face_object.device_id = device_id
        face_object.face_id = face_id
        face_object.image_id = image_id
        face_object.box = json.dumps((int(x), int(y), int(width), int(height)))
        face_object.save()

        detected_faces.append({
            "face_id": face_id,
            "device_id": device_id,
            "image_id": image_id,
            "x": x,
            "y": y,
            "width": width,
            "height": height
        })

    # # update image database status
    # image_object.status = 'completed'
    # image_object.save()

    return detected_faces


@app.task(bind=True, name='detect_faces_callback')
def detect_faces_callback(self, *args, **kwargs):
    device_id = kwargs.get("device_id")
    image_id = kwargs.get("image_id")

    image_object = Image_object.objects.filter(device_id=device_id).get(image_id=image_id)

    photo_filename = image_object.photo_filename
    photo_output_filename = image_object.photo_output_filename

    thermal_filename = image_object.thermal_filename
    thermal_output_filename = image_object.thermal_output_filename

    min_temperature = image_object.min_temperature
    max_temperature = image_object.max_temperature

    # delete file if exist
    if os.path.exists(photo_output_filename):
        os.remove(photo_output_filename)
    if os.path.exists(thermal_output_filename):
        os.remove(thermal_output_filename)

    faces_on_image = Face_object.objects.filter(device_id=device_id).filter(image_id=image_id)

    photo_image = PImage.open(default_storage.open(photo_filename))
    thermal_image = PImage.open(default_storage.open(thermal_filename))
    photo_image = photo_image.convert('RGB')
    thermal_image = thermal_image.convert('RGB')
    # Read the input image
    photo_image = np.asarray(photo_image)
    thermal_image = np.asarray(thermal_image)
    # NOTE: OpenCV follows BGR convention and PIL follows RGB color convention
    photo_image = cv2.cvtColor(photo_image, cv2.COLOR_RGB2BGR)
    photo_image = photo_image.copy()
    thermal_image = cv2.cvtColor(thermal_image, cv2.COLOR_RGB2BGR)
    colormap_thermal_image = thermal_image.copy()
    # apply colormap
    cv2.applyColorMap(colormap_thermal_image, cv2.COLORMAP_MAGMA, colormap_thermal_image)

    height_ratio = thermal_image.shape[0] / photo_image.shape[0]
    width_ratio = thermal_image.shape[1] / photo_image.shape[1]

    # logging.info('height ratio', height_ratio)
    # logging.info('width ratio', width_ratio)

    faces_dict = list()
    for face in faces_on_image:

        faces_dict.append({
            "box":face.box
        })
        box = json.loads(face.box)

        # get thermal bounding boxes
        x1, y1, width, height = box
        x1, y1 = abs(x1), abs(y1)
        x2, y2 = x1 + width, y1 + height
        x1 = int(x1 * width_ratio)
        x2 = int(x2 * width_ratio)
        y1 = int(y1 * height_ratio)
        y2 = int(y2 * height_ratio)

        # calculate temperature based on averaging
        # roi_im = thermal_image[y1:y2, x1:x2, 0]
        # average_temp = np.sum(roi_im) / cv2.countNonZero(roi_im)
        # average_temp = average_temp * 0.2764  # scale factor

        # calculate temperature based on center position and scaling with min-max temperature
        center_x = x1 + int((x2-x1)/2)
        center_y = y1 + int((y2-y1)/2)
        average_temp = thermal_image[center_y, center_x, 0]
        average_temp = min_temperature + average_temp * (max_temperature-min_temperature) / 255.0

        cv2.rectangle(colormap_thermal_image, (x1, y1), (x2, y2), (0, 255, 0), 5)
        cv2.putText(colormap_thermal_image,
                    "{0:.2f}°C".format(float(average_temp)),
                    (x1, (y2 + 25)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

        x1, y1, width, height = box
        x1, y1 = abs(x1), abs(y1)
        x2, y2 = x1 + width, y1 + height
        cv2.rectangle(photo_image, (x1, y1), (x2, y2), (0, 255, 0), 5)
        cv2.putText(photo_image,
                    "{0:.2f}".format(float(average_temp)),
                    (x1, (y2 + 25)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)


    # convert back to pil image
    photo_image = cv2.cvtColor(photo_image, cv2.COLOR_BGR2RGB)
    photo_pil_im = PImage.fromarray(photo_image)
    colormap_thermal_image = cv2.cvtColor(colormap_thermal_image, cv2.COLOR_BGR2RGB)
    thermal_pil_im = PImage.fromarray(colormap_thermal_image)

    photo_silver_bullet = io.BytesIO()
    thermal_silver_bullet = io.BytesIO()
    photo_pil_im.save(photo_silver_bullet, format="JPEG")
    thermal_pil_im.save(thermal_silver_bullet, format="JPEG")

    photo_image_file = InMemoryUploadedFile(photo_silver_bullet, None, photo_output_filename, 'image/jpeg',
                                      len(photo_silver_bullet.getvalue()), None)
    thermal_image_file = InMemoryUploadedFile(thermal_silver_bullet, None, thermal_output_filename, 'image/jpeg',
                                      len(thermal_silver_bullet.getvalue()), None)

    default_storage.save(photo_output_filename, photo_image_file)
    default_storage.save(thermal_output_filename, thermal_image_file)

    # callback = dict({
    #     "device_id":device_id,
    #     "image_id":image_id,
    #     "request_id":image_object.request_id,
    #     "faces":faces_dict,
    #     "output_image_url":"{host}/api/image/?image_id={image_id}".format(host=settings.API_HOST, image_id=image_id)
    # })

    image_object.status = "processed"
    image_object.save()

    # try:
    #     requests.post(url=image_object.callback_url, data=json.dumps(callback))
    # except Exception as e:
    #     # log exception
    #     pass

    return (device_id, image_id)
