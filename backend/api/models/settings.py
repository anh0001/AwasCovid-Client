import os

from django.db import models

class Settings(models.Model):
    device_id = models.CharField(max_length=100)
    scale = models.FloatField(default=1.0)  # default is no image scaling
    rotate = models.IntegerField(default=0) # in degree
    offsetRotate = models.FloatField(default=0.0)  # in degree
    offsetValue = models.FloatField(default=0.0)  # offset measurement in celcius
    autoSaveToCloud = models.BooleanField(default=False)  # auto save when covid is detected
