"""
Django settings for recipes project.

Generated by 'django-admin startproject' using Django 2.0.1.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""
import ast
import json
import mimetypes
import os
import re
import socket
import sys
import traceback

from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from dotenv import load_dotenv

def extract_bool(env_key, default):
    return bool(int(os.getenv(env_key, default)))

def extract_comma_list(env_key, default=None):
    if os.getenv(env_key):
        return [item.strip() for item in os.getenv(env_key).split(',')]
    else:
        if default:
            return [default]
        else:
            return []


load_dotenv()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT_NAME = os.getenv('SCRIPT_NAME', '')
# path for django_js_reverse to generate the javascript file containing all urls. Only done because the default command (collectstatic_js_reverse) fails to update the manifest
JS_REVERSE_OUTPUT_PATH = os.path.join(BASE_DIR, "cookbook/static/django_js_reverse")
JS_REVERSE_SCRIPT_PREFIX = os.getenv('JS_REVERSE_SCRIPT_PREFIX', SCRIPT_NAME)

STATIC_URL = os.getenv('STATIC_URL', '/static/')
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Get vars from .env files
SECRET_KEY = os.getenv('SECRET_KEY', 'INSECURE_STANDARD_KEY_SET_IN_ENV')

DEBUG = extract_bool('DEBUG', True)
DEBUG_TOOLBAR = extract_bool('DEBUG_TOOLBAR', True)

V3_BETA = extract_bool('V3_BETA', False)

LOG_LEVEL = os.getenv("LOG_LEVEL", "WARNING")

SOCIAL_DEFAULT_ACCESS = bool(int(os.getenv('SOCIAL_DEFAULT_ACCESS', False)))
SOCIAL_DEFAULT_GROUP = os.getenv('SOCIAL_DEFAULT_GROUP', 'guest')

SPACE_DEFAULT_MAX_RECIPES = int(os.getenv('SPACE_DEFAULT_MAX_RECIPES', 0))
SPACE_DEFAULT_MAX_USERS = int(os.getenv('SPACE_DEFAULT_MAX_USERS', 0))
SPACE_DEFAULT_MAX_FILES = int(os.getenv('SPACE_DEFAULT_MAX_FILES', 0))
SPACE_DEFAULT_ALLOW_SHARING = extract_bool('SPACE_DEFAULT_ALLOW_SHARING', True)

INTERNAL_IPS = extract_comma_list('INTERNAL_IPS', '127.0.0.1')

# Django Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    'formatters': {
        'verbose': {
            "format": "{threadName} {levelname} {asctime} {name} {message}",
            'style': '{',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            'formatter': 'verbose',
        },
    },
    "loggers": {
        'recipes': {
            'handlers': ['console'],
            'level': LOG_LEVEL,
        },
    },
}


# allow djangos wsgi server to server mediafiles
GUNICORN_MEDIA = extract_bool('GUNICORN_MEDIA', False)

if os.getenv('REVERSE_PROXY_AUTH') is not None:
    print('DEPRECATION WARNING: Environment var "REVERSE_PROXY_AUTH" is deprecated. Please use "REMOTE_USER_AUTH".')
    REMOTE_USER_AUTH = extract_bool('REVERSE_PROXY_AUTH', False)
else:
    REMOTE_USER_AUTH = extract_bool('REMOTE_USER_AUTH', False)

# default value for user preference 'comment'
COMMENT_PREF_DEFAULT = extract_bool('COMMENT_PREF_DEFAULT', True)
FRACTION_PREF_DEFAULT = extract_bool('FRACTION_PREF_DEFAULT', False)
KJ_PREF_DEFAULT = extract_bool('KJ_PREF_DEFAULT', False)
STICKY_NAV_PREF_DEFAULT = extract_bool('STICKY_NAV_PREF_DEFAULT', True)
MAX_OWNED_SPACES_PREF_DEFAULT = int(os.getenv('MAX_OWNED_SPACES_PREF_DEFAULT', 100))
UNAUTHENTICATED_THEME_FROM_SPACE = int(os.getenv('UNAUTHENTICATED_THEME_FROM_SPACE', 0))
FORCE_THEME_FROM_SPACE = int(os.getenv('FORCE_THEME_FROM_SPACE', 0))

# minimum interval that users can set for automatic sync of shopping lists
SHOPPING_MIN_AUTOSYNC_INTERVAL = int(os.getenv('SHOPPING_MIN_AUTOSYNC_INTERVAL', 5))

ALLOWED_HOSTS = extract_comma_list('ALLOWED_HOSTS', '*')
CSRF_TRUSTED_ORIGINS = extract_comma_list('CSRF_TRUSTED_ORIGINS')

if CORS_ORIGIN_ALLOW_ALL := os.getenv('CORS_ORIGIN_ALLOW_ALL') is not None:
    print('DEPRECATION WARNING: Environment var "CORS_ORIGIN_ALLOW_ALL" is deprecated. Please use "CORS_ALLOW_ALL_ORIGINS."')
    CORS_ALLOW_ALL_ORIGINS = CORS_ORIGIN_ALLOW_ALL
else:
    CORS_ALLOW_ALL_ORIGINS = extract_bool("CORS_ALLOW_ALL_ORIGINS", True)

LOGIN_REDIRECT_URL = "index"
LOGOUT_REDIRECT_URL = "index"
ACCOUNT_LOGOUT_REDIRECT_URL = "index"
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "index"

SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_AGE = 365 * 60 * 24 * 60

CRISPY_TEMPLATE_PACK = 'bootstrap4'
DJANGO_TABLES2_TEMPLATE = 'cookbook/templates/generic/table_template.html'
DJANGO_TABLES2_PAGE_RANGE = 8

HCAPTCHA_SITEKEY = os.getenv('HCAPTCHA_SITEKEY', '')
HCAPTCHA_SECRET = os.getenv('HCAPTCHA_SECRET', '')

FDC_API_KEY = os.getenv('FDC_API_KEY', 'DEMO_KEY')
GOOGLE_AI_API_KEY = os.getenv('GOOGLE_AI_API_KEY', '')

SHARING_ABUSE = extract_bool('SHARING_ABUSE', False)
SHARING_LIMIT = int(os.getenv('SHARING_LIMIT', 0))

DRF_THROTTLE_RECIPE_URL_IMPORT = os.getenv('DRF_THROTTLE_RECIPE_URL_IMPORT', '60/hour')

TERMS_URL = os.getenv('TERMS_URL', '')
PRIVACY_URL = os.getenv('PRIVACY_URL', '')
IMPRINT_URL = os.getenv('IMPRINT_URL', '')
HOSTED = extract_bool('HOSTED', False)

REDIS_HOST = os.getenv('REDIS_HOST', None)
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_USERNAME = os.getenv('REDIS_USERNAME', None)
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
REDIS_DATABASES = {
    'STATS': 0
}

MESSAGE_TAGS = {messages.ERROR: 'danger'}

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    'oauth2_provider',
    'django_prometheus',
    'django_tables2',
    'corsheaders',
    'crispy_forms',
    'crispy_bootstrap4',
    'rest_framework',
    'rest_framework.authtoken',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_cleanup.apps.CleanupConfig',
    'django_vite',
    'django_js_reverse',
    'hcaptcha',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'cookbook.apps.CookbookConfig',
    'treebeard',
]

PLUGINS_DIRECTORY = os.path.join(BASE_DIR, 'recipes', 'plugins')
PLUGINS = []
try:
    if os.path.isdir(PLUGINS_DIRECTORY):
        for d in os.listdir(PLUGINS_DIRECTORY):
            if d != '__pycache__':
                try:
                    apps_path = f'recipes.plugins.{d}.apps'
                    __import__(apps_path)
                    app_config_classname = dir(sys.modules[apps_path])[1]
                    plugin_module = f'recipes.plugins.{d}.apps.{app_config_classname}'
                    plugin_class = getattr(sys.modules[apps_path], app_config_classname)
                    plugin_disabled = False
                    if hasattr(plugin_class, 'disabled'):
                        plugin_disabled = plugin_class.disabled
                    if plugin_module not in INSTALLED_APPS and not plugin_disabled:
                        INSTALLED_APPS.append(plugin_module)

                        plugin_config = {
                            'name': plugin_class.verbose_name if hasattr(plugin_class, 'verbose_name') else plugin_class.name,
                            'version': plugin_class.VERSION if hasattr(plugin_class, 'VERSION') else 'unknown',
                            'website': plugin_class.website if hasattr(plugin_class, 'website') else '',
                            'github': plugin_class.github if hasattr(plugin_class, 'github') else '',
                            'module': f'recipes.plugins.{d}',
                            'base_path': os.path.join(BASE_DIR, 'recipes', 'plugins', d),
                            'base_url': plugin_class.base_url,
                            'bundle_name': plugin_class.bundle_name if hasattr(plugin_class, 'bundle_name') else '',
                            'api_router_name': plugin_class.api_router_name if hasattr(plugin_class, 'api_router_name') else '',
                            'nav_main': plugin_class.nav_main if hasattr(plugin_class, 'nav_main') else '',
                            'nav_dropdown': plugin_class.nav_dropdown if hasattr(plugin_class, 'nav_dropdown') else '',
                        }
                        PLUGINS.append(plugin_config)
                        print(f'PLUGIN {d} loaded')
                except Exception:
                    if DEBUG:
                        traceback.print_exc()
                        print(f'ERROR failed to initialize plugin {d}')
except Exception:
    if DEBUG:
        print('ERROR failed to initialize plugins')

SOCIAL_PROVIDERS = extract_comma_list('SOCIAL_PROVIDERS')
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
INSTALLED_APPS = INSTALLED_APPS + SOCIAL_PROVIDERS

ACCOUNT_SIGNUP_EMAIL_ENTER_TWICE = True
ACCOUNT_MAX_EMAIL_ADDRESSES = 3
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 90
ACCOUNT_LOGOUT_ON_GET = True

try:
    SOCIALACCOUNT_PROVIDERS = ast.literal_eval(os.getenv('SOCIALACCOUNT_PROVIDERS') if os.getenv('SOCIALACCOUNT_PROVIDERS') else '{}')
except ValueError:
    SOCIALACCOUNT_PROVIDERS = json.loads(os.getenv('SOCIALACCOUNT_PROVIDERS').replace("'", '"') if os.getenv('SOCIALACCOUNT_PROVIDERS') else '{}')

SESSION_COOKIE_DOMAIN = os.getenv('SESSION_COOKIE_DOMAIN', None)
SESSION_COOKIE_NAME = os.getenv('SESSION_COOKIE_NAME', 'sessionid')

ENABLE_SIGNUP = extract_bool('ENABLE_SIGNUP', False)

ENABLE_METRICS = extract_bool('ENABLE_METRICS', False)

ENABLE_PDF_EXPORT = extract_bool('ENABLE_PDF_EXPORT', False)
EXPORT_FILE_CACHE_DURATION = int(os.getenv('EXPORT_FILE_CACHE_DURATION', 600))

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'cookbook.helper.scope_middleware.ScopeMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

if DEBUG_TOOLBAR:
    MIDDLEWARE += ('debug_toolbar.middleware.DebugToolbarMiddleware', )
    INSTALLED_APPS += ('debug_toolbar', )

SORT_TREE_BY_NAME = extract_bool('SORT_TREE_BY_NAME', False)
DISABLE_TREE_FIX_STARTUP = extract_bool('DISABLE_TREE_FIX_STARTUP', False)

if extract_bool('SQL_DEBUG', False):
    MIDDLEWARE += ('recipes.middleware.SqlPrintingMiddleware', )

if ENABLE_METRICS:
    MIDDLEWARE += 'django_prometheus.middleware.PrometheusAfterMiddleware',
    INSTALLED_APPS += 'django_prometheus',

# Auth related settings
AUTHENTICATION_BACKENDS = []

# LDAP
LDAP_AUTH = bool(os.getenv('LDAP_AUTH', False))
if LDAP_AUTH:
    import ldap
    from django_auth_ldap.config import LDAPSearch

    AUTHENTICATION_BACKENDS.append('django_auth_ldap.backend.LDAPBackend')
    AUTH_LDAP_SERVER_URI = os.getenv('AUTH_LDAP_SERVER_URI')
    AUTH_LDAP_START_TLS = extract_bool('AUTH_LDAP_START_TLS', False)
    AUTH_LDAP_BIND_DN = os.getenv('AUTH_LDAP_BIND_DN')
    AUTH_LDAP_BIND_PASSWORD = os.getenv('AUTH_LDAP_BIND_PASSWORD')
    AUTH_LDAP_USER_SEARCH = LDAPSearch(
        os.getenv('AUTH_LDAP_USER_SEARCH_BASE_DN'),
        ldap.SCOPE_SUBTREE,
        os.getenv('AUTH_LDAP_USER_SEARCH_FILTER_STR', '(uid=%(user)s)'),
    )
    AUTH_LDAP_USER_ATTR_MAP = ast.literal_eval(os.getenv('AUTH_LDAP_USER_ATTR_MAP')) if os.getenv('AUTH_LDAP_USER_ATTR_MAP') else {
        'first_name': 'givenName',
        'last_name': 'sn',
        'email': 'mail',
    }
    AUTH_LDAP_ALWAYS_UPDATE_USER = extract_bool('AUTH_LDAP_ALWAYS_UPDATE_USER', True)
    AUTH_LDAP_CACHE_TIMEOUT = int(os.getenv('AUTH_LDAP_CACHE_TIMEOUT', 3600))
    if 'AUTH_LDAP_TLS_CACERTFILE' in os.environ:
        AUTH_LDAP_GLOBAL_OPTIONS = {ldap.OPT_X_TLS_CACERTFILE: os.getenv('AUTH_LDAP_TLS_CACERTFILE')}
    if DEBUG:
        LOGGING["loggers"]["django_auth_ldap"] = {
            "level": "DEBUG",
            "handlers": ["console"]
        }


AUTHENTICATION_BACKENDS += [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# django allauth site id
SITE_ID = int(os.getenv('ALLAUTH_SITE_ID', 1))

ACCOUNT_ADAPTER = 'cookbook.helper.AllAuthCustomAdapter'

if REMOTE_USER_AUTH:
    MIDDLEWARE.insert(8, 'recipes.middleware.CustomRemoteUser')
    AUTHENTICATION_BACKENDS.append('django.contrib.auth.backends.RemoteUserBackend')

# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'
    },
]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
X_FRAME_OPTIONS = "SAMEORIGIN"

OAUTH2_PROVIDER = {'SCOPES': {'read': 'Read scope', 'write': 'Write scope', 'bookmarklet': 'only access to bookmarklet'}}
READ_SCOPE = 'read'
WRITE_SCOPE = 'write'

##################################################################
####### change DEFAULT_SCHEMA_CLASS below to regenerate legacy API
##################################################################

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication', 'oauth2_provider.contrib.rest_framework.OAuth2Authentication', 'rest_framework.authentication.BasicAuthentication'
    ),
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # 'DEFAULT_SCHEMA_CLASS': 'cookbook.helper.drf_spectacular_hooks.LegacySchema',
    'COERCE_DECIMAL_TO_STRING': False,
}

##################################################################
####### change DEFAULT_SCHEMA_CLASS above to regenerate legacy API
##################################################################

SPECTACULAR_SETTINGS = {
    'TITLE': 'Tandoor',
    'DESCRIPTION': 'Tandoor API Docs',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': False,
    'ENUM_ADD_EXPLICIT_BLANK_NULL_CHOICE': False,
    "AUTHENTICATION_WHITELIST": [],
    "APPEND_COMPONENTS": {
        "securitySchemes": {
            "ApiKeyAuth": {
                "type": "apiKey",
                "in": "header",
                "name": "Authorization",
            }
        }
    },
    "SECURITY": [{
        "ApiKeyAuth": []
    }],
    'SWAGGER_UI_DIST': 'SIDECAR',
    'SWAGGER_UI_FAVICON_HREF': 'SIDECAR',
    'REDOC_DIST': 'SIDECAR',
    'EXTENSIONS_INFO': {
        "x-logo": {
            "url": f"{STATIC_URL}assets/brand_logo.svg",
            "backgroundColor": "#FFFFFF",
            "altText": "Tandoor logo",
            'href': '/'
        }
    },
    'CAMELIZE_NAMES': True,
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
        "hideDownloadButton": False,
        'schemaExpansionLevel': 'all',
        'showExtensions': True
    },
    'POSTPROCESSING_HOOKS': ['drf_spectacular.hooks.postprocess_schema_enums', 'cookbook.helper.drf_spectacular_hooks.custom_postprocessing_hook']
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
                'cookbook.helper.context_processors.context_settings',
            ],
        },
    },
]

WSGI_APPLICATION = 'recipes.wsgi.application'

# Database
# Load settings from env files
DATABASE_URL = os.getenv('DATABASE_URL', None)
DB_OPTIONS = os.getenv('DB_OPTIONS', None)
DB_ENGINE = os.getenv('DB_ENGINE', None)
POSTGRES_HOST = os.getenv('POSTGRES_HOST', None)
POSTGRES_PORT = os.getenv('POSTGRES_PORT', None)
POSTGRES_USER = os.getenv('POSTGRES_USER', None)
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', None)
POSTGRES_DB = os.getenv('POSTGRES_DB', None)


def setup_database(db_url=None, db_options=None, db_engine=None, pg_host=None, pg_port=None, pg_user=None, pg_password=None, pg_db=None):
    global DATABASE_URL, DB_ENGINE, DB_OPTIONS, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

    DATABASE_URL = db_url or DATABASE_URL
    DB_OPTIONS = db_options or DB_OPTIONS
    DB_ENGINE = db_engine or DB_ENGINE
    POSTGRES_HOST = pg_host or POSTGRES_HOST
    POSTGRES_PORT = pg_port or POSTGRES_PORT
    POSTGRES_USER = pg_user or POSTGRES_USER
    POSTGRES_PASSWORD = pg_password or POSTGRES_PASSWORD
    POSTGRES_DB = pg_db or POSTGRES_DB

    if DATABASE_URL:
        match = re.match(r'(?P<schema>\w+):\/\/(?:(?P<user>[\w\d_-]+)(?::(?P<password>[^@]+))?@)?(?P<host>[^:/]+)(?::(?P<port>\d+))?(?:/(?P<database>[\w\d/._-]+))?', DATABASE_URL)
        settings = match.groupdict()
        schema = settings['schema']
        if schema.startswith('postgres'):
            engine = 'django.db.backends.postgresql'
        elif schema == 'sqlite':
            if (db_path := os.path.dirname(settings['database'])) and not os.path.exists(db_path):
                os.makedirs(db_path)
            engine = 'django.db.backends.sqlite3'
        else:
            raise Exception("Unsupported database schema: '%s'" % schema)

        DATABASES = {
            'default': {
                'ENGINE': engine,
                'OPTIONS': ast.literal_eval(DB_OPTIONS) if DB_OPTIONS else {},
                'HOST': settings['host'],
                'PORT': settings['port'],
                'USER': settings['user'],
                'PASSWORD': settings['password'],
                'NAME': settings['database'],
                'CONN_MAX_AGE': 600,
            }
        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': DB_ENGINE if DB_ENGINE else 'django.db.backends.sqlite3',
                'OPTIONS': ast.literal_eval(DB_OPTIONS) if DB_OPTIONS else {},
                'HOST': POSTGRES_HOST,
                'PORT': POSTGRES_PORT,
                'USER': POSTGRES_USER,
                'PASSWORD': POSTGRES_PASSWORD,
                'NAME': POSTGRES_DB if POSTGRES_DB else 'db.sqlite3',
                'CONN_MAX_AGE': 60,
            }
        }
    return DATABASES


DATABASES = setup_database()

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'default',
    }
}

# Vue webpack settings
VUE_DIR = os.path.join(BASE_DIR, 'vue')

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'vue/',  # must end with slash
        'STATS_FILE': os.path.join(VUE_DIR, 'webpack-stats.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None,
        'IGNORE': [r'.+\.hot-update.js', r'.+\.map'],
    },
}

for p in PLUGINS:
    if p['bundle_name'] != '':
        WEBPACK_LOADER[p['bundle_name']] = {
            'CACHE': not DEBUG,
            'BUNDLE_DIR_NAME': 'vue/',  # must end with slash
            'STATS_FILE': os.path.join(p["base_path"], 'vue', 'webpack-stats.json'),
            'POLL_INTERVAL': 0.1,
            'TIMEOUT': None,
            'IGNORE': [r'.+\.hot-update.js', r'.+\.map'],
        }

DJANGO_VITE = {
    "default": {
        "dev_mode": False,
        "static_url_prefix": 'vue3',
        "dev_server_port": 5173,
        "dev_server_host": os.getenv('DJANGO_VITE_DEV_SERVER_HOST', 'localhost'),
    },
}

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.settimeout(0.001)
    try:
        s.connect((DJANGO_VITE['default']['dev_server_host'], DJANGO_VITE['default']['dev_server_port']))
        if DEBUG:
            print("Vite Dev Server is running")
            DJANGO_VITE['default']['dev_mode'] = True
    except Exception:
        print("Running django-vite in production mode (no HMR)")

# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en'

if os.getenv('TIMEZONE') is not None:
    print('DEPRECATION WARNING: Environment var "TIMEZONE" is deprecated. Please use "TZ" instead.')
    TIME_ZONE = os.getenv('TIMEZONE') if os.getenv('TIMEZONE') else 'Europe/Berlin'
else:
    TIME_ZONE = os.getenv('TZ') if os.getenv('TZ') else 'Europe/Berlin'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LANGUAGES = [
    ('hy', _('Armenian ')),
    ('bg', _('Bulgarian')),
    ('ca', _('Catalan')),
    ('cs', _('Czech')),
    ('da', _('Danish')),
    ('nl', _('Dutch')),
    ('en', _('English')),
    ('fr', _('French')),
    ('de', _('German')),
    ('hu', _('Hungarian')),
    ('it', _('Italian')),
    ('lv', _('Latvian')),
    ('nb', _('Norwegian ')),
    ('pl', _('Polish')),
    ('ru', _('Russian')),
    ('es', _('Spanish')),
    ('sv', _('Swedish')),
]

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

AWS_ENABLED = True if os.getenv('S3_ACCESS_KEY', False) else False

if os.getenv('S3_ACCESS_KEY', ''):
    DEFAULT_FILE_STORAGE = 'cookbook.helper.CustomStorageClass.CachedS3Boto3Storage'

    AWS_ACCESS_KEY_ID = os.getenv('S3_ACCESS_KEY', '')
    AWS_SECRET_ACCESS_KEY = os.getenv('S3_SECRET_ACCESS_KEY', '')
    AWS_STORAGE_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', '')
    AWS_QUERYSTRING_AUTH = extract_bool('S3_QUERYSTRING_AUTH', True)
    AWS_QUERYSTRING_EXPIRE = int(os.getenv('S3_QUERYSTRING_EXPIRE', 3600))
    AWS_S3_SIGNATURE_VERSION = os.getenv('S3_SIGNATURE_VERSION', 's3v4')
    AWS_S3_REGION_NAME = os.getenv('S3_REGION_NAME', None)

    if os.getenv('S3_ENDPOINT_URL', ''):
        AWS_S3_ENDPOINT_URL = os.getenv('S3_ENDPOINT_URL', '')
    if os.getenv('S3_CUSTOM_DOMAIN', ''):
        AWS_S3_CUSTOM_DOMAIN = os.getenv('S3_CUSTOM_DOMAIN', '')

    MEDIA_URL = os.getenv('MEDIA_URL', '/media/')
    MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(BASE_DIR, "mediafiles"))
else:
    MEDIA_URL = os.getenv('MEDIA_URL', '/media/')
    MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(BASE_DIR, "mediafiles"))

# Serve static files with gzip
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# settings for cross site origin (CORS)
# all origins allowed to support bookmarklet
# all of this may or may not work with nginx or other web servers
# TODO make this user configurable - enable or disable bookmarklets
# TODO since token auth is enabled - this all should be https by default
CORS_ORIGIN_ALLOW_ALL = True

# enable CORS only for bookmarklet api and only for posts, get and options
CORS_URLS_REGEX = r'^/api/bookmarklet-import.*$'
CORS_ALLOW_METHODS = ['GET', 'OPTIONS', 'POST']
# future versions of django will make undeclared default django.db.models.BigAutoField which will force migrations on all models
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 25))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = extract_bool('EMAIL_USE_TLS', False)
EMAIL_USE_SSL = extract_bool('EMAIL_USE_SSL', False)
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'webmaster@localhost')
ACCOUNT_EMAIL_SUBJECT_PREFIX = os.getenv('ACCOUNT_EMAIL_SUBJECT_PREFIX', '[Tandoor Recipes] ')  # allauth sender prefix

# ACCOUNT_SIGNUP_FORM_CLASS = 'cookbook.forms.AllAuthSignupForm'
ACCOUNT_FORMS = {'signup': 'cookbook.forms.AllAuthSignupForm', 'reset_password': 'cookbook.forms.CustomPasswordResetForm'}

ACCOUNT_EMAIL_UNKNOWN_ACCOUNTS = False
ACCOUNT_RATE_LIMITS = {
    "change_password": "1/m/user",
    "reset_password": "1/m/ip,1/m/key",
    "reset_password_from_key": "1/m/ip",
    "signup": "5/m/ip",
    "login": "5/m/ip",
}

DISABLE_EXTERNAL_CONNECTORS = extract_bool('DISABLE_EXTERNAL_CONNECTORS', False)
EXTERNAL_CONNECTORS_QUEUE_SIZE = int(os.getenv('EXTERNAL_CONNECTORS_QUEUE_SIZE', 100))

# ACCOUNT_SIGNUP_FORM_CLASS = 'cookbook.forms.AllAuthSignupForm'
ACCOUNT_FORMS = {'signup': 'cookbook.forms.AllAuthSignupForm', 'reset_password': 'cookbook.forms.CustomPasswordResetForm'}

ACCOUNT_EMAIL_UNKNOWN_ACCOUNTS = False
ACCOUNT_RATE_LIMITS = {
    "change_password": "1/m/user",
    "reset_password": "1/m/ip,1/m/key",
    "reset_password_from_key": "1/m/ip",
    "signup": "5/m/ip",
    "login": "5/m/ip",
}

mimetypes.add_type("text/javascript", ".js", True)
