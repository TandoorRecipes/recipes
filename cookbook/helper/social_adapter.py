from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.core.cache import caches


class TandoorSocialAccountAdapter(DefaultSocialAccountAdapter):

    def pre_social_login(self, request, sociallogin):
        """Warn when email matching is skipped due to unverified provider emails."""
        if sociallogin.is_existing:
            return

        from allauth.account.utils import filter_users_by_email
        from django.conf import settings

        if not getattr(settings, 'SOCIALACCOUNT_EMAIL_AUTHENTICATION', False):
            return

        unverified_emails = [e.email for e in sociallogin.email_addresses if not e.verified]
        for email in unverified_emails:
            existing_users = filter_users_by_email(email)
            if existing_users:
                provider_id = sociallogin.account.provider
                msg = (
                    f"Social login: provider '{provider_id}' returned unverified email '{email}' "
                    f"that matches existing user '{existing_users[0]}'. "
                    f"Email matching skipped — provider must mark emails as verified. "
                    f"A new account will be created instead."
                )
                print(msg)

                cache = caches['default']
                from django.utils import timezone
                error_entry = {
                    'provider': str(provider_id),
                    'error': 'unverified_email',
                    'exception': msg,
                    'timestamp': timezone.now().isoformat(),
                }
                errors = cache.get('social_login_errors', [])
                errors.insert(0, error_entry)
                cache.set('social_login_errors', errors[:50], timeout=60 * 60 * 24)
                break

        super().pre_social_login(request, sociallogin)

    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        """Log social login failures and store recent errors for the system page."""
        provider_id = getattr(provider, 'id', provider) if provider else 'unknown'
        error_entry = {
            'provider': str(provider_id),
            'error': str(error) if error else 'unknown',
            'exception': str(exception) if exception else None,
            'extra_context': {k: str(v) for k, v in (extra_context or {}).items()},
        }

        print(f"Social login error: provider={provider_id}, code={error}, exception={exception}")

        # Store last 50 errors in cache (visible on system page)
        cache = caches['default']
        cache_key = 'social_login_errors'
        errors = cache.get(cache_key, [])
        from django.utils import timezone
        error_entry['timestamp'] = timezone.now().isoformat()
        errors.insert(0, error_entry)
        cache.set(cache_key, errors[:50], timeout=60 * 60 * 24)

        super().on_authentication_error(request, provider, error=error, exception=exception, extra_context=extra_context)
