!!! danger
        Please refer to the [official documentation](https://github.com/linuxserver/docker-swag#usage) for the container setup. This example shows just one setup that may or may not differ from yours in significant ways. This tutorial does not cover security measures, backups, and many other things that you might want to consider.

## Prerequisites

- You have a newly spun-up Ubuntu server with docker (pre-)installed.
- At least one `mydomain.com` and one `mysubdomain.mydomain.com` are pointing to the server's IP. (This tutorial does not cover subfolder installation.)
- You have an ssh terminal session open.

## Installation

### Download and edit Tandoor configuration

```
cd /opt
mkdir recipes
cd recipes
wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O .env
base64 /dev/urandom | head -c50
``` 
Copy the response from that last command and paste the key into the `.env` file:
```
nano .env
```
You'll also need to enter a Postgres password into the `.env` file. Then, save the file and exit the editor.

### Install and configure Docker Compose

In keeping with [these instructions](https://docs.linuxserver.io/general/docker-compose):
```
cd /opt
curl -L --fail https://raw.githubusercontent.com/linuxserver/docker-docker-compose/master/run.sh -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

Next, create and edit the docker compose file.

```
nano docker-compose.yml
```

Paste the following and adjust your domains, subdomains and time zone.

```
---
version: "2.1"
services:
  swag:
    image: ghcr.io/linuxserver/swag
    container_name: swag
    cap_add:
      - NET_ADMIN
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Berlin # <---- EDIT THIS <----  <---- 
      - URL=mydomain.com # <---- EDIT THIS <----  <---- 
      - SUBDOMAINS=mysubdomain,myothersubdomain # <---- EDIT THIS <----  <---- 
      - EXTRA_DOMAINS=myotherdomain.com # <---- EDIT THIS <----  <---- 
      - VALIDATION=http
    volumes:
      - ./swag:/config
      - ./recipes/media:/media
    ports:
      - 443:443
      - 80:80
    restart: unless-stopped

  db_recipes:
    restart: always
    container_name: db_recipes
    image: postgres:16-alpine
    volumes:
      - ./recipes/db:/var/lib/postgresql/data
    env_file:
      - ./recipes/.env

  recipes:
    image: vabene1111/recipes
    container_name: recipes
    restart: unless-stopped
    env_file:
      - ./recipes/.env
    environment:
      - UID=1000
      - GID=1000
      - TZ=Europe/Berlin # <---- EDIT THIS  <----  <---- 
    volumes:
      - ./recipes/static:/opt/recipes/staticfiles
      - ./recipes/media:/opt/recipes/mediafiles
    depends_on:
      - db_recipes
```

Save and exit.

### Create containers and configure swag reverse proxy

```
docker-compose up -d
```

```
cd /opt/swag/nginx/proxy-confs
cp recipes.subdomain.conf.sample recipes.subdomain.conf
nano recipes.subdomain.conf
```

Change the line `server_name recipes.*;` to `server_name mysubdomain.*;`, save and exit.

### Finalize

```
cd /opt
docker restart swag recipes
```

Go to `https://mysubdomain.mydomain.com`. (If you get a "502 Bad Gateway" error, be patient. It might take a short while until it's functional.)