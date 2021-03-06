from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import datetime
# import uuid

from django.shortcuts import render
from django.core.files.storage import default_storage
from django.conf import settings
from django.http import HttpResponse, FileResponse, HttpResponseNotFound

from api.tasks.image import preprocessing_image, detect_faces, form_bounding_boxes, imageUploadTask
from api.models.image import Image as Image_object
from api.models.settings import Settings as Settings_object

from celery import chain
import magic

from django.core.exceptions import ObjectDoesNotExist
import logging

# Create your views here.

def upload_photo_image(request, device_id, image_id):
    img = request.FILES['photo_image']

    img_extension = os.path.splitext(img.name)[-1]
    media_path = os.path.join(settings.BASE_DIR, settings.MEDIA_ROOT, "")
    fullname = os.path.join(media_path, "media", 'photo_' + device_id + '_' + image_id + img_extension)

    # delete file if exist
    if os.path.exists(fullname):
        os.remove(fullname)

    return default_storage.save(fullname, img)

def upload_thermal_image(request, device_id, image_id):
    img = request.FILES['thermal_image']

    img_extension = os.path.splitext(img.name)[-1]
    media_path = os.path.join(settings.BASE_DIR, settings.MEDIA_ROOT, "")
    fullname = os.path.join(media_path, "media", 'thermal_' + device_id + '_' + image_id + img_extension)

    # delete file if exist
    if os.path.exists(fullname):
        os.remove(fullname)

    return default_storage.save(fullname, img)


class Image(APIView):

    # example using POSTMAN: POST http://192.168.0.4:8000/api/image/
    # and inside body add device_id, photo_image, and thermal_image
    def post(self, request, *args, **kwargs):
        device_id = request.POST.get('device_id')
        min_temperature = request.POST.get('min_temperature')
        max_temperature = request.POST.get('max_temperature')

        # image_id = str(uuid.uuid4())
        num_imgs = Image_object.objects.filter(device_id=device_id).count()
        if (num_imgs > 1000):  # max buffering images
            num_imgs = 0

        imageid = "{:05d}".format(num_imgs)

        photo_filename = upload_photo_image(request, device_id, imageid)
        thermal_filename = upload_thermal_image(request, device_id, imageid)

        name, ext = os.path.splitext(photo_filename)
        photo_preprocessed_filename = name + '_pre' + ext
        photo_output_filename = name + '_out' + ext

        name, ext = os.path.splitext(thermal_filename)
        thermal_preprocessed_filename = name + '_pre' + ext
        thermal_output_filename = name + '_out' + ext

        ### Check if the image_id is already exist in the database
        image_object = None
        try:
            image_object = Image_object.objects.filter(device_id=device_id).get(image_id=imageid)
        except Image_object.DoesNotExist:
            image_object = None

        if image_object:    # update the record in the database
            image_object.device_id = device_id
            image_object.image_id = imageid
            image_object.min_temperature = min_temperature
            image_object.max_temperature = max_temperature
            image_object.photo_filename = photo_filename
            image_object.thermal_filename = thermal_filename
            image_object.photo_preprocessed_filename = photo_preprocessed_filename
            image_object.thermal_preprocessed_filename = thermal_preprocessed_filename
            image_object.photo_output_filename = photo_output_filename
            image_object.thermal_output_filename = thermal_output_filename
            image_object.status = ''
            image_object.date_created = datetime.now()
            image_object.save()
        else:               # create a new record in the database
            image = Image_object()
            image.device_id = device_id
            image.image_id = imageid
            image.min_temperature = min_temperature
            image.max_temperature = max_temperature
            image.photo_filename = photo_filename
            image.thermal_filename = thermal_filename
            image.photo_preprocessed_filename = photo_preprocessed_filename
            image.thermal_preprocessed_filename = thermal_preprocessed_filename
            image.photo_output_filename = photo_output_filename
            image.thermal_output_filename = thermal_output_filename
            image.status = ''
            image.save()

        # detect_faces.s(device_id=device_id, image_id=imageid).delay()
        chain(
            preprocessing_image.s(device_id=device_id, image_id=imageid)|
            detect_faces.s(device_id=device_id, image_id=imageid)|
            form_bounding_boxes.s(device_id=device_id, image_id=imageid)
        ).delay()

        return Response({"status":"ok"}, status=status.HTTP_202_ACCEPTED)

    def get(self,request):
        # The device_id is in urls params
        if request.GET.get("device_id"):
            device_id = request.GET.get("device_id")

            image_type = 'photo'
            if request.GET.get("image_type"):
                image_type = request.GET.get("image_type")  # image type: photo or thermal

            # logging.info('image_type: %s', image_type)

            # sort descending from the latest to earliest date
            image_object = Image_object.objects.filter(device_id=device_id).order_by('-date_created')

            response = None

            if image_object:

                output_filename = ''
                if image_type == 'photo':
                    output_filename = image_object[0].photo_output_filename
                else:
                    output_filename = image_object[0].thermal_output_filename

                filename, extension = os.path.splitext(output_filename)
                extension = extension[1:] # remove the dot

                # # --- First method using python-magic
                # image = default_storage.open(output_filename).read()
                # # only work on windows 10
                # mime_magic = magic.Magic(magic_file="C:\Windows\System32\magic.mgc", mime=True)
                # content_type = mime_magic.from_buffer(image)
                # # logging.info('content-type: ', content_type)
                # # # for linux
                # # content_type = magic.from_buffer(image, mime=True)

                # response = HttpResponse(image, content_type=content_type)
                # response['Content-Disposition'] = 'attachment; filename="%s"' % output_filename

                # --- second method using FileResponse
                image = open(output_filename, 'rb')
                if (extension == 'jpg'):
                    extension = 'jpeg'

                response = FileResponse(image, content_type=f"image/{extension}")
                response["Content-Disposition"] = ("attachment; filename="f"{output_filename}")
                response["status"] = image_object[0].status

                # image_object[0].status = 'read'  # to indicate the detection is processed and has been read
                image_object[0].save()

            else:
                # return Response({"status": "buffering"},   status=status.HTTP_200_OK)
                # response = HttpResponseNotFound(content="Buffering")
                response = HttpResponse("Buffering", status.HTTP_200_OK)
                response["status"] = 'buffering'

            return response
        pass

