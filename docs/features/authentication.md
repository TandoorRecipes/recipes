Besides the normal django username and password authentication this application supports multiple
methods of central account management and authentication.

## Allauth
[Django Allauth](https://docs.allauth.org/en/latest/) is an awesome project that
allows you to use a [huge number](https://docs.allauth.org/en/latest/socialaccount/providers/index.html) of different
authentication providers.

They basically explain everything in their documentation, but the following is a short overview on how to get started.

<!-- prettier-ignore -->
!!! warning "Public Providers"
    If you choose Google, Github or any other publicly available service as your authentication provider anyone
    with an account on that site can create an account on your installation.
    A new account does not have any permission but it is still **not recommended** to give public access to
    your installation.

Choose a provider from the [list](https://docs.allauth.org/en/latest/socialaccount/providers/index.html) and install it using the environment variable `SOCIAL_PROVIDERS` as shown
in the example below.

When at least one social provider is set up, the social login sign in buttons should appear on the login page. The example below enables Nextcloud and the generic OpenID Connect providers.

```ini
SOCIAL_PROVIDERS=allauth.socialaccount.providers.openid_connect,allauth.socialaccount.providers.nextcloud
```

<!-- prettier-ignore -->
!!! warning "Formatting"
    The exact formatting is important so make sure to follow the steps explained here!

### Configuration, via environment

Depending on your authentication provider you **might need** to configure it.
This needs to be done through the settings system. To make the system flexible (allow multiple providers) and to
not require another file to be mounted into the container the configuration is done through a single
environment variable. The downside of this approach is that the configuration needs to be put into a single line
as environment files loaded by docker compose don't support multiple lines for a single variable.

The line data needs to either be in json or as Python dictionary syntax.

Take the example configuration from the allauth docs, fill in your settings and then inline the whole object
(you can use a service like [www.freeformatter.com](https://www.freeformatter.com/json-formatter.html) for formatting).
Assign it to the additional `SOCIALACCOUNT_PROVIDERS` variable.

The example below is for a generic OIDC provider with PKCE enabled. Most values need to be customized for your specifics!

```ini
SOCIALACCOUNT_PROVIDERS = "{ 'openid_connect': { 'OAUTH_PKCE_ENABLED': True, 'APPS': [ { 'provider_id': 'oidc', 'name': 'My-IDM', 'client_id': 'my_client_id', 'secret': 'my_client_secret', 'settings': { 'server_url': 'https://idm.example.com/oidc/recipes' } } ] } }"
```

Because this JSON contains sensitive data (client id and secret), you may instead choose to save the JSON in a file
and set the environment variable `SOCIALACCOUNT_PROVIDERS_FILE` to the path of the file containing the JSON.

```
SOCIALACCOUNT_PROVIDERS_FILE=/run/secrets/socialaccount_providers.txt
```

!!! success "Improvements ?"
    There are most likely ways to achieve the same goal but with a cleaner or simpler system.
    If you know such a way feel free to let me know.

### Configuration, via Django Admin

Provider credentials (client ID, secret, provider type) can also be configured via the Django Admin
interface instead of the `SOCIALACCOUNT_PROVIDERS` environment variable. All other social login
settings (e.g., `SOCIALACCOUNT_LOGIN_ON_GET`, `SOCIALACCOUNT_EMAIL_AUTHENTICATION`) must still be
set as environment variables.

1. Navigate to `/admin/` and log in with a superuser account.
2. Under **Sites**, edit the default site to match the URL of your installation (or create a new one).
3. Under **Social accounts → Social applications**, create a new application with the required information from the [allauth provider documentation](https://docs.allauth.org/en/latest/socialaccount/providers/index.html).
4. Make sure to add your site to the application's list of available sites.

<!-- prettier-ignore -->
!!! warning
    You still need `SOCIAL_PROVIDERS` set in your environment to load the allauth provider module
    (e.g., `allauth.socialaccount.providers.openid_connect`). The Django Admin only replaces the
    `SOCIALACCOUNT_PROVIDERS` credential configuration, not the provider module registration.

Now the provider is configured and you should be able to sign up and sign in using the provider.
Use the superuser account to grant permissions to the newly created users, or enable default access via `SOCIAL_DEFAULT_ACCESS` & `SOCIAL_DEFAULT_GROUP` (see [configuration docs](../system/configuration.md)).

### Third-party authentication example

Keycloak is a popular IAM solution and integration is straight forward thanks to Django Allauth. This example can also be used as reference for other third-party authentication solutions, as documented by Allauth.

At Keycloak, create a new client and assign a `Client-ID`, this client comes with a `Secret-Key`. Both values are required later on. Make sure to define the correct Redirection-URL for the service, for example `https://tandoor.example.com/*`. Depending on your Keycloak setup, you need to assign roles and groups to grant access to the service.

To enable Keycloak as a sign in option, set those variables to define the social provider and specify its configuration:

```ini
SOCIAL_PROVIDERS=allauth.socialaccount.providers.openid_connect
SOCIALACCOUNT_PROVIDERS='{"openid_connect":{"APPS":[{"provider_id":"keycloak","name":"Keycloak","client_id":"KEYCLOAK_CLIENT_ID","secret":"KEYCLOAK_CLIENT_SECRET","settings":{"server_url":"https://auth.example.org/realms/KEYCLOAK_REALM/.well-known/openid-configuration"}}]}}'
```

You are now able to sign in using Keycloak after a restart of the service.

### Skipping the Confirmation Page

By default, clicking a social login button shows an intermediate "Continue to provider" page before redirecting.
To skip this and go directly to the provider:

> default `0` - options `0`, `1`

```ini
SOCIALACCOUNT_LOGIN_ON_GET=1
```

### Email-Based Account Matching

By default, if a user signs in with a social provider whose email matches an existing Tandoor account, allauth will
**not** automatically link them. You can enable email-based authentication to allow this:

> default `0` - options `0`, `1`

```ini
SOCIALACCOUNT_EMAIL_AUTHENTICATION=1
```

When enabled, users who sign in via a social provider will be matched to an existing account if the email address
matches. The user will receive an email confirmation to verify ownership before the accounts are linked.

To skip the email confirmation step and link accounts automatically (less secure, but simpler):

> default `0` - options `0`, `1`

```ini
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT=1
```

<!-- prettier-ignore -->
!!! warning "Security"
    Enabling `SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT` means any social provider that reports a matching
    email address will be linked to the existing account without verification. Only enable this if you trust
    all configured social providers to return verified email addresses.

<!-- prettier-ignore -->
!!! warning "Verified Emails Required"
    Email matching only works when the social provider marks the email address as **verified**.
    If your provider returns unverified emails, matching is silently skipped and a new account is
    created instead. A warning will appear in the server logs and on the System page when this happens.
    Without `SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT`, a working email configuration
    (`EMAIL_HOST`) is also required to send the verification email to the user.

### Social-Only Authentication

There are two options for hiding the local username/password login form:

**`HIDE_LOGIN_FORM`** — Hides the login form from the UI, but local authentication still works.
An admin can force the form to appear by navigating to `/accounts/login/?form=1`. Use this if you want
social login as the default but need a break-glass fallback for emergencies.

> default `0` - options `0`, `1`

```ini
HIDE_LOGIN_FORM=1
```

**`SOCIALACCOUNT_ONLY`** — Fully disables local authentication at the allauth level. No password login,
no password-based signup, no break-glass. Use this only if you are certain all users (including admins)
will always authenticate through the social provider.

> default `0` - options `0`, `1`

```ini
SOCIALACCOUNT_ONLY=1
```

<!-- prettier-ignore -->
!!! tip
    For most setups, `HIDE_LOGIN_FORM=1` is the safer choice. It keeps the UI clean while
    preserving local admin access as a fallback via `/accounts/login/?form=1`.

### Controlling Social Signup

By default, new users signing in via a social provider are automatically created.
To require users to go through a signup form (e.g., to accept terms of service):

> default `1` - options `0`, `1`

```ini
SOCIALACCOUNT_AUTO_SIGNUP=0
```

<!-- prettier-ignore -->
!!! warning "ENABLE_SIGNUP does not affect social login"
    `ENABLE_SIGNUP=0` only disables the local registration form. Social login will still create new
    accounts automatically unless you also set `SOCIALACCOUNT_AUTO_SIGNUP=0`. If you want to prevent
    all new account creation, you must disable both.

### Example: Social Login with Invite-Based Space Access

To set up Tandoor with social login as the primary method and control space access via invite links:

```ini
SOCIAL_PROVIDERS=allauth.socialaccount.providers.openid_connect
SOCIALACCOUNT_PROVIDERS=<your provider config>
HIDE_LOGIN_FORM=1
SOCIALACCOUNT_LOGIN_ON_GET=1
SOCIALACCOUNT_EMAIL_AUTHENTICATION=1
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT=1
```

With this configuration:

1. The login page shows only the social login button (local login available via `/accounts/login/?form=1` as a break-glass fallback)
2. Clicking the button goes directly to the provider (no confirmation page)
3. New users are created automatically via the social provider
4. If a user's social email matches an existing account, the accounts are linked automatically
5. Access to specific spaces is controlled via invite links — send users an invite link,
   and after they authenticate with the social provider, they are added to the invited space

<!-- prettier-ignore -->
!!! note
    Anyone who can authenticate with your social provider can create an account. They will not have
    access to any space unless you send them an invite link or set `SOCIAL_DEFAULT_ACCESS=1`.
    To truly restrict who can create accounts, configure access controls at your identity provider
    (e.g., limit which users or groups can access the Tandoor application in Authentik/Keycloak).

<!-- prettier-ignore -->
!!! note
    `SOCIALACCOUNT_AUTO_SIGNUP` only controls whether **new** users are auto-created or shown a signup form.
    Email matching for **existing** accounts (via `SOCIALACCOUNT_EMAIL_AUTHENTICATION`) works independently
    and always bypasses the signup form when a match is found.

### Session Management

Users can view and manage their active sessions at `/accounts/sessions/`. This page shows all active
sessions and allows ending individual sessions or all other sessions ("logout everywhere").

### Linking accounts
To link an account to an already existing normal user go to the settings page of the user and link it.
Here you can also unlink your account if you no longer want to use a social login method.

### Troubleshooting Social Login

#### Error Details on Login Failure

When a social login fails, the error page shows the provider name, error code, and
exception details. Share these details with your administrator if you need help resolving the issue.

Common error codes:

| Error Code | Meaning | Likely Cause |
|------------|---------|--------------|
| `unknown` | Unspecified failure | Provider misconfiguration, network issue, or server error |
| `cancelled` | User cancelled login | User declined to authorize at the provider |
| `denied` | Access denied | Provider rejected the request (invalid client ID/secret, wrong redirect URI) |

#### System Page Diagnostics

Administrators can view additional diagnostics on the **System** page (`/system/`):

- **Configured Providers** — lists all social login providers (from both settings and database configuration),
  including their client IDs and the number of linked accounts.
- **Recent Login Errors** — shows the last 50 social login failures (cached for 24 hours) with timestamps,
  provider names, error codes, and exception details.

#### Common Issues

**"Social Network Login Failure" with no details**
:   Ensure `SOCIALACCOUNT_PROVIDERS` is correctly formatted. The value must be valid JSON or Python dict syntax
    on a single line. Check for mismatched quotes or brackets.

**Provider not appearing on login page**
:   Verify that `SOCIAL_PROVIDERS` includes the correct allauth provider module path
    (e.g., `allauth.socialaccount.providers.openid_connect`) and that `SOCIALACCOUNT_PROVIDERS` contains
    valid configuration for that provider. Restart the container after changes.

**Login succeeds at provider but fails returning to Tandoor**
:   Check that the redirect URI configured at your provider matches your Tandoor URL exactly.
    For OpenID Connect providers, the callback URL is typically
    `https://your-tandoor-url/accounts/oidc/login/callback/` (or the provider-specific path).
    Also verify that the `client_id` and `secret` in `SOCIALACCOUNT_PROVIDERS` match the provider configuration.

**403 Forbidden from the provider's userinfo endpoint**
:   The provider is rejecting the token exchange or user info request. Verify that the client credentials
    are correct, the client is not disabled at the provider, and required scopes (typically `openid email profile`)
    are granted.

**User created but has no permissions**
:   New social login users start with no space access by default. Use `SOCIAL_DEFAULT_ACCESS` and
    `SOCIAL_DEFAULT_GROUP` environment variables to automatically grant permissions to new social login users.

## LDAP

LDAP authentication can be enabled in the `.env` file by setting `LDAP_AUTH=1`.
If set, users listed in the LDAP instance will be able to sign in without signing up.
These variables must be set to configure the connection to the LDAP instance:

```
AUTH_LDAP_SERVER_URI=ldap://ldap.example.org:389
AUTH_LDAP_BIND_DN=uid=admin,ou=users,dc=example,dc=org
AUTH_LDAP_BIND_PASSWORD=adminpassword
AUTH_LDAP_USER_SEARCH_BASE_DN=ou=users,dc=example,dc=org
```

Additional optional variables:

```
AUTH_LDAP_USER_SEARCH_FILTER_STR=(uid=%(user)s)
AUTH_LDAP_USER_ATTR_MAP={'first_name': 'givenName', 'last_name': 'sn', 'email': 'mail'}
AUTH_LDAP_ALWAYS_UPDATE_USER=1
AUTH_LDAP_CACHE_TIMEOUT=3600
AUTH_LDAP_START_TLS=1
AUTH_LDAP_TLS_CACERTFILE=/etc/ssl/certs/own-ca.pem
```

## External Authentication

<!-- prettier-ignore -->
!!! warning "Security Impact"
    If you just set `REMOTE_USER_AUTH=1` without any additional configuration, _anybody_ can authenticate with _any_ username!

<!-- prettier-ignore -->
!!! Info "Community Contributed Tutorial"
    This tutorial was provided by a community member. We are not able to provide any support! Please only use, if you know what you are doing!

In order use external authentication (i.e. using a proxy auth like Authelia, Authentik, etc.) you will need to:

1. Set `REMOTE_USER_AUTH=1` in the `.env` file
2. Update your nginx configuration file

Using any of the examples above will automatically generate a configuration file inside a docker volume.
Use `docker volume inspect recipes_nginx` to find out where your volume is stored.

<!-- prettier-ignore -->
!!! warning "Configuration File Volume"
    The nginx config volume is generated when the container is first run. You can change the volume to a bind mount in the
    `docker-compose.yml`, but then you will need to manually create it. See section `Volumes vs Bind Mounts` below
    for more information.

### Configuration Example for Authelia

```
server {
  listen 80;
  server_name localhost;

  client_max_body_size 16M;

  # serve static files
  location /static/ {
    alias /static/;
  }
  # serve media files
  location /media/ {
    alias /media/;
  }

  # Authelia endpoint for authentication requests
  include /config/nginx/auth.conf;

  # pass requests for dynamic content to gunicorn
  location / {
    proxy_set_header Host $host;
    proxy_pass http://web_recipes:8080;

    # Ensure Authelia is specifically required for this endpoint
    # This line is important as it will return a 401 error if the user doesn't have access
    include /config/nginx/authelia.conf;

    auth_request_set $user $upstream_http_remote_user;
    proxy_set_header REMOTE-USER $user;
  }

  # Required to allow user to logout of authentication from within Recipes
  # Ensure the <auth_endpoint> below is changed to actual the authentication url
  location /accounts/logout/ {
    return 301 http://<auth_endpoint>/logout;
  }
}
```

Please refer to the appropriate documentation on how to set up the reverse proxy, authentication, and networks.

Ensure users have been configured for Authelia, and that the endpoint recipes is pointed to is protected but
available.

There is a good guide to the other additional files that need to be added to your nginx set up at
the [Authelia Docs](https://docs.authelia.com/deployment/supported-proxies/nginx.html).

Remember to add the appropriate environment variables to `.env` file (example for nginx proxy):

```
VIRTUAL_HOST=
LETSENCRYPT_HOST=
LETSENCRYPT_EMAIL=
PROXY_HEADER=
```
