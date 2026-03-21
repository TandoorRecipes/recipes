import json
import os
import re
from datetime import timedelta

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.utils import timezone

_ERROR_FILE = os.path.join(settings.MEDIA_ROOT, '.social_login_errors.json')
_MAX_ERRORS = 50
_MAX_AGE_HOURS = 24


def _mask_email(email):
    """Mask email for safe display in logs and cache: u***@example.com"""
    local, _, domain = email.partition('@')
    if not domain:
        return '***'
    return local[0] + '***@' + domain if local else '***@' + domain


def get_social_login_errors():
    """Read stored social login errors, pruning entries older than 24h."""
    try:
        with open(_ERROR_FILE) as f:
            errors = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    cutoff = (timezone.now() - timedelta(hours=_MAX_AGE_HOURS)).isoformat()
    return [e for e in errors if e.get('timestamp', '') > cutoff]


def _store_error(error_entry):
    """Append an error entry to the stored social login errors (max 50, 24h TTL)."""
    error_entry['timestamp'] = timezone.now().isoformat()
    errors = get_social_login_errors()
    errors.insert(0, error_entry)
    errors = errors[:_MAX_ERRORS]
    try:
        with open(_ERROR_FILE, 'w') as f:
            json.dump(errors, f)
    except OSError:
        pass


class TandoorSocialAccountAdapter(DefaultSocialAccountAdapter):

    def pre_social_login(self, request, sociallogin):
        """Warn when email matching is skipped due to unverified provider emails."""
        if sociallogin.is_existing:
            return

        from allauth.account.utils import filter_users_by_email

        if not getattr(settings, 'SOCIALACCOUNT_EMAIL_AUTHENTICATION', False):
            return

        unverified_emails = [e.email for e in sociallogin.email_addresses if not e.verified]
        for email in unverified_emails:
            existing_users = filter_users_by_email(email)
            if existing_users:
                provider_id = sociallogin.account.provider
                masked = _mask_email(email)
                msg = (
                    f"Social login: provider '{provider_id}' returned unverified email '{masked}' "
                    f"that matches an existing user. "
                    f"Email matching skipped — provider must mark emails as verified. "
                    f"A new account will be created instead."
                )
                print(msg)
                _store_error({
                    'provider': str(provider_id),
                    'error': 'unverified_email',
                    'exception': msg,
                })
                break

        super().pre_social_login(request, sociallogin)

    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        """Log social login failures and store recent errors for the system page."""
        provider_id = getattr(provider, 'id', provider) if provider else 'unknown'

        # Build exception detail, including chained causes (e.g. JWT decode errors behind "invalid_token")
        exception_parts = []
        exc = exception
        while exc is not None:
            exception_parts.append(f"{type(exc).__name__}: {exc}")
            exc = exc.__cause__
        exception_str = ' → '.join(exception_parts) if exception_parts else None

        # Mask email addresses in exception details before caching
        if exception_str:
            exception_str = re.sub(r'[\w.+-]+@[\w-]+\.[\w.-]+', lambda m: _mask_email(m.group()), exception_str)

        print(f"Social login error: provider={provider_id}, code={error}, exception={exception_str}")

        _store_error({
            'provider': str(provider_id),
            'error': str(error) if error else 'unknown',
            'exception': exception_str,
            'extra_context': {k: str(v) for k, v in (extra_context or {}).items()},
        })

        super().on_authentication_error(request, provider, error=error, exception=exception, extra_context=extra_context)