class Settings(APIView):

    # example using POSTMAN: POST http://192.168.0.4:8000/api/image/
    # and inside body add device_id, scale, and rotate
    def post(self, request, *args, **kwargs):
        device_id = request.POST.get('device_id')
        scale = float(request.POST.get('scale'))
        rotate = int(request.POST.get('rotate'))  # in degree
        offsetRotate = float(request.POST.get('offsetRotate'))  # in degree
        offsetValue = float(request.POST.get('offsetValue'))  # in Celcius
        # logging.info('device-id: %s', device_id)
        # logging.info('scale: %f', scale)
        # logging.info('rotate: %f', rotate)
        # logging.info('offsetRotate: %f', offsetRotate)

        settings_object = None
        try:
            settings_object = Settings_object.objects.get(device_id=device_id)
        except ObjectDoesNotExist:
            settings_object = None

        if settings_object:  # update the record in the database
            settings_object.device_id = device_id
            settings_object.scale = scale
            settings_object.rotate = rotate
            settings_object.offsetRotate = offsetRotate
            settings_object.offsetValue = offsetValue
            settings_object.save()
        else:  # create a new record in the database
            settings_object = Settings_object()
            settings_object.device_id = device_id
            settings_object.scale = scale
            settings_object.rotate = rotate
            settings_object.offsetRotate = offsetRotate
            settings_object.offsetValue = offsetValue
            settings_object.save()

        #
        settings_object = Settings_object.objects.get(device_id=device_id)
        # logging.info('device_id: %s', settings_object.device_id)
        # logging.info('rotate: %f', settings_object.rotate)
        # logging.info('scale: %f', settings_object.scale)
        # logging.info('offsetRotate: %f', settings_object.offsetRotate)

        ### update the latest record
        # sort descending from the latest to earliest date
        response = None
        try:
            image_objects = Image_object.objects.filter(device_id=device_id).order_by('-date_created')
            image_object = image_objects[0]
            image_id = image_object.image_id

            chain(
                preprocessing_image.s(device_id=device_id, image_id=image_id) |
                detect_faces.s(device_id=device_id, image_id=image_id) |
                form_bounding_boxes.s(device_id=device_id, image_id=image_id)
            ).delay()

            response = HttpResponse("Status OK", status.HTTP_200_OK)

        except ObjectDoesNotExist:
            image_object = None
            response = HttpResponse("Record ObjectDoesNotExist", status.HTTP_200_OK)

        return response

    # def get(self, request):

class ImageUpload(APIView):

    # example using POSTMAN: POST http://192.168.0.4:8000/api/ImageUpload/
    def post(self, request, *args, **kwargs):
        user_id = request.POST.get('user_id')
        device_id = request.POST.get('device_id')
        image_id = request.POST.get('image_id')

        imageUploadTask.s(user_id=user_id, device_id=device_id, image_id=image_id).delay()

        return HttpResponse("Status OK", status.HTTP_200_OK)
