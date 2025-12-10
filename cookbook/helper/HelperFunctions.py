import socket
from ipaddress import ip_address
from urllib.parse import urlparse

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.db.models import Func
from thefuzz import fuzz
from thefuzz import process as fuzz_process

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
    return not any([
        url_ip_address.is_private,
        url_ip_address.is_reserved,
        url_ip_address.is_loopback,
        url_ip_address.is_multicast,
        url_ip_address.is_link_local,
    ])


def match_or_fuzzymatch(check_string: str, key_dict: dict) -> tuple[str, int]:
    """
    takes a string and sees if it matches exactly any of the Dictionary keys
    or any of the alternative strings listed in the value of each key.
    If there are no matches return the key of the string that returns the best fuzzy match against your check_string.

    :param check_string: A string that you want to attempt to match
    :param key_dict: key: exact terms you are searching for, value:a list of strings that are alternative terms to check.
    :return:
    """
    score = (None, 0)
    for key in key_dict:
        key_dict[key].append(key)
        if check_string.lower() in [match.lower() for match in key_dict[key]]:
            return (key, 100)
    for key in key_dict:
        key_score = fuzz_process.extract(check_string, key_dict[key], limit=1, scorer=fuzz.partial_token_sort_ratio)[0]
        if key_score[1] > score[1]:
            score = (key, key_score[1])
    return score
