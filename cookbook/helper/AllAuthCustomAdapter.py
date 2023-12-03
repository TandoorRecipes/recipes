import datetime
from gettext import gettext as _

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.contrib import messages
from django.core.cache import caches

from cookbook.models import InviteLink


class AllAuthCustomAdapter(DefaultAccountAdapter):

    def is_open_for_signup(self, request):
        """
        Whether to allow sign-ups.
        """
        signup_token = False
        if 'signup_token' in request.session and InviteLink.objects.filter(
                valid_until__gte=datetime.datetime.today(), used_by=None, uuid=request.session['signup_token']).exists():
            signup_token = True

        if request.resolver_match.view_name == 'account_signup' and not settings.ENABLE_SIGNUP and not signup_token:
            return False
        elif request.resolver_match.view_name == 'socialaccount_signup' and len(settings.SOCIAL_PROVIDERS) < 1:
            return False
        else:
            return super(AllAuthCustomAdapter, self).is_open_for_signup(request)

    # disable password reset for now
    def send_mail(self, template_prefix, email, context):
        if settings.EMAIL_HOST != '':
            default = datetime.datetime.now()
            c = caches['default'].get_or_set(email, default, timeout=360)
            if c == default:
                try:
                    super(AllAuthCustomAdapter, self).send_mail(template_prefix, email, context)
                except Exception:  # dont fail signup just because confirmation mail could not be send
                    pass
            else:
                messages.add_message(self.request, messages.ERROR, _('In order to prevent spam, the requested email was not send. Please wait a few minutes and try again.'))
        else:
            pass
