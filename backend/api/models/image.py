import os

from django.db import models

class Image(models.Model):
    device_id = models.CharField(max_length=100)
    image_id = models.CharField(max_length=100)
    min_temperature = models.IntegerField(default=30)
    max_temperature = models.IntegerField(default=45)
    image_array = models.TextField(null= True)
    photo_filename = models.CharField(max_length=255)
    thermal_filename = models.CharField(max_length=255)
    photo_preprocessed_filename = models.CharField(max_length=255)
    thermal_preprocessed_filename = models.CharField(max_length=255)
    photo_output_filename = models.CharField(max_length=255)  # output photo image with bounding box
    thermal_output_filename = models.CharField(max_length=255)  # output thermal image with bounding box
    covid_detected = models.BooleanField(default=False)
    status = models.CharField(max_length=100, default="processing")
    # callback_url = models.CharField(max_length=100)
    date_created = models.DateTimeField(auto_now_add=True)
