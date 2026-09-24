import datetime
import logging

from gettext import gettext as _

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.contrib import messages
from django.core.cache import caches
from django.utils import timezone
from django_scopes import scopes_disabled

from cookbook.helper.permission_helper import create_space_for_user
from cookbook.models import InviteLink

logger = logging.getLogger(__name__)


class AllAuthCustomAdapter(DefaultAccountAdapter):

    def is_open_for_signup(self, request):
        """
        Whether to allow sign-ups.
        """
        view_name = getattr(request.resolver_match, 'view_name', '') or ''

        # Social signup form: allow when social providers are configured
        if view_name == 'socialaccount_signup':
            return len(settings.SOCIAL_PROVIDERS) > 0

        # Local signup form: require ENABLE_SIGNUP or a valid invite token
        if view_name == 'account_signup':
            signup_token = False
            with scopes_disabled():
                if 'signup_token' in request.session and InviteLink.objects.filter(
                        valid_until__gte=timezone.now().date(), used_by=None, uuid=request.session['signup_token']).exists():
                    signup_token = True
            if not settings.ENABLE_SIGNUP and not signup_token:
                return False

        # OAuth callbacks, headless, and other flows: defer to default
        return super(AllAuthCustomAdapter, self).is_open_for_signup(request)


    def save_user(self, request, user, form, commit: bool = True):
        """
        create a default space for new users
        """
        user = super(AllAuthCustomAdapter, self).save_user(request, user, form)
        create_space_for_user(user)
        return user

    def send_mail(self, template_prefix, email, context):
        if settings.EMAIL_HOST != '':
            try:
                super(AllAuthCustomAdapter, self).send_mail(template_prefix, email, context)
            except Exception as e:  # dont fail signup just because confirmation mail could not be send
                logger.error(f"Failed to send {template_prefix} email to {email}: {type(e).__name__}: {e}")
        else:
            logger.debug(f"Email not sent (EMAIL_HOST not configured): {template_prefix} to {email}")
