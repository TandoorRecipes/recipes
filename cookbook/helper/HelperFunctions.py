from django.db.models import Func


class Round(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 0)'


def str2bool(v):
    if type(v) == bool or v is None:
        return v
    else:
        return v.lower() in ("yes", "true", "1")
