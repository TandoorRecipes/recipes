!!! success "Recommended Installation"
    Setting up this application using Docker is recommended. This does not mean that other options are bad, but its the only method 
    that is officially maintained and gets regularly tested. 

This guide shows you some basic setups using Docker and docker compose. For configuration options see the [configuration page](https://docs.tandoor.dev/system/configuration/).

## **Versions**

There are different versions (tags) released on [Docker Hub](https://hub.docker.com/r/vabene1111/recipes/tags).

-   **latest** Default image. The one you should use if you don't know that you need anything else.
-   **beta** Partially stable version that gets updated every now and then. Expect to have some problems.
-   **develop** If you want the most bleeding-edge version with potentially many breaking changes, feel free to use this version (not recommended!).
-   **X.Y.Z** each released version has its own image. If you need to revert to an old version or want to make sure you stay on one specific use these tags.

!!! danger "No Downgrading"
    There is currently no way to migrate back to an older version as there is no mechanism to downgrade the database.
    You could probably do it but I cannot help you with that. Choose wisely if you want to use the unstable images.
    That said **beta** should usually be working if you like frequent updates and new stuff.

## **Docker**

The docker image (`vabene1111/recipes`) simply exposes the application on the container's port `80` through the integrated nginx webserver.

```shell
docker run -d \
    -v "$(pwd)"/staticfiles:/opt/recipes/staticfiles \
    -v "$(pwd)"/mediafiles:/opt/recipes/mediafiles \
    -p 80:80 \
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

Please make sure to replace the ```SECRET_KEY``` and ```POSTGRES_PASSWORD``` placeholders!

## **Docker Compose**

The main, and also recommended, installation option for this application is Docker Compose.

1. Choose your `docker-compose.yml` from the examples below.
2. Download the `.env` configuration file with `wget`
    ```shell
    wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O .env
    ```
3. **Edit it accordingly** (you NEED to set `SECRET_KEY` and `POSTGRES_PASSWORD`), see [configuration page](https://docs.tandoor.dev/system/configuration/).
4. Start your container using `docker-compose up -d`.

### **Plain**

This configuration exposes the application through a containerized nginx web server on port 80 of your machine.
Be aware that having some other web server or container running on your host machine on port 80 will block this from working.

```shell
wget https://raw.githubusercontent.com/vabene1111/recipes/develop/docs/install/docker/plain/docker-compose.yml
```

~~~yaml
{% include "./docker/plain/docker-compose.yml" %}
~~~

### **Reverse Proxy**

Most deployments will likely use a reverse proxy.

If your reverse proxy is not listed below, please refer to chapter [Others](#others).

#### **Traefik**

If you use Traefik, this configuration is the one for you.

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


#### **jwilder's Nginx-proxy**

This is a docker compose example using [jwilder's nginx reverse proxy](https://github.com/jwilder/docker-gen)
in combination with [jrcs's letsencrypt companion](https://hub.docker.com/r/jrcs/letsencrypt-nginx-proxy-companion/).

Please refer to the appropriate documentation on how to setup the reverse proxy and networks.

!!! warning "Adjust client_max_body_size"
    By using jwilder's Nginx-proxy, uploads will be restricted to 1 MB file size. This can be resolved by adjusting the ```client_max_body_size``` variable in the jwilder nginx configuration.

Remember to add the appropriate environment variables to the `.env` file:

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

## **DockSTARTer**

The main goal of [DockSTARTer](https://dockstarter.com/) is to make it quick and easy to get up and running with Docker.
You may choose to rely on DockSTARTer for various changes to your Docker system or use DockSTARTer as a stepping stone and learn to do more advanced configurations.
Follow the guide for installing DockSTARTer and then run `ds` then select 'Configuration' and 'Select Apps' to get Tandoor up and running quickly and easily.


!!!note
    DockSTARTer might not be updated for Tandoor 2 configurations

## **Additional Information**

### **Nginx Config**
Starting with Tandoor 2 the Docker container includes a nginx service. Its default configuration is pulled from the [http.d](https://github.com/TandoorRecipes/recipes/tree/develop/http.d) folder
in the repository. 

You can setup a volume to link to the ```/opt/recipes/http.d``` folder inside your container to change the configuration. Keep in mind that you will not receive any updates on the configuration 
if you manually change it/bind the folder as a volume. 


### **Required Headers**

Please be sure to supply all required headers in your nginx/Apache/Caddy/... configuration!

nginx:
```nginx
location / {
    proxy_set_header Host $http_host; # try $host instead if this doesn't work
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8080; # replace port
    proxy_redirect http://127.0.0.1:8080 https://recipes.domain.tld; # replace port and domain
}
```

Apache:
```apache
RequestHeader set X-Forwarded-Proto "https"
Header always set Access-Control-Allow-Origin "*"

ProxyPreserveHost  On
ProxyRequests Off
ProxyPass / http://localhost:8080/ # replace port
ProxyPassReverse / http://localhost:8080/ # replace port
```

### **Setup issues on Raspberry Pi**

!!! danger
    Tandoor 2 does no longer build images for arm/v7 architectures. You can certainly get Tandoor working there but it has simply been to much effort to maintain these architectures over the past years
    to justify the continued support of this mostly deprecated platform. 

!!!info
    Always wait at least 2-3 minutes after the very first start, since migrations will take some time!


If you're having issues with installing Tandoor on your Raspberry Pi or similar device,
follow these instructions:

- Stop all Tandoor containers (`docker-compose down`)
- Delete local database folder (usually 'postgresql' in the same folder as your 'docker-compose.yml' file)
- Start Tandoor containers again (`docker-compose up -d`)
- Wait for at least 2-3 minutes and then check if everything is working now (migrations can take quite some time!)
- If not, check logs of the web_recipes container with `docker logs <container_name>` and make sure that all migrations are indeed already done

### Sub Path nginx config

If hosting under a sub-path you might want to change the default nginx config
with the following config.

```nginx
location /my_app { # change to subfolder name
    include /config/nginx/proxy.conf;
    proxy_pass https://mywebapp.com/; # change to your host name:port
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Script-Name /my_app; # change to subfolder name
    proxy_cookie_path / /my_app; # change to subfolder name
}

location /media/ {
    include /config/nginx/proxy.conf;
    alias /mediafiles/;
    client_max_body_size 16M;

}

location /static/ {
    include /config/nginx/proxy.conf;
    alias /staticfiles/;
    client_max_body_size 16M;

}
```
### Tandoor 1 vs Tandoor 2
Tandoor 1 includes gunicorn, a python WSGI server that handles python code well but is not meant to serve mediafiles. Thus, it has always been recommended to set up a nginx webserver 
(not just a reverse proxy) in front of Tandoor to handle mediafiles. The gunicorn server by default is exposed on port 8080.

Tandoor 2 now occasionally bundles nginx inside the container and exposes port 80 where mediafiles are handled by nginx and all the other requests are (mostly) passed to gunicorn.

A [GitHub Issue](https://github.com/TandoorRecipes/recipes/issues/3851) has been created to allow for discussions and FAQ's on this issue while this change is fresh. It will later be updated in the docs here if necessary. 