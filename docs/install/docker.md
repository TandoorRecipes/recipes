!!! success "Recommended Installation"
    Setting up this application using Docker is recommended. This does not mean that other options are bad, just that
    support is much easier for this setup.

It is possible to install this application using many Docker configurations.

Please read the instructions/notes on each example carefully and decide if this is the way for you.

## Docker

The docker image (`vabene1111/recipes`) simply exposes the application on port `8080`.

It can be run and exposed on port 80 using:

```shell
docker run -d \
    -v ./staticfiles:/opt/recipes/staticfiles \
    -v ./mediafiles:/opt/recipes/mediafiles \
    -p 80:8080 \
    -e SECRET_KEY=YOUR_SECRET_KEY \
    -e DB_ENGINE=django.db.backends.postgresql \
    -e POSTGRES_HOST=db_recipes \
    -e POSTGRES_PORT=5432 \
    -e POSTGRES_USER=djangodb \
    -e POSTGRES_PASSWORD=YOUR_POSTGRES_SECRET_KEY \
    -e POSTGRES_DB=djangodb \
    --name recipes_1 \
    vabene1111/recipes
```

Please make sure, if you run your image this way, to consult
the [.env.template](https://raw.githubusercontent.com/vabene1111/recipes/master/.env.template)
file in the GitHub repository to verify if additional environment variables are required for your setup.

## Docker Compose

The main, and also recommended, installation option is to install this application using Docker Compose.

1. Choose your `docker-compose.yml` from the examples below.
2. Download the `.env` configuration file with `wget`, then **edit it accordingly**.
   ```shell
   wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O .env
   ```
3. Start your container using `docker-compose up -d`.

### Plain

This configuration exposes the application through an nginx web server on port 80 of your machine.

```yaml
version: "3"
services:
  db_recipes:
    restart: always
    image: postgres:11-alpine
    volumes:
      - ./postgresql:/var/lib/postgresql/data
    env_file:
      - ./.env

  web_recipes:
    image: vabene1111/recipes
    restart: always
    ports:
      - 80:8080
    env_file:
      - ./.env
    volumes:
      - staticfiles:/opt/recipes/staticfiles
      - mediafiles:/opt/recipes/mediafiles
      - nginx_config:/opt/recipes/nginx/conf.d
    depends_on:
      - db_recipes

  nginx_recipes:
    image: nginx:mainline-alpine
    restart: always
    ports:
      - 80:80
    env_file:
      - ./.env
    volumes:
      - nginx_config:/etc/nginx/conf.d:ro
      - staticfiles:/static
      - mediafiles:/media

volumes:
  nginx_config:
  staticfiles:
  mediafiles:
    driver: local
    driver_opts:
      type: 'none'
      o: 'bind'
      device: './mediafiles'
```

### Reverse Proxy

Most deployments will likely use a reverse proxy.

#### Traefik
If you use traefik, this configuration is the one for you.

!!! info
    Traefik can be a little confusing to setup.
    Please refer to [their excellent documentation](https://doc.traefik.io/traefik/). If that does not help,
    [this little example](traefik.md) might be for you.

```yaml
version: "3"
services:
  db_recipes:
    restart: always
    image: postgres:11-alpine
    volumes:
      - ./postgresql:/var/lib/postgresql/data
    env_file:
      - ./.env
    networks:
      - default

  web_recipes:
    image: vabene1111/recipes
    restart: always
    env_file:
      - ./.env
    volumes:
      - staticfiles:/opt/recipes/staticfiles
      - mediafiles:/opt/recipes/mediafiles
      - nginx_config:/opt/recipes/nginx/conf.d
    depends_on:
      - db_recipes
    networks:
      - default

  nginx_recipes:
    image: nginx:mainline-alpine
    restart: always
    env_file:
      - ./.env
    volumes:
      - nginx_config:/etc/nginx/conf.d:ro
      - staticfiles:/static
      - mediafiles:/media
    labels: # traefik example labels
      - "traefik.enable=true"
      - "traefik.http.routers.recipes.rule=Host(`recipes.mydomain.com`, `recipes.myotherdomain.com`)"
      - "traefik.http.routers.recipes.entrypoints=web_secure" # your https endpoint
      - "traefik.http.routers.recipes.tls.certresolver=le_resolver" # your cert resolver
    networks:
      - default
      - traefik

networks:
  default:
  traefik: # This is you external traefik network
    external: true

volumes:
  nginx
  staticfiles
  mediafiles:
    driver: local
    driver_opts:
      type: 'none'
      o: 'bind'
      device: './mediafiles'
```

#### nginx-proxy

This is a docker compose example using [jwilder's nginx reverse proxy](https://github.com/jwilder/docker-gen)
in combination with [jrcs's letsencrypt companion](https://hub.docker.com/r/jrcs/letsencrypt-nginx-proxy-companion/).

Please refer to the appropriate documentation on how to setup the reverse proxy and networks.

Remember to add the appropriate environment variables to `.env` file:
```
VIRTUAL_HOST=
LETSENCRYPT_HOST=
LETSENCRYPT_EMAIL=
```

```yaml
version: "3"
services:
  db_recipes:
    restart: always
    image: postgres:11-alpine
    volumes:
      - ./postgresql:/var/lib/postgresql/data
    env_file:
      - ./.env
    networks:
      - default

  web_recipes:
    image: vabene1111/recipes
    restart: always
    env_file:
      - ./.env
    volumes:
      - staticfiles:/opt/recipes/staticfiles
      - mediafiles:/opt/recipes/mediafiles
      - nginx_config:/opt/recipes/nginx/conf.d
    depends_on:
      - db_recipes
    networks:
      - default

  nginx_recipes:
    image: nginx:mainline-alpine
    restart: always
    env_file:
      - ./.env
    volumes:
      - nginx_config:/etc/nginx/conf.d:ro
      - staticfiles:/static
      - mediafiles:/media
    networks:
      - default
      - nginx-proxy

networks:
  default:
  nginx-proxy:
    external:
      name: nginx-proxy

volumes:
  nginx
  staticfiles
  mediafiles:
    driver: local
    driver_opts:
      type: 'none'
      o: 'bind'
      device: './mediafiles'
```

## Additional Information

### Nginx vs Gunicorn
All examples use an additional `nginx` container to serve mediafiles and act as the forward facing webserver.
This is **technically not required** but **very much recommended**.

I do not 100% understand the deep technical details but the [developers of gunicorn](https://serverfault.com/questions/331256/why-do-i-need-nginx-and-something-like-gunicorn/331263#331263),
the WSGi server that handles the Python execution, explicitly state that it is not recommended to deploy without nginx.
You will also likely not see any decrease in performance or a lot of space used as nginx is a very light container.

!!! info
    Even if you run behind a reverse proxy as described above, using an additional nginx container is the recommended option.

If you run a small private deployment and don't care about performance, security and whatever else feel free to run
without a ngix container.

!!! warning
    When running without nginx make sure to enable `GUNICORN_MEDIA` in the `.env`. Without it, media files will be uploaded
    but not shown on the page.

For additional information please refer to the [0.9.0 Release](https://github.com/vabene1111/recipes/releases?after=0.9.0)
and [Issue 201](https://github.com/vabene1111/recipes/issues/201) where these topics have been discussed.
See also refer to the [official gunicorn docs](https://docs.gunicorn.org/en/stable/deploy.html).

### Nginx Config

In order to give the user (you) the greatest amount of freedom when choosing how to deploy this application the
webserver is not directly bundled with the Docker image.

This has the downside that it is difficult to supply the configuration to the webserver (e.g. nginx). Up until
version `0.13.0`, this had to be done manually by downloading the nginx config file and placing it in a directory that
was then mounted into the nginx container.

From version `0.13.0`, the config file is supplied using the application image (`vabene1111/recipes`). It is then mounted
to the host system and from there into the nginx container.

This is not really a clean solution, but I could not find any better alternative that provided the same amount of
usability. If you know of any better way, feel free to open an issue.

### Using Proxy Authentication

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

### Volumes vs Bind Mounts

Since I personally prefer to have my data where my `docker-compose.yml` resides, bind mounts are used in the example
configuration files for all user generated data (e.g. Postgresql and media files).

Please note that [there is a difference in functionality](https://docs.docker.com/storage/volumes/)
between the two and you cannot always simply interchange them.

You can move everything to volumes if you prefer it this way, **but you cannot convert the nginx config file to a bind
mount.**
If you do so you will have to manually create the nginx config file and restart the container once after creating it.
