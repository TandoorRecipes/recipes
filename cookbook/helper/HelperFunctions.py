import socket
import requests
import struct
from ipaddress import ip_address
from urllib.parse import urlparse, quote, urlunparse

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
    """
    validates an url that is supposed to be imported
    checks that the protocol used is http(s) and that no local address is accessed
    @:param url to test
    @:return true if url is valid, false otherwise
    """
    try:
        # if the URL contains control characters, it's likely malicious or broken
        if any(ord(c) < 32 or ord(c) == 127 for c in url):
            return False

        # handle URLs with unencoded characters (e.g. spaces) by encoding them
        # this is necessary because Django's URLValidator is strict
        parsed = urlparse(url)
        encoded_path = quote(parsed.path, safe='/')
        encoded_query = quote(parsed.query, safe='=&%/,()[]')
        normalized_url = urlunparse((parsed.scheme, parsed.netloc, encoded_path, parsed.params, encoded_query, parsed.fragment))

        # use a more permissive validator for initial check to allow encoded IPs in hostname
        # Django's URLValidator might reject them
        validator = URLValidator(schemes=['http', 'https'])
        try:
            validator(normalized_url)
        except ValidationError:
            # if django validator fails, we check if it's because of the encoded IP
            if not parsed.scheme in ['http', 'https'] or not parsed.netloc:
                return False
    except (ValidationError, ValueError):
        # if schema is not http or https, consider url invalid
        return False

    # resolve IP address of url
    try:
        hostname = urlparse(url).hostname
        if not hostname:
            return False
            
        # check if the hostname is an encoded IP (DWORD, Hex, Octal)
        # as some systems might resolve these and they can be used to bypass SSRF filters
        encoded_ip = None
        try:
            if hostname.startswith('0x'): # Hex
                encoded_ip = ip_address(int(hostname, 16))
            elif hostname.startswith('0') and len(hostname) > 1 and '.' not in hostname: # Octal
                encoded_ip = ip_address(int(hostname, 8))
            elif hostname.isdigit(): # DWORD / Decimal
                encoded_ip = ip_address(int(hostname))
        except (ValueError, OverflowError):
            pass

        if encoded_ip:
            url_ip_address = encoded_ip
        else:
            url_ip_address = ip_address(str(socket.gethostbyname(hostname)))
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


def safe_request(method, url, **kwargs):
    """
    Safe wrapper for requests that validates the initial URL and all subsequent redirects.
    """
    # default to not following redirects if not specified, 
    # but since we want to follow them safely, we handle them manually if allow_redirects is True
    allow_redirects = kwargs.pop('allow_redirects', True)
    
    current_url = url
    visited_urls = set()
    max_redirects = 10

    response = None
    while len(visited_urls) < max_redirects:
        # handle URLs with unencoded characters (e.g. spaces) by encoding them
        # this is necessary because Django's URLValidator is strict, but we must
        # be careful not to over-encode as it can break some APIs
        parsed = urlparse(current_url)
        encoded_path = quote(parsed.path, safe='/')
        encoded_query = quote(parsed.query, safe='=&%/,()[]')
        normalized_url = urlunparse((parsed.scheme, parsed.netloc, encoded_path, parsed.params, encoded_query, parsed.fragment))

        if not validate_import_url(current_url):
            raise requests.exceptions.RequestException(f"URL {current_url} is not allowed")
        
        visited_urls.add(current_url)
        
        # request with allow_redirects=False to check each step
        response = requests.request(method, normalized_url, allow_redirects=False, **kwargs)
        
        if allow_redirects and response.is_redirect:
            current_url = response.headers.get('Location')
            if not current_url:
                return response
            
            # handle relative redirects
            if not urlparse(current_url).netloc:
                parsed_orig = urlparse(response.url)
                current_url = f"{parsed_orig.scheme}://{parsed_orig.netloc}{current_url}"
                
            if current_url in visited_urls:
                raise requests.exceptions.RequestException("Circular redirect detected")
            
            # for redirects switch to GET for 301/302/303
            if response.status_code in [301, 302, 303]:
                method = 'GET'
        else:
            return response
            
    if len(visited_urls) >= max_redirects:
        raise requests.exceptions.RequestException("Too many redirects")
    
    return response


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
