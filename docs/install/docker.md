!!! success "Recommended Installation"
    Setting up this application using Docker is recommended. This does not mean that other options are bad, just that
    support is much easier for this setup.

It is possible to install this application using many different Docker configurations.

Please read the instructions on each example carefully and decide if this is the way for you.

## **DockSTARTer**

The main goal of [DockSTARTer](https://dockstarter.com/) is to make it quick and easy to get up and running with Docker.
You may choose to rely on DockSTARTer for various changes to your Docker system or use DockSTARTer as a stepping stone and learn to do more advanced configurations.
Follow the guide for installing DockSTARTer and then run `ds` then select 'Configuration' and 'Select Apps' to get Tandoor up and running quickly and easily.

## **Docker**

The docker image (`vabene1111/recipes`) simply exposes the application on the container's port `8080`.

It can be run and accessed on port 80 using:

```shell
docker run -d \
    -v "$(pwd)"/staticfiles:/opt/recipes/staticfiles \
    -v "$(pwd)"/mediafiles:/opt/recipes/mediafiles \
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

Also, don't forget to replace the placeholders for ```SECRET_KEY``` and ```POSTGRES_PASSWORD```!

## **Versions**

There are different versions (tags) released on [Docker Hub](https://hub.docker.com/r/vabene1111/recipes/tags).

-   **latest** Default image. The one you should use if you don't know that you need anything else.
-   **beta** Partially stable version that gets updated every now and then. Expect to have some problems.
-   **develop** If you want the most bleeding edge version with potentially many breaking changes feel free to use this version (not recommended!).
-   **X.Y.Z** each released version has its own image. If you need to revert to an old version or want to make sure you stay on one specific use these tags.

!!! danger "No Downgrading"
    There is currently no way to migrate back to an older version as there is no mechanism to downgrade the database.
    You could probably do it but I cannot help you with that. Choose wisely if you want to use the unstable images.
    That said **beta** should usually be working if you like frequent updates and new stuff.

## **Docker Compose**

The main, and also recommended, installation option for this application is Docker Compose.

1. Choose your `docker-compose.yml` from the examples below.
2. Download the `.env` configuration file with `wget`
    ```shell
    wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O .env
    ```
3. **Edit it accordingly** (you NEED to set `SECRET_KEY` and `POSTGRES_PASSWORD`).
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

!!!note
    Don't forget to [download and configure](#docker-compose) your ```.env``` file!

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

!!!note
    Don't forget to [download and configure](#docker-compose) your ```.env``` file!

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

!!!note
    Don't forget to [download and configure](#docker-compose) your ```.env``` file!

#### **Nginx Swag by LinuxServer**

[This container](https://github.com/linuxserver/docker-swag) is an all in one solution created by LinuxServer.io.

It contains templates for popular apps, including Tandoor Recipes, so you don't have to manually configure nginx and discard the template provided in Tandoor repo. Tandoor config is called `recipes.subdomain.conf.sample` which you can adapt for your instance.

If you're running Swag on the default port, you'll just need to change the container name to yours.

If your running Swag on a custom port, some headers must be changed:

-   Create a copy of `proxy.conf`
-   Replace `proxy_set_header X-Forwarded-Host $host;` and `proxy_set_header Host $host;` to
    -   `proxy_set_header X-Forwarded-Host $http_host;` and `proxy_set_header Host $http_host;`
-   Update `recipes.subdomain.conf` to use the new file
-   Restart the linuxserver/swag container and Recipes will work correctly

More information [here](https://github.com/TandoorRecipes/recipes/issues/959#issuecomment-962648627).

In both cases, also make sure to mount `/media/` in your swag container to point to your Tandoor Recipes Media directory.

Please refer to the [appropriate documentation](https://github.com/linuxserver/docker-swag#usage) for the container setup.

For step-by-step instructions to set this up from scratch, see [this example](swag.md).

#### **Pure Nginx**

If you have Nginx installed locally on your host system without using any third party integration like Swag or similar, this is for you.

You can use the Docker-Compose file from [Plain](#plain).
!!!warning "Adjust Docker-Compose file"
    Replace `80:80` with `PORT:80` with PORT being your desired outward-facing port.
    In the nginx config example below, 8080 is used.

An example configuration with LetsEncrypt to get you started can be seen below.
Please note, that since every setup is different, you might need to adjust some things.

!!!warning "Placeholders"
    Don't forget to replace the domain and port.

```nginx
server {
    if ($host = recipes.mydomain.tld) { # replace domain
        return 301 https://$host$request_uri;
    }

    server_name recipes.mydomain.tld; # replace domain
    listen 80;
    return 404;
}
server {
    server_name recipes.mydomain.tld; # replace domain
    listen 443 ssl;

    ssl_certificate /etc/letsencrypt/live/recipes.mydomain.tld/fullchain.pem; # replace domain
    ssl_certificate_key /etc/letsencrypt/live/recipes.mydomain.tld/privkey.pem; # replace domain
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        location / {
            proxy_set_header Host $http_host; # try $host instead if this doesn't work
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_pass http://127.0.0.1:8080; # replace port
            proxy_redirect http://127.0.0.1:8080 https://recipes.domain.tld; # replace port and domain
        }
}
```

Tandoor does not support directly serving of images, as explained in the [Nginx vs Gunicorn"](#nginx-vs-gunicorn) section.  If you are already using nginx to serve as a reverse proxy, you can configure it to serve images as well.

Add the following directly after the `location /` context:

```
        location /media/ {
            root   /media/;
            index  index.html index.htm;
        }
```

Make sure you also update your `docker-compose.yml` file to mount the `mediafiles` directory.  If you are using the [Plain](#plain) deployment, you do not need to make any changes.  If you are using nginx to act as a reverse proxy for other apps, it may not be optimal to have `mediafiles` mounted to `/media`.  In that case, adjust the directory declarations as needed, utilizing nginx's [`alias`](https://nginx.org/en/docs/http/ngx_http_core_module.html#alias) if needed.

!!!note
    Use `alias` if your mount point directory is not the same as the URL request path.  Tandoor media files are requested from `$http_host/media/recipes/xxx.jpg`.  This means if you are mounting to a directory that does **NOT** end in `./media`, you will need to use `alias`.

!!!note
    Don't forget to [download and configure](#docker-compose) your ```.env``` file!

#### **Apache**

You can use the Docker-Compose file from [Plain](#plain).
!!!warning "Adjust Docker-Compose file"
    Replace `80:80` with `PORT:80` with PORT being your desired outward-facing port.
    In the Apache config example below, 8080 is used.

If you use e.g. LetsEncrypt for SSL encryption, you can use the example configuration from [solaris7590](https://github.com/TandoorRecipes/recipes/issues/1312#issuecomment-1020034375) below.

!!!warning "Placeholders"
    Don't forget to replace the domain and port.

```apache
<IfModule mod_ssl.c>
    <VirtualHost *:80>
        ServerAdmin webmaster@mydomain.de # replace domain
        ServerName mydomain.de # replace domain

        Redirect permanent / https://mydomain.de/ # replace domain
    </VirtualHost>

    <VirtualHost *:443>
        ServerAdmin webmaster@mydomain.de # replace domain
        ServerName mydomain.de # replace domain

        SSLEngine on

        RequestHeader set X-Forwarded-Proto "https"
        Header always set Access-Control-Allow-Origin "*"

        ProxyPreserveHost  On
        ProxyRequests Off
        ProxyPass / http://localhost:8080/ # replace port
        ProxyPassReverse / http://localhost:8080/ # replace port

        SSLCertificateFile /etc/letsencrypt/live/mydomain.de/fullchain.pem # replace domain/path
        SSLCertificateKeyFile /etc/letsencrypt/live/mydomain.de/privkey.pem # replace domain/path
        Include /etc/letsencrypt/options-ssl-apache.conf

        ErrorLog ${APACHE_LOG_DIR}/recipes_error.log
        CustomLog ${APACHE_LOG_DIR}/recipes_access.log combined
    </VirtualHost>
</IfModule>
```

If you're having issues with the example configuration above, you can try [beedaddy](https://github.com/TandoorRecipes/recipes/issues/1312#issuecomment-1015252663)'s example config.

!!!note
    Don't forget to [download and configure](#docker-compose) your ```.env``` file!

#### **Others**

If you use none of the above mentioned reverse proxies or want to use an existing one on your host machine (like a local nginx or Caddy), simply use the [Plain](#plain) setup above and change the outbound port to one of your liking.

An example port config (inside the respective docker-compose.yml) would be: `8123:80` instead of the `80:80` or if you want to be sure, that Tandoor is **just** accessible via your proxy and don't wanna bother with your firewall, then `127.0.0.1:8123:80` is a viable option too.

!!!note
    Don't forget to [download and configure](#docker-compose) your ```.env``` file!

## **Additional Information**

### **Nginx vs Gunicorn**

All examples use an additional `nginx` container to serve mediafiles and act as the forward facing webserver.
This is **technically not required** but **very much recommended**.

I do not 100% understand the deep technical details but the [developers of gunicorn](https://serverfault.com/questions/331256/why-do-i-need-nginx-and-something-like-gunicorn/331263#331263),
the WSGi server that handles the Python execution, explicitly state that it is not recommended to deploy without nginx.
You will also likely not see any decrease in performance or a lot of space used as nginx is a very light container.

!!! info
    Even if you run behind a reverse proxy as described above, using an additional nginx container is the recommended option.

If you run a small private deployment and don't care about performance, security and whatever else feel free to run
without a nginx container.

!!! warning
    When running without nginx make sure to enable `GUNICORN_MEDIA` in the `.env`. Without it, media files will be uploaded
    but not shown on the page.

For additional information please refer to the [0.9.0 Release](https://github.com/vabene1111/recipes/releases?after=0.9.0)
and [Issue 201](https://github.com/vabene1111/recipes/issues/201) where these topics have been discussed.
See also refer to the [official gunicorn docs](https://docs.gunicorn.org/en/stable/deploy.html).

### **Nginx Config**

In order to give the user (you) the greatest amount of freedom when choosing how to deploy this application the
webserver is not directly bundled with the Docker image.

This has the downside that it is difficult to supply the configuration to the webserver (e.g. nginx). Up until
version `0.13.0`, this had to be done manually by downloading the nginx config file and placing it in a directory that
was then mounted into the nginx container.

From version `0.13.0`, the config file is supplied using the application image (`vabene1111/recipes`). It is then mounted
to the host system and from there into the nginx container.

This is not really a clean solution, but I could not find any better alternative that provided the same amount of
usability. If you know of any better way, feel free to open an issue.

### **Volumes vs Bind Mounts**

Since I personally prefer to have my data where my `docker-compose.yml` resides, bind mounts are used in the example
configuration files for all user generated data (e.g. Postgresql and media files).

!!!warning
    Please note that [there is a difference in functionality](https://docs.docker.com/storage/volumes/)
    between the two and you cannot always simply interchange them.

You can move everything to volumes if you prefer it this way, **but you cannot convert the nginx config file to a bind
mount.**
If you do so you will have to manually create the nginx config file and restart the container once after creating it.

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

!!!info
    Always wait at least 2-3 minutes after the very first start, since migrations will take some time!

!!!info
    In the past there was a special `*-raspi` version of the image. This no longer exists. The normal Tags all support Arm/v7 architectures which should work on all Raspberry Pi's above Version 1 and the first generation Zero. 
    See [Wikipedia Raspberry Pi specifications](https://en.wikipedia.org/wiki/Raspberry_Pi#Specifications).

If you're having issues with installing Tandoor on your Raspberry Pi or similar device,
follow these instructions:

- Stop all Tandoor containers (`docker-compose down`)
- Delete local database folder (usually 'postgresql' in the same folder as your 'docker-compose.yml' file)
- Start Tandoor containers again (`docker-compose up -d`)
- Wait for at least 2-3 minutes and then check if everything is working now (migrations can take quite some time!)
- If not, check logs of the web_recipes container with `docker logs <container_name>` and make sure that all migrations are indeed already done

### Sub Path nginx config

If hosting under a sub-path you might want to change the default nginx config (which gets mounted through the named volume from the application container into the nginx container)
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
