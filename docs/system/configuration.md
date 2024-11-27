This page describes all configuration options for the application
server. All settings must be configured in the environment of the
application server, usually by adding them to the `.env` file.

## Required Settings

The following settings need to be set appropriately for your installation.
They are included in the default `env.template`.

### Secret Key

Random secret key (at least 50 characters), use for example `base64 /dev/urandom | head -c50` to generate one.
It is used internally by django for various signing/cryptographic operations and **should be kept secret**.
See [Django Docs](https://docs.djangoproject.com/en/5.0/ref/settings/#std-setting-SECRET_KEY)

```
SECRET_KEY=#$tp%v6*(*ba01wcz(ip(i5vfz8z$f%qdio&q@anr1#$=%(m4c
```

Alternatively you can point to a file containing just the secret key value. If using containers make sure the file is
persistent and available inside the container.

```
SECRET_KEY_FILE=/path/to/file.txt

// contents of file
#$tp%v6*(*ba01wcz(ip(i5vfz8z$f%qdio&q@anr1#$=%(m4c
```

#### Allowed Hosts

> default `*` - options: `recipes.mydomain.com,cooking.mydomain.com,...` (comma seperated domain/ip list)

Security setting to prevent HTTP Host Header Attacks,
see [Django docs](https://docs.djangoproject.com/en/5.0/ref/settings/#allowed-hosts).
Some proxies require `*` (default) but it should be set to the actual host(s).

```
ALLOWED_HOSTS=recipes.mydomain.com
```

### Database

Multiple parameters are required to configure the database.
*Note: You can setup parameters for a test database by defining all of the parameters preceded by `TEST_` e.g. TEST_DB_ENGINE=*

| Var               | Options                                                            | Description                                                             |
|-------------------|--------------------------------------------------------------------|-------------------------------------------------------------------------|
| DB_ENGINE         | django.db.backends.postgresql (default) django.db.backends.sqlite3 | Type of database connection. Production should always use postgresql.   |
| POSTGRES_HOST     | any                                                                | Used to connect to database server. Use container name in docker setup. |
| POSTGRES_DB       | any                                                                | Name of database.                                                       |
| POSTGRES_PORT     | 1-65535                                                            | Port of database, Postgresql default `5432`                             |
| POSTGRES_USER     | any                                                                | Username for database connection.                                       |
| POSTGRES_PASSWORD | any                                                                | Password for database connection.                                       |

#### Password file

> default `None` - options: file path

Path to file containing the database password. Overrides `POSTGRES_PASSWORD`. Only applied when using Docker (or other
setups running `boot.sh`)

```
POSTGRES_PASSWORD_FILE=
```

#### Connection String

> default `None` - options: according to database specifications

Instead of configuring the connection using multiple individual environment parameters, you can use a connection string.
The connection string will override all other database settings.

```
DATABASE_URL = engine://username:password@host:port/dbname
```

#### Connection Options

> default `{}` - options: according to database specifications

Additional connection options can be set as shown in the example below.

```
DB_OPTIONS={"sslmode":"require"}
```

## Optional Settings

All optional settings are, as their name says, optional and can be ignored safely. If you want to know more about what
you can do with them take a look through this page. I recommend using the categories to guide yourself.

### Server configuration

Configuration options for serving related services.

#### Port

> default `8080` - options: `1-65535`

Port for gunicorn to bind to. Should not be changed if using docker stack with reverse proxy.

```
TANDOOR_PORT=8080
```


#### URL Path

> default `None` - options: `/custom/url/base/path`

If base URL is something other than just / (you are serving a subfolder in your proxy for
instance http://recipe_app/recipes/)
Be sure to not have a trailing slash: e.g. '/recipes' instead of '/recipes/'

```
SCRIPT_NAME=/recipes
```

#### Static URL

> default `/static/` - options: `/any/url/path/`, `https://any.domain.name/and/url/path`

If staticfiles are stored or served from a different location uncomment and change accordingly.
This can either be a relative path from the applications base path or the url of an external host.

!!! info
    - MUST END IN `/`
    - This is not required if you are just using a subfolder

```
STATIC_URL=/static/
```

#### Media URL

> default `/static/` - options: `/any/url/path/`, `https://any.domain.name/and/url/path`

If mediafiles are stored at a different location uncomment and change accordingly.
This can either be a relative path from the applications base path or the url of an external host

!!! info
    - MUST END IN `/`
    - This is **not required** if you are just using a subfolder
    - This is **not required** if using S3/object storage

```
MEDIA_URL=/media/
```

#### Media root

> default `<basedir>/mediafiles` - options `/some/other/media/path`.

Where mediafiles should be stored on disk. The default location is a
`mediafiles` subfolder at the root of the application directory.

#### Gunicorn Workers

> default `3` - options `1-X`

Set the number of gunicorn workers to start when starting using `boot.sh` (all container installations).
The default is likely appropriate for most installations.
See [Gunicorn docs](https://docs.gunicorn.org/en/stable/design.html#how-many-workers) for recommended settings.

```
GUNICORN_WORKERS=3
```

#### Gunicorn Threads

> default `2` - options `1-X`

Set the number of gunicorn threads to start when starting using `boot.sh` (all container installations).
The default is likely appropriate for most installations.
See [Gunicorn docs](https://docs.gunicorn.org/en/stable/design.html#how-many-workers) for recommended settings.

```
GUNICORN_THREADS=2
```

#### Gunicorn Media

> default `0` - options `0`, `1`

Serve media files directly using gunicorn. Basically everyone recommends not doing this. Please use any of the examples
provided that include an additional nxginx container to handle media file serving.
If you know what you are doing turn this on (`1`) to serve media files using djangos serve() method.

```
GUNICORN_MEDIA=0
```

#### CSRF Trusted Origins

> default `[]` - options: [list,of,trusted,origins]

Allows setting origins to allow for unsafe requests.
See [Django docs](https://docs.djangoproject.com/en/5.0/ref/settings/#csrf-trusted-origins)

```
CSRF_TRUSTED_ORIGINS = []
```

#### Cors origins

> default `False` - options: `False`, `True`

By default, cross-origin resource sharing is disabled. Enabling this will allow access to your resources from other
domains.
Please read [the docs](https://github.com/adamchainz/django-cors-headers) carefully before enabling this.

```
CORS_ALLOW_ALL_ORIGINS = True
```

#### Session Cookies

Django session cookie settings. Can be changed to allow a single django application to authenticate several applications
when running under the same database.

```
SESSION_COOKIE_DOMAIN=.example.com
SESSION_COOKIE_NAME=sessionid # use this only to not interfere with non unified django applications under the same top level domain
```

### Features

Some features can be enabled/disabled on a server level because they might change the user experience significantly,
they might be unstable/beta or they have performance/security implications.

#### Captcha

If you allow signing up to your instance you might want to use a captcha to prevent spam.
Tandoor supports HCAPTCHA which is supposed to be a privacy-friendly captcha provider.
See [HCAPTCHA website](https://www.hcaptcha.com/) for more information and to acquire your sitekey and secret.

```
HCAPTCHA_SITEKEY=
HCAPTCHA_SECRET=
```

#### Metrics

Enable serving of prometheus metrics under the `/metrics` path

!!! danger
    The view is not secured (as per the prometheus default way) so make sure to secure it
    through your web server.

```
ENABLE_METRICS=0
```

#### Tree Sorting

> default `0` - options `0`, `1`

By default SORT_TREE_BY_NAME is disabled this will store all Keywords and Food in the order they are created.
Enabling this setting makes saving new keywords and foods very slow, which doesn't matter in most usecases.
However, when doing large imports of recipes that will create new objects, can increase total run time by 10-15x
Keywords and Food can be manually sorted by name in Admin
This value can also be temporarily changed in Admin, it will revert the next time the application is started

!!! info
    Disabling tree sorting is a temporary fix, in the future we might find a better implementation to allow tree sorting
    without the large performance impacts.

```
SORT_TREE_BY_NAME=0
```

#### PDF Export

> default `0` - options `0`, `1`

Exporting PDF's is a community contributed feature to export recipes as PDF files. This requires the server to download
a chromium binary and is generally implemented only rudimentary and somewhat slow depending on your server device.

See [Export feature docs](https://docs.tandoor.dev/features/import_export/#pdf) for additional information.

```
ENABLE_PDF_EXPORT=1
```

#### Legal URLS

Depending on your jurisdiction you might need to provide any of the following URLs for your instance.

```
TERMS_URL=
PRIVACY_URL=
IMPRINT_URL=
```

### Authentication

All configurable variables regarding authentication.
Please also visit the [dedicated docs page](https://docs.tandoor.dev/features/authentication/) for more information.

#### Default Permissions

Configures if a newly created user (from social auth or public signup) should automatically join into the given space and
default group.

This setting is targeted at private, single space instances that typically have a custom authentication system managing
access to the data.

!!! danger
    With public signup enabled this will give everyone access to the data in the given space

!!! warning
    This feature might be deprecated in favor of a space join and public viewing system in the future

> default `0` (disabled) - options `0`, `1-X` (space id)

When enabled will join user into space and apply group configured in `SOCIAL_DEFAULT_GROUP`.

```
SOCIAL_DEFAULT_ACCESS = 1
```

> default `guest` - options `guest`, `user`, `admin`

```
SOCIAL_DEFAULT_GROUP=guest
```

#### Enable Signup

> default `0` - options `0`, `1`

Allow everyone to create local accounts on your application instance (without an invite link)
You might want to setup HCAPTCHA to prevent bots from creating accounts/spam.

!!! info
    Social accounts will always be able to sign up, if providers are configured

```
ENABLE_SIGNUP=0
```

#### Social Auth

Allows you to set up external OAuth providers.

```
SOCIAL_PROVIDERS = allauth.socialaccount.providers.github, allauth.socialaccount.providers.nextcloud,
```

#### Remote User Auth
> default `0` - options `0`, `1`

Allow authentication via the REMOTE-USER header (can be used for e.g. authelia).

!!! danger
    Leave off if you don't know what you are doing! Enabling this without proper configuration will enable anybody
    to login with any username!

```
REMOTE_USER_AUTH=0
```

#### LDAP

LDAP based authentication is disabled by default. You can enable it by setting `LDAP_AUTH` to `1` and configuring the
other
settings accordingly. Please remove/comment settings you do not need for your setup.

```
LDAP_AUTH=
AUTH_LDAP_SERVER_URI=
AUTH_LDAP_BIND_DN=
AUTH_LDAP_BIND_PASSWORD=
AUTH_LDAP_USER_SEARCH_BASE_DN=
AUTH_LDAP_TLS_CACERTFILE=
AUTH_LDAP_START_TLS=
```

Instead of passing the LDAP password directly through the environment variable `AUTH_LDAP_BIND_PASSWORD`,
you can set the password in a file and set the environment variable `AUTH_LDAP_BIND_PASSWORD_FILE`
to the path of the file containing the ldap secret.

```
AUTH_LDAP_BIND_PASSWORD_FILE=/run/secrets/ldap_password.txt
```

### External Services

#### Email

Email Settings, see [Django docs](https://docs.djangoproject.com/en/3.2/ref/settings/#email-host) for additional
information.
Required for email confirmation and password reset (automatically activates if host is set).

```
EMAIL_HOST=
EMAIL_PORT=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=0
EMAIL_USE_SSL=0
# email sender address (default 'webmaster@localhost')
DEFAULT_FROM_EMAIL=
```

Instead of passing the email password directly through the environment variable `EMAIL_HOST_PASSWORD`,
you can set the password in a file and set the environment variable `EMAIL_HOST_PASSWORD_FILE`
to the path of the file containing the ldap secret.

```
EMAIL_HOST_PASSWORD_FILE=/run/secrets/email_password.txt
```

Optional settings (only copy the ones you need)

```
# prefix used for account related emails (default "[Tandoor Recipes] ")
ACCOUNT_EMAIL_SUBJECT_PREFIX=
```

#### S3 Object storage

If you want to store your users media files using an external storage provider supporting the S3 API's (Like S3,
MinIO, ...)
configure the following settings accordingly.
As long as `S3_ACCESS_KEY` is not set, all object storage related settings are disabled.

See also [Django Storages Docs](https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html) for additional
information.

!!! info
    Settings are only named S3 but apply to all compatible object storage providers.

Required settings

```
S3_ACCESS_KEY=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

Optional settings (only copy the ones you need)

```
S3_REGION_NAME= # default none, set your region might be required
S3_QUERYSTRING_AUTH=1 # default true, set to 0 to serve media from a public bucket without signed urls
S3_QUERYSTRING_EXPIRE=3600 # number of seconds querystring are valid for
S3_ENDPOINT_URL= # when using a custom endpoint like minio
S3_CUSTOM_DOMAIN= # when using a CDN/proxy to S3 (see https://github.com/TandoorRecipes/recipes/issues/1943)
```

#### FDC Api

The FDC Api is used to automatically load nutrition information from
the [FDC Nutrition Database](https://fdc.nal.usda.gov/fdc-app.html#/).
The default `DEMO_KEY` is limited to 30 requests / hour or 50 requests / day.
If you want to do many requests to the FDC API you need to get a (free) API
key [here](https://fdc.nal.usda.gov/api-key-signup.html).

```
FDC_API_KEY=DEMO_KEY
```

#### Connectors

- `DISABLE_EXTERNAL_CONNECTORS` is a global switch to disable External Connectors entirely.
- `EXTERNAL_CONNECTORS_QUEUE_SIZE` is the amount of changes that are kept in memory if the worker cannot keep up.

(External) Connectors are used to sync the status from Tandoor to other services. More info can be found [here](https://docs.tandoor.dev/features/connectors/).

```env
DISABLE_EXTERNAL_CONNECTORS=0  # Default 0 (false), set to 1 (true) to disable connectors
EXTERNAL_CONNECTORS_QUEUE_SIZE=100  # Defaults to 100, set to any number >1
```

### Debugging/Development settings

!!! warning
    These settings should not be left on in production as they might provide additional attack surfaces and
    information to adversaries.

#### Debug

> default `0` - options: `0`, `1`

!!! info
    Please enable this before posting logs anywhere to ask for help.

Setting to `1` enables several django debug features and additional
logs ([see docs](https://docs.djangoproject.com/en/5.0/ref/settings/#std-setting-DEBUG)).

```
DEBUG=0
```

#### Debug Toolbar

> default `0` - options: `0`, `1`

Set to `1` to enable django debug toolbar middleware. Toolbar only shows if `DEBUG=1` is set and the requesting IP
is in `INTERNAL_IPS`.
See [Django Debug Toolbar Docs](https://django-debug-toolbar.readthedocs.io/en/latest/).

```
DEBUG_TOOLBAR=0
```

#### SQL Debug

> default `0` - options: `0`, `1`

Set to `1` to enable additional query output on the search page.

```
SQL_DEBUG=0
```

#### Application Log Level

> default `WARNING` - options: [see Django Docs](https://docs.djangoproject.com/en/5.0/topics/logging/#loggers)

Increase or decrease the logging done by application.
Please set to `DEBUG` when making a bug report.

```
 LOG_LEVEL="DEBUG"
```


#### Gunicorn Log Level

> default `info` - options: [see Gunicorn Docs](https://docs.gunicorn.org/en/stable/settings.html#loglevel)

Increase or decrease the logging done by gunicorn (the python wsgi application).

```
 GUNICORN_LOG_LEVEL="debug"
```

### Default User Preferences

Having default user preferences is nice so that users signing up to your instance already have the settings you deem
appropriate.

#### Fractions

> default `0` - options: `0`,`1`

The default value for the user preference 'fractions' (showing amounts as decimals or fractions).

```
FRACTION_PREF_DEFAULT=0
```

#### Comments

> default `1` - options: `0`,`1`

The default value for the user preference 'comments' (enable/disable commenting system)

```
COMMENT_PREF_DEFAULT=1
```

#### Sticky Navigation

> default `1` - options: `0`,`1`

The default value for the user preference 'sticky navigation' (always show navbar on top or hide when scrolling)

```
STICKY_NAV_PREF_DEFAULT=1
```

#### Max owned spaces

> default `100` - options: `0-X`

The default for the number of spaces a user can own. By setting to 0 space creation for users will be disabled.
Superusers can always bypass this limit.

```
MAX_OWNED_SPACES_PREF_DEFAULT=100
```


### Cosmetic / Preferences

#### Timezone

> default `Europe/Berlin` - options: [see timezone DB](https://timezonedb.com/time-zones)

Default timezone to use for database
connections ([see Django docs](https://docs.djangoproject.com/en/5.0/ref/settings/#time-zone)).
Usually everything is converted to the users timezone so this setting doesn't really need to be correct.

```
TZ=Europe/Berlin
```

#### Default Theme
> default `0` - options `1-X` (space ID)

Tandoors appearance can be changed on a user and space level but unauthenticated users always see the tandoor default style.
With this setting you can specify the ID of a space of which the appearance settings should be applied if a user is not logged in.

```
UNAUTHENTICATED_THEME_FROM_SPACE=
```

#### Force Theme
> default `0` - options `1-X` (space ID)

Similar to the Default theme but forces the theme upon all users (authenticated/unauthenticated) and all spaces

```
FORCE_THEME_FROM_SPACE=
```

### Rate Limiting / Performance

#### Shopping auto sync

> default `5` - options: `1-XXX`

Users can set an amount of time after which the shopping list is automatically refreshed.
This is the minimum interval users can set. Setting this to a low value will allow users to automatically refresh very
frequently which
might cause high load on the server. (Technically they can obviously refresh as often as they want with their own
scripts)

```
SHOPPING_MIN_AUTOSYNC_INTERVAL=5
```

#### API Url Import throttle

> default `60/hour` - options: `x/hour`, `x/day`, `x/minute`, `x/second`

Limits how many recipes a user can import per hour.
A rate limit is recommended to prevent users from abusing your server for (DDoS) relay attacks and to prevent external
service
providers from blocking your server for too many request.

```
DRF_THROTTLE_RECIPE_URL_IMPORT=60/hour
```

#### Default Space Limits
You might want to limit how many resources a user might create. The following settings apply automatically to newly
created spaces. These defaults can be changed in the admin view after a space has been created.

If unset, all settings default to unlimited/enabled

```
SPACE_DEFAULT_MAX_RECIPES=0 # 0=unlimited recipes
SPACE_DEFAULT_MAX_USERS=0 # 0=unlimited users per space
SPACE_DEFAULT_MAX_FILES=0 # Maximum file storage for space in MB. 0 for unlimited, -1 to disable file upload.
SPACE_DEFAULT_ALLOW_SHARING=1 # Allow users to share recipes with public links
```

#### Export file caching
> default `600` - options `1-X`

Recipe exports are cached for a certain time (in seconds) by default, adjust time if needed
```
EXPORT_FILE_CACHE_DURATION=600
```
