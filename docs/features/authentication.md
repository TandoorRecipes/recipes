Besides the normal django username and password authentication this application supports multiple 
methods of central account management and authentication.

## Allauth
[Django Allauth](https://django-allauth.readthedocs.io/en/latest/index.html) is an awesome project that 
allows you to use a [huge number](https://django-allauth.readthedocs.io/en/latest/providers.html) of different
authentication providers.

They basically explain everything in their documentation, but the following is a short overview on how to get started.

!!! warning "Public Providers"
    If you choose Google, Github or any other publicly available service as your authentication provider anyone
    with an account on that site can create an account on your installation.
    A new account does not have any permission but it is still **not recommended** to give public access to 
    your installation. 

Choose a provider from the [list](https://django-allauth.readthedocs.io/en/latest/providers.html) and install it using the environment variable `SOCIAL_PROVIDERS` as shown
in the example below.

```ini
SOCIAL_PROVIDERS=allauth.socialaccount.providers.github,allauth.socialaccount.providers.nextcloud
```

!!! warning "Formatting"
    The exact formatting is important so make sure to follow the steps explained here!

Depending on your authentication provider you **might need** to configure it. 
This needs to be done trough the settings system. To make the system flexible (allow multiple providers) and to 
not require another file to be mounted into the container the configuration ins done trough a single
environment variable. The downside of this approach is that the configuration needs to be put into a single line
as environment files loaded by docker compose don't support multiple lines for a single variable.

Take the example configuration from the allauth docs, fill in your settings and then inline the whole object 
(you can use a service like [www.freeformatter.com](https://www.freeformatter.com/json-formatter.html) for formatting).
Assign it to the `SOCIALACCOUNT_PROVIDERS` variable.

```ini
SOCIALACCOUNT_PROVIDERS={"nextcloud":{"SERVER":"https://nextcloud.example.org"}}
```

!!! success "Improvements ?"
    There are most likely ways to achieve the same goal but with a cleaner or simpler system.
    If you know such a way feel free to let me know.

After that, use your superuser account to configure your authentication backend.
Open the admin page and do the following

1. Select `Sites` and edit the default site with the URL of your installation (or create a new).
2. Create a new `Social Application` with the required information as stated in the provider documentation of allauth.
3. Make sure to add your site to the list of available sites

Now the provider is configured and you should be able to sign up and sign in using the provider.
Use the superuser account to grant permissions to the newly created users.

!!! info "WIP"
    I do not have a ton of experience with using various single signon providers and also cannot test all of them.
    If you have any Feedback or issues let me know.

### Linking accounts
To link an account to an already existing normal user go to the settings page of the user and link it. 
Here you can also unlink your account if you no longer want to use a social login method.

## Reverse Proxy Authentication

!!! Info "Community Contributed Tutorial"
     This tutorial was provided by a community member. Since I do not use reverse proxy authentication, I cannot provide any
     assistance should you choose to use this authentication method.

In order use proxy authentication you will need to:

1. Set `REVERSE_PROXY_AUTH=1` in the `.env` file
2. Update your nginx configuration file

Using any of the examples above will automatically generate a configuration file inside a docker volume.
Use `docker volume inspect recipes_nginx` to find out where your volume is stored.

!!! warning "Configuration File Volume"
    The nginx config volume is generated when the container is first run. You can change the volume to a bind mount in the
    warning `docker-compose.yml`, but then you will need to manually create it. See section `Volumes vs Bind Mounts` below
    for more information.

The following example shows a configuration for Authelia:

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
    return 301 http://<auth_endpoint>/logout
  }
}
```

Please refer to the appropriate documentation on how to setup the reverse proxy, authentication, and networks.

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
