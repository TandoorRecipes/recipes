from django.db.models import Func
from thefuzz import fuzz
from thefuzz import process as fuzz_process
from requests_hardened import Config, Manager


class Round(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 0)'


def str2bool(v):
    if isinstance(v, bool) or v is None:
        return v
    else:
        return v.lower() in ("yes", "true", "1")


def safe_request(method, url, **kwargs):
    """
    use requests-hardened to make external requests SSRF safe
    """
    http_manager = Manager(
        Config(
            default_timeout=(2, 10),
            never_redirect=False,
            # Enable SSRF IP filter
            ip_filter_enable=True,
            ip_filter_allow_loopback_ips=False,
        )
    )
    return http_manager.send_request(method, url, **kwargs)


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
