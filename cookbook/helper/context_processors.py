from django.conf import settings


def context_settings(request):
    return {
        'EMAIL_ENABLED': settings.EMAIL_HOST != '',
        'SIGNUP_ENABLED': settings.ENABLE_SIGNUP,
        'CAPTCHA_ENABLED': settings.HCAPTCHA_SITEKEY != '',
        'TERMS_URL': settings.TERMS_URL,
        'PRIVACY_URL': settings.PRIVACY_URL,
        'IMPRINT_URL': settings.IMPRINT_URL,
    }
