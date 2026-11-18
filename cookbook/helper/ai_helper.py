import ipaddress
import re
import socket
from decimal import Decimal
from urllib.parse import urlparse

from django.utils import timezone
from django.db.models import Sum
from litellm import CustomLogger, get_llm_provider

from cookbook.models import AiLog
from recipes import settings


PUBLIC_DEFAULT_PROVIDERS = {
    'openai',
    'text-completion-openai',
    'anthropic',
    'gemini',
    'vertex_ai',
    'bedrock',
    'azure',
    'azure_ai',
    'cohere',
    'cohere_chat',
    'openrouter',
    'mistral',
    'ai21',
    'huggingface',
    'watsonx',
    'sagemaker',
}


def _is_local_url(url):
    host = urlparse(url).hostname
    if not host:
        return True

    try:
        addresses = [ipaddress.ip_address(host)]
    except ValueError:
        try:
            resolved_addresses = socket.getaddrinfo(host, None)
            addresses = [ipaddress.ip_address(result[4][0]) for result in resolved_addresses]
        except (OSError, ValueError, IndexError):
            return True

    return not addresses or any(not address.is_global for address in addresses)


def get_ai_api_base(ai_provider):
    if ai_provider.url:
        if ai_provider.url not in settings.AI_ALLOWED_URLS:
            raise ValueError(f'AI provider URL not allowed: {ai_provider.url}')
        return ai_provider.url

    try:
        _, provider, _, api_base = get_llm_provider(model=ai_provider.model_name)
    except Exception as error:
        raise ValueError(f'Unknown AI model/provider: {ai_provider.model_name}') from error

    if api_base:
        if api_base not in settings.AI_ALLOWED_URLS and _is_local_url(api_base):
            raise ValueError(f'AI provider "{provider}" uses local URL {api_base}; add it to AI_ALLOWED_URLS')
        return api_base

    if provider not in PUBLIC_DEFAULT_PROVIDERS:
        raise ValueError(f'AI provider "{provider}" requires an explicit, allowed URL')

    return None


def build_ai_request(ai_provider, messages, **extra):
    ai_request = {
        'api_key': ai_provider.api_key,
        'model': ai_provider.model_name,
        'messages': messages,
        **extra,
    }
    api_base = get_ai_api_base(ai_provider)
    if api_base:
        ai_request['api_base'] = api_base
    return ai_request


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


def strip_json_fences(text):
    """
    extracts the content of a Markdown code fence (```json ... ```) from an AI response.
    Some providers (e.g. Anthropic Claude via LiteLLM) wrap JSON in fences even when
    response_format json_object is requested, which breaks json.loads().
    The fenced block is also found if the model adds explanatory text before or after it.
    """
    stripped = text.strip()
    block = re.search(r'```[\w-]*[ \t]*\r?\n(.*?)\r?\n[ \t]*```', stripped, re.DOTALL)
    if block:
        return block.group(1).strip()
    match = re.fullmatch(r'```[\w-]*[ \t]*\n?(.*?)\n?[ \t]*(?:```)?', stripped, re.DOTALL)
    return match.group(1).strip() if stripped.startswith('```') and match else text


def can_perform_ai_request(space):
    return (has_monthly_token(space) or space.ai_credits_balance > 0) and space.ai_enabled


class AiCallbackHandler(CustomLogger):
    space = None
    user = None
    ai_provider = None
    function = None

    def __init__(self, space, user, ai_provider, function):
        super().__init__()
        self.space = space
        self.user = user
        self.ai_provider = ai_provider
        self.function = function

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
                if settings.HOSTED and self.space.ai_credits_monthly == 0:
                    self.space.ai_enabled = False

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
            function=self.function,
            credit_cost=credit_cost,
            credits_from_balance=credits_from_balance,
        )
