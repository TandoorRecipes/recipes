from django.utils import timezone
from django.db.models import Sum

from cookbook.models import AiLog


def get_monthly_token_usage(space):
    """
    returns the number of credits the space has used in the current month
    """
    return AiLog.objects.filter(space=space, credits_from_balance=False, created_at__month=timezone.now().month).aggregate(Sum('credit_cost'))['credit_cost__sum']


def has_monthly_token(space):
    """
    checks if the monthly credit limit has been exceeded
    """
    return get_monthly_token_usage(space) < space.ai_credits_monthly
