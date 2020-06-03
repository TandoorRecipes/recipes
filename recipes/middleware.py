from django.contrib.auth.middleware import RemoteUserMiddleware

class CustomRemoteUser(RemoteUserMiddleware):
    header = getenv('PROXY_HEADER', 'HTTP_REMOTE_USER')