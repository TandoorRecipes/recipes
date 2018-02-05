"""
Setting file for secret settings
imported by settings.py
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
# defined in secret settings to be able to use local sqlite db's
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '3*2&bz92brcnq^3c9b=_g%sc3b(i1j#rs*%1k67c8=cy2397j3'

# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

DROPBOX_API_KEY = "DhDcF7_Ik7EAAAAAAAA9Ez24v8-Tmf37UZcFqrLxZ8wTthIwc6Ko_oWU5WvxnSLM"
