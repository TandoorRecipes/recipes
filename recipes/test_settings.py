from recipes.settings import *  # noqa: F403
import os

DATABASES = setup_database(  # noqa: F405
    db_url=os.getenv('TEST_DATABASE_URL'),
    db_options=os.getenv('TEST_DB_OPTIONS'),
    db_engine=os.getenv('TEST_DB_ENGINE'),
    pg_host=os.getenv('TEST_POSTGRES_HOST'),
    pg_port=os.getenv('TEST_POSTGRES_PORT'),
    pg_user=os.getenv('TEST_POSTGRES_PORT'),
    pg_password=os.getenv('TEST_POSTGRES_PASSWORD'),
    pg_db=os.getenv('TEST_POSTGRES_DB')
    )


UNINSTALL_MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 'django.middleware.security.SecurityMiddleware', 'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware', 'django.middleware.csrf.CsrfViewMiddleware', 
    'django.middleware.locale.LocaleMiddleware', 'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

UNINSTALL_INSTALLED_APPS = [
    'django.contrib.messages', 'django.contrib.sites', 'django.contrib.staticfiles', 'corsheaders', 'django_cleanup.apps.CleanupConfig', 'django_js_reverse', 'hcaptcha']

# disable extras not needed for testing
for x in UNINSTALL_MIDDLEWARE:
    MIDDLEWARE.remove(x)  # noqa: F405

for y in UNINSTALL_INSTALLED_APPS:
    INSTALLED_APPS.remove(y)  # noqa: F405
