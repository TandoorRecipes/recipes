from decimal import Decimal

from django.utils import timezone
from django.db.models import Sum
from litellm import CustomLogger

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
    return (has_monthly_token(space) or space.ai_credits_balance > 0) and space.ai_enabled


class AiCallbackHandler(CustomLogger):
    space = None
    user = None
    ai_provider = None

    def __init__(self, space, user, ai_provider):
        super().__init__()
        self.space = space
        self.user = user
        self.ai_provider = ai_provider

    def log_pre_api_call(self, model, messages, kwargs):
        pass

    def log_post_api_call(self, kwargs, response_obj, start_time, end_time):
        pass

    def log_success_event(self, kwargs, response_obj, start_time, end_time):
        self.create_ai_log(kwargs, response_obj, start_time, end_time)

    def log_failure_event(self, kwargs, response_obj, start_time, end_time):
        self.create_ai_log(kwargs, response_obj, start_time, end_time)

    def create_ai_log(self, kwargs, response_obj, start_time, end_time):
        credit_cost = 0
        credits_from_balance = False
        if self.ai_provider.log_credit_cost:
            credit_cost = kwargs.get("response_cost", 0) * 100

        if (not has_monthly_token(self.space)) and self.space.ai_credits_balance > 0:
            remaining_balance = self.space.ai_credits_balance - Decimal(str(credit_cost))
            if remaining_balance < 0:
                remaining_balance = 0

            self.space.ai_credits_balance = remaining_balance
            credits_from_balance = True
            self.space.save()

        AiLog.objects.create(
            created_by=self.user,
            space=self.space,
            ai_provider=self.ai_provider,
            start_time=start_time,
            end_time=end_time,
            input_tokens=response_obj['usage']['prompt_tokens'],
            output_tokens=response_obj['usage']['completion_tokens'],
            function=AiLog.F_FILE_IMPORT,
            credit_cost=credit_cost,
            credits_from_balance=credits_from_balance,
        )
