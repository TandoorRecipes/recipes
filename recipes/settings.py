"""
Django settings for recipes project.

Generated by 'django-admin startproject' using Django 2.0.1.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""
import os
import random
import string

from django.contrib import messages
from dotenv import load_dotenv
from django.utils.translation import gettext_lazy as _

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Get vars from .env files
SECRET_KEY = os.getenv('SECRET_KEY') if os.getenv('SECRET_KEY') else 'INSECURE_STANDARD_KEY_SET_IN_ENV'

DEBUG = bool(int(os.getenv('DEBUG', True)))

# allow djangos wsgi server to server mediafiles
GUNICORN_MEDIA = bool(int(os.getenv('GUNICORN_MEDIA', True)))

REVERSE_PROXY_AUTH = bool(int(os.getenv('REVERSE_PROXY_AUTH', False)))

# default value for user preference 'comment'
COMMENT_PREF_DEFAULT = bool(int(os.getenv('COMMENT_PREF_DEFAULT', True)))

# minimum interval that users can set for automatic sync of shopping lists
SHOPPING_MIN_AUTOSYNC_INTERVAL = int(os.getenv('SHOPPING_MIN_AUTOSYNC_INTERVAL', 5))

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS').split(',') if os.getenv('ALLOWED_HOSTS') else ['*']

CORS_ORIGIN_ALLOW_ALL = True

LOGIN_REDIRECT_URL = "index"
LOGOUT_REDIRECT_URL = "index"

SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_AGE = 365 * 60 * 24 * 60

CRISPY_TEMPLATE_PACK = 'bootstrap4'
DJANGO_TABLES2_TEMPLATE = 'cookbook/templates/generic/table_template.html'
DJANGO_TABLES2_PAGE_RANGE = 8

MESSAGE_TAGS = {
    messages.ERROR: 'danger'
}

# Application definition

INSTALLED_APPS = [
    'dal',
    'dal_select2',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_tables2',
    'django_filters',
    'crispy_forms',
    'emoji_picker',
    'rest_framework',
    'rest_framework.authtoken',
    'django_cleanup.apps.CleanupConfig',
    'cookbook.apps.CookbookConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

if REVERSE_PROXY_AUTH:
    MIDDLEWARE.append('recipes.middleware.CustomRemoteUser')
    AUTHENTICATION_BACKENDS.append('django.contrib.auth.backends.RemoteUserBackend')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

ROOT_URLCONF = 'recipes.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), os.path.join(BASE_DIR, 'cookbook', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'recipes.wsgi.application'

# Database
# Load settings from env files
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE') if os.getenv('DB_ENGINE') else 'django.db.backends.sqlite3',
        'HOST': os.getenv('POSTGRES_HOST'),
        'PORT': os.getenv('POSTGRES_PORT'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'NAME': os.getenv('POSTGRES_DB') if os.getenv('POSTGRES_DB') else 'db.sqlite3',
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en'

TIME_ZONE = 'Europe/Berlin'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LANGUAGES = [
    ('en', _('English')),
    ('de', _('German')),
    ('nl', _('Dutch')),
    ('fr', _('French')),
]

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, "mediafiles")

# Serve static files with gzip
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
