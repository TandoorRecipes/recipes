from django.conf import settings


def context_settings(request):
    return {
        'EMAIL_ENABLED': settings.EMAIL_HOST != '',
        'SIGNUP_ENABLED': settings.ENABLE_SIGNUP,
        'CAPTCHA_ENABLED': settings.HCAPTCHA_SITEKEY != '',
        'HOSTED': settings.HOSTED,
        'TERMS_URL': settings.TERMS_URL,
        'PRIVACY_URL': settings.PRIVACY_URL,
        'IMPRINT_URL': settings.IMPRINT_URL,
        'SHOPPING_MIN_AUTOSYNC_INTERVAL': settings.SHOPPING_MIN_AUTOSYNC_INTERVAL,
        'DISABLE_EXTERNAL_CONNECTORS': settings.DISABLE_EXTERNAL_CONNECTORS,
    }
