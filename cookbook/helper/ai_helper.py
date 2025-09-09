from django.utils import timezone
from django.db.models import Sum

from cookbook.models import AiLog


def get_monthly_token_usage(space):
    """
    returns the number of credits the space has used in the current month
    """
    token_usage = AiLog.objects.filter(space=space, credits_from_balance=False, created_at__month=timezone.now().month).aggregate(Sum('credit_cost'))['credit_cost__sum']
    if token_usage is None:
        token_usage = 0
    return token_usage


def has_monthly_token(space):
    """
    checks if the monthly credit limit has been exceeded
    """
    return get_monthly_token_usage(space) < space.ai_credits_monthly


def can_perform_ai_request(space):
    return has_monthly_token(space) and space.ai_enabled