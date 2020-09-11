from django.conf.urls import url
from .views import Image
from .views import Settings

urlpatterns = [
    url(r'^image/$', Image.as_view(), name='upload-image'),
    url(r'^settings/$', Settings.as_view(), name='settings'),
]
