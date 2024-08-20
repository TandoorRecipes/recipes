import socket
from urllib.parse import urlparse

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.db.models import Func
from ipaddress import ip_address

from recipes import settings


class Round(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 0)'


def str2bool(v):
    if isinstance(v, bool) or v is None:
        return v
    else:
        return v.lower() in ("yes", "true", "1")


"""
validates an url that is supposed to be imported
checks that the protocol used is http(s) and that no local address is accessed
@:param url to test
@:return true if url is valid, false otherwise
"""


def validate_import_url(url):
    try:
        validator = URLValidator(schemes=['http', 'https'])
        validator(url)
    except ValidationError:
        # if schema is not http or https, consider url invalid
        return False

    # resolve IP address of url
    try:
        url_ip_address = ip_address(str(socket.gethostbyname(urlparse(url).hostname)))
    except (ValueError, AttributeError, TypeError, Exception) as e:
        # if ip cannot be parsed, consider url invalid
        return False

    # validate that IP is neither private nor any other special address
    return not any([url_ip_address.is_private, url_ip_address.is_reserved, url_ip_address.is_loopback,  url_ip_address.is_multicast, url_ip_address.is_link_local, ])
