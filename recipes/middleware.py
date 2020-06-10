from django.contrib.auth.middleware import RemoteUserMiddleware
from os import getenv

class CustomRemoteUser(RemoteUserMiddleware):
    header = getenv('PROXY_HEADER', 'HTTP_REMOTE_USER')
