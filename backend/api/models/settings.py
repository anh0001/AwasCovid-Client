import os

from django.db import models

class Settings(models.Model):
    device_id = models.CharField(max_length=100)
    scale = models.FloatField(default=1.0)  # default is no image scaling
    rotate = models.FloatField(default=0.0)
