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
from api.models.settings import Settings as Settings_object
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.exceptions import ObjectDoesNotExist
import logging

import firebase_admin
from firebase_admin import credentials, storage, firestore

cred = credentials.Certificate('./awascovid-firebase-adminsdk.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'awascovid.appspot.com'
})

@app.task(bind=True, name='preprocessing_image')
def preprocessing_image(self, *args, **kwargs):
    device_id = kwargs.get("device_id")
    image_id = kwargs.get("image_id")

    image_object = Image_object.objects.filter(device_id=device_id).get(image_id=image_id)
    photo_filename = image_object.photo_filename
    thermal_filename = image_object.thermal_filename
    photo_preprocessed_filename = image_object.photo_preprocessed_filename
    thermal_preprocessed_filename = image_object.thermal_preprocessed_filename

    rotate = 0
    offsetRotate = 0.0
    scale = 1.0
    try:
        setting_object = Settings_object.objects.get(device_id=device_id)
        rotate = setting_object.rotate
        offsetRotate = setting_object.offsetRotate
        scale = setting_object.scale
    except ObjectDoesNotExist:
        rotate = 0
        offsetRotate = 0.0
        scale = 1.0

    rotate = np.clip(rotate, -180, 180)
    offsetRotate = np.clip(offsetRotate, -180.0, 180.0)
    scale = np.clip(scale, 0.01, 5.0)

    # logging.debug('preprocessing image scale: %f', scale)
    # logging.debug('preprocessing image rotation: %d', rotate)
    # logging.debug('preprocessing image offset rotation: %f', offsetRotate)

    name, ext = os.path.splitext(photo_filename)
    photo_preprocessed_filename = name + '_pre' + ext
    name, ext = os.path.splitext(thermal_filename)
    thermal_preprocessed_filename = name + '_pre' + ext

    photo_image = PImage.open(default_storage.open(photo_filename))
    photo_image = photo_image.convert('RGB')
    photo_image = np.asarray(photo_image)
    photo_image = cv2.cvtColor(photo_image, cv2.COLOR_RGB2BGR)
    # photo_image = cv2.resize(photo_image, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)

    ## Perform photo image rotation
    if rotate == 90:
        photo_image = cv2.rotate(photo_image, cv2.ROTATE_90_CLOCKWISE)
    elif rotate == -90:
        photo_image = cv2.rotate(photo_image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif rotate == 180 or rotate == -180:
        photo_image = cv2.rotate(photo_image, cv2.cv2.ROTATE_180)

    rows, cols, c = photo_image.shape
    M = cv2.getRotationMatrix2D((cols / 2, rows / 2), offsetRotate, scale)
    # swab width and height if in certain rotation range
    if (offsetRotate > 45.0 and offsetRotate < 135.0) or (offsetRotate > -135.0 and offsetRotate < -45.0):
        photo_image = cv2.warpAffine(photo_image, M, (rows, cols))
    else:
        photo_image = cv2.warpAffine(photo_image, M, (cols, rows))

    thermal_image = PImage.open(default_storage.open(thermal_filename))
    thermal_image = thermal_image.convert('RGB')
    thermal_image = np.asarray(thermal_image)
    thermal_image = cv2.cvtColor(thermal_image, cv2.COLOR_RGB2BGR)

    ## Perform thermal image rotation
    if rotate == 90:
        thermal_image = cv2.rotate(thermal_image, cv2.ROTATE_90_CLOCKWISE)
    elif rotate == -90:
        thermal_image = cv2.rotate(thermal_image, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif rotate == 180 or rotate == -180:
        thermal_image = cv2.rotate(thermal_image, cv2.cv2.ROTATE_180)

    rows, cols, c = thermal_image.shape
    M = cv2.getRotationMatrix2D((cols / 2, rows / 2), offsetRotate, scale)
    # swab width and height if in certain rotation range
    if (offsetRotate > 45.0 and offsetRotate < 135.0) or (offsetRotate > -135.0 and offsetRotate < -45.0):
        thermal_image = cv2.warpAffine(thermal_image, M, (rows, cols))
    else:
        thermal_image = cv2.warpAffine(thermal_image, M, (cols, rows))

    # save preprocessed images
    cv2.imwrite(photo_preprocessed_filename, photo_image)
    cv2.imwrite(thermal_preprocessed_filename, thermal_image)
    # # TODO: convert back to pil image
    # photo_image = cv2.cvtColor(photo_image, cv2.COLOR_BGR2RGB)
    # photo_pil_im = PImage.fromarray(photo_image)
    # thermal_image = cv2.cvtColor(thermal_image, cv2.COLOR_BGR2RGB)
    # thermal_pil_im = PImage.fromarray(thermal_image)
    # default_storage.save(photo_preprocessed_filename, photo_pil_im)
    # default_storage.save(thermal_preprocessed_filename, thermal_pil_im)

    return (device_id, image_id)


@app.task(bind=True, name='detect_faces')
def detect_faces(self, *args, **kwargs):

    device_id = kwargs.get("device_id")
    image_id = kwargs.get("image_id")

    image_object = Image_object.objects.filter(device_id=device_id).get(image_id=image_id)
    filename = image_object.photo_preprocessed_filename

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


@app.task(bind=True, name='form_bounding_boxes')
def form_bounding_boxes(self, *args, **kwargs):
    device_id = kwargs.get("device_id")
    image_id = kwargs.get("image_id")

    # get single record
    image_object = Image_object.objects.filter(device_id=device_id).get(image_id=image_id)

    photo_filename = image_object.photo_preprocessed_filename
    photo_output_filename = image_object.photo_output_filename

    thermal_filename = image_object.thermal_preprocessed_filename
    thermal_output_filename = image_object.thermal_output_filename

    min_temperature = image_object.min_temperature
    max_temperature = image_object.max_temperature

    ### Get offset value from database
    offsetValue = 0.0
    try:
        setting_object = Settings_object.objects.get(device_id=device_id)
        offsetValue = setting_object.offsetValue
    except ObjectDoesNotExist:
        offsetValue = 0.0

    offsetValue = np.clip(offsetValue, -10.0, 10.0)

    ### delete file if exist
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

    faces_dict = {
        'faces' : list(),
        'status' : 'normal',
    }
    for face in faces_on_image:

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
        average_temp = average_temp + offsetValue  # add offset value in Celcius

        faces_dict['faces'].append({
            "box": face.box,
            "temperature": round(average_temp, 2),
        })

        if average_temp > 37.0:
            image_object.covid_detected = True
            faces_dict['status'] = 'covid detected'

        cv2.rectangle(colormap_thermal_image, (x1, y1), (x2, y2), (0, 255, 0), 5)
        cv2.putText(colormap_thermal_image,
                    "{0:.2f}C".format(float(average_temp)),
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

    image_object.status = json.dumps(faces_dict)
    image_object.save()

    # try:
    #     requests.post(url=image_object.callback_url, data=json.dumps(callback))
    # except Exception as e:
    #     # log exception
    #     pass

    return (device_id, image_id)


@app.task(bind=True, name='imageUploadTask')
def imageUploadTask(self, *args, **kwargs):
    user_id = kwargs.get("user_id")
    device_id = kwargs.get("device_id")
    image_id = kwargs.get("image_id")

    # logging.info('data inputs %s %s %s', user_id, device_id, image_id)

    try:
        # get single record
        image_object = Image_object.objects.filter(device_id=device_id).get(image_id=image_id)
        min_temperature = image_object.min_temperature
        max_temperature = image_object.max_temperature
        covid_detected = image_object.covid_detected
        status = image_object.status
        date_created = image_object.date_created
        photo_output_filename = image_object.photo_output_filename

        # Upload to firebase storage
        bucket = storage.bucket()
        filepath, filename = os.path.split(photo_output_filename)
        blob = bucket.blob(user_id + '/' + device_id + '/' + image_id + '/' + filename)
        blob.upload_from_filename(photo_output_filename)

        # save to firebase database
        db = firestore.client()
        doc_ref = db.collection(u'images').document(user_id)
        doc_ref.set({
            u'user_id': user_id,
            u'device_id': device_id,
            u'image_id': image_id,
            u'min_temperature': min_temperature,
            u'max_temperature': max_temperature,
            u'photo_output_filename': blob.public_url,
            u'covid_detected': covid_detected,
            u'status': status,
            u'date_created': date_created,
        })

    except ObjectDoesNotExist:
        logging.error('upload2Cloud ObjectDoesNotExist')

    return (device_id, image_id)
