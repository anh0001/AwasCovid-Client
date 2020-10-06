from django.conf.urls import url
from .views import Image
from .views import Settings
from .views import ImageUpload

urlpatterns = [
    url(r'^image/$', Image.as_view(), name='upload-image'),
    url(r'^settings/$', Settings.as_view(), name='settings'),
    url(r'^imageupload/$', ImageUpload.as_view(), name='image-upload'),
]
