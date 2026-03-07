from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.core.cache import caches


class TandoorSocialAccountAdapter(DefaultSocialAccountAdapter):

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
