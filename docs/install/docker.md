!!! success "Recommended Installation"
    Setting up this application using Docker is recommended. This does not mean that other options are bad, just that
    support is much easier for this setup.

It is possible to install this application using many Docker configurations.

Please read the instructions/notes on each example carefully and decide if this is the way for you.

## Docker

The docker image (`vabene1111/recipes`) simply exposes the application on the container's port `8080`.

It can be run and accessed on port 80 using:

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

### Versions

There are different versions (tags) released on docker hub. 

- **latest** Default image. The one you should use if you don't know that you need anything else.
- **beta** Partially stable version that gets updated every now and then. Expect to have some problems.
- **develop** If you want the most bleeding edge version with potentially many breaking changes feel free to use this version (I don't recommend it!). 
- **X.Y.Z** each released version has its own image. If you need to revert to an old version or want to make sure you stay on one specific use these tags.

!!! danger "No Downgrading"
    There is currently no way to migrate back to an older version as there is no mechanism to downgrade the database. 
    You could probably do it but I cannot help you with that. Choose wisely if you want to use the unstable images.
    That said **beta** should usually be working if you like frequent updates and new stuff.

## Docker Compose

The main, and also recommended, installation option is to install this application using Docker Compose.

1. Choose your `docker-compose.yml` from the examples below.
2. Download the `.env` configuration file with `wget`, then **edit it accordingly** (you NEED to set `SECRET_KEY` and `POSTGRES_PASSWORD`).
   ```shell
   wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O .env
   ```
3. Start your container using `docker-compose up -d`.

### Plain

This configuration exposes the application through an nginx web server on port 80 of your machine.

```shell
wget https://raw.githubusercontent.com/vabene1111/recipes/develop/docs/install/docker/plain/docker-compose.yml
```

~~~yaml
{% include "./docker/plain/docker-compose.yml" %}
~~~

### Reverse Proxy

Most deployments will likely use a reverse proxy.

#### Traefik
If you use traefik, this configuration is the one for you.

!!! info
    Traefik can be a little confusing to setup.
    Please refer to [their excellent documentation](https://doc.traefik.io/traefik/). If that does not help,
    [this little example](traefik.md) might be for you.

```shell
wget https://raw.githubusercontent.com/vabene1111/recipes/develop/docs/install/docker/traefik-nginx/docker-compose.yml
```

~~~yaml
{% include "./docker/traefik-nginx/docker-compose.yml" %}
~~~

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

```shell
wget https://raw.githubusercontent.com/vabene1111/recipes/develop/docs/install/docker/nginx-proxy/docker-compose.yml
```

~~~yaml
{% include "./docker/nginx-proxy/docker-compose.yml" %}
~~~

#### Nginx Swag by LinuxServer
[This container](https://github.com/linuxserver/docker-swag) is an all in one solution created by LinuxServer.io.

It contains templates for popular apps, including Tandoor Recipes, so you don't have to manually configure nginx and discard the template provided in Tandoor repo. Tandoor config is called `recipes.subdomain.conf.sample` which you can adapt for your instance.

If you're running Swag on the default port, you'll just need to change the container name to yours.

If your running Swag on a custom port, some headers must be changed: 

- Create a copy of `proxy.conf`
- Replace `proxy_set_header X-Forwarded-Host $host;` and `proxy_set_header Host $host;` to 
   - `proxy_set_header X-Forwarded-Host $http_host;` and `proxy_set_header Host $http_host;`
- Update `recipes.subdomain.conf` to use the new file
- Restart the linuxserver/swag container and Recipes will work correctly

More information [here](https://github.com/TandoorRecipes/recipes/issues/959#issuecomment-962648627).


In both cases, also make sure to mount `/media/` in your swag container to point to your Tandoor Recipes Media directory.

Please refer to the [appropriate documentation](https://github.com/linuxserver/docker-swag#usage) for the container setup.

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

### Volumes vs Bind Mounts

Since I personally prefer to have my data where my `docker-compose.yml` resides, bind mounts are used in the example
configuration files for all user generated data (e.g. Postgresql and media files).

Please note that [there is a difference in functionality](https://docs.docker.com/storage/volumes/)
between the two and you cannot always simply interchange them.

You can move everything to volumes if you prefer it this way, **but you cannot convert the nginx config file to a bind
mount.**
If you do so you will have to manually create the nginx config file and restart the container once after creating it.
