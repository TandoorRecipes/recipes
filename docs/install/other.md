!!! info "Community Contributed"
    The examples in this section were contributed by members of the community.
    This page especially contains some setups that might help you if you really want to go down a certain path but none
    of the examples are supported (as I simply am not able to give you support for them).


## Apache + Traefik + Sub-Path

This guide was contributes by [incaseoftrouble](https://github.com/incaseoftrouble) in [Issue #266](https://github.com/vabene1111/recipes/issues/266)

My setup is docker-compose / traefik / apache / recipes. Swapping out apache for nginx should be straightforward.

Relevant parts:

docker-compose:
```yaml
  apache:
    # omitting other config
    volumes:
      - ./recipes/static:/var/www/recipes/static:ro
      - ./recipes/media:/var/www/recipes/media:ro
    labels:
      traefik.enable: true
      traefik.http.routers.apache-recipes.rule: Host(`<host>`) && PathPrefix(`/<www path>`)
      traefik.http.routers.apache-recipes.entrypoints: http
      traefik.http.routers.apache-recipes.service: apache
      traefik.http.services.apache.loadbalancer.server.port: 80
      traefik.http.services.apache.loadbalancer.server.scheme: http
...

  recipes:
    volumes:
      - ./recipes/static:/opt/recipes/staticfiles:rw
      - ./recipes/media:/opt/recipes/mediafiles:rw
    environment:
      # all the other env
      - SCRIPT_NAME=/<sub path>
      - JS_REVERSE_SCRIPT_PREFIX=/<sub path>/
      - STATIC_URL=/<www path>/static/
      - MEDIA_URL=/<www path>/media/
    labels:
      traefik.enable: true
      traefik.http.routers.recipes.rule: Host(`<host>`) && PathPrefix(`/<sub path>`)
      traefik.http.routers.recipes.entrypoints: http
      traefik.http.services.recipes.loadbalancer.server.port: 8080
      traefik.http.services.recipes.loadbalancer.server.scheme: http
```

apache: 
```
  Alias /<www path>/static/ /var/www/recipes/static/
  Alias /<www path>/media/ /var/www/recipes/media/
  <Directory "/var/www/recipes/">
    Require all granted
  </Directory>
```

I used two paths `<sub path>` and `<www path>` for simplicity. In my case I have `<sub path> = recipes` and `<www path> = serve/recipes`. One could also change the matching rules of traefik to have everything under one path.

I left out the TLS config in this example for simplicity.

## Docker + Apache + Sub-Path

The following could prove to be useful if you are not using Traefik, but instead run Apache as your reverse proxy to route all calls for a shared (sub)domain to a sub path, e.g. https://mydomain.tld/tandoor

As a side note, I am using [Blocky](https://0xerr0r.github.io/blocky/) + [Consul](https://hub.docker.com/r/hashicorp/consul) + [Registrator](https://hub.docker.com/r/gliderlabs/registrator) as a DNS solution.

The relevant Apache config:
```
    <Location /tandoor>
        # in case you want to restrict access to specific IP addresses:
        Require local
        Require forward-dns [myhomedomain.useyourdomain.com]
        Require ip [anylocalorremoteipyouwanttowhitelist]

        # The following assumes that tandoor.service.consul.local resolves to the IP address of the Docker container.
        ProxyPass http://tandoor.service.consul.local:8080/tandoor
        ProxyPassReverse http://tandoor.service.consul.local:8080/tandoor
        RequestHeader add X-Script-Name /tandoor
        RequestHeader set X-Forwarded-Proto "https"
        ProxyPreserveHost On
    </Location>
    <Location /tandoor/static>
        Require local
        Require forward-dns [myhomedomain.useyourdomain.com]
        Require ip [anylocalorremoteipyouwanttowhitelist]

        ProxyPass http://tandoor.service.consul.local:8080/tandoor/tandoor/static
        ProxyPassReverse http://tandoor.service.consul.local:8080/tandoor/static
        RequestHeader add X-Script-Name /tandoor
        RequestHeader set X-Forwarded-Proto "https"
        ProxyPreserveHost On
    </Location>
```
and the relevant section from the docker-compose.yml:
```
   tandoor:
     restart: always
     container_name: tandoor
     image: vabene1111/recipes
     environment:
       - SCRIPT_NAME=/tandoor
       - JS_REVERSE_SCRIPT_PREFIX=/tandoor
       - STATIC_URL=/tandoor/static/
       - MEDIA_URL=/tandoor/media/
       - GUNICORN_MEDIA=0
       - SECRET_KEY=${YOUR_TANDOOR_SECRET_KEY}
       - POSTGRES_HOST=postgres.service.consul.local
       - POSTGRES_PORT=${POSTGRES_PORT}
       - POSTGRES_USER=${YOUR_TANDOOR_POSTGRES_USER}
       - POSTGRES_PASSWORD=${YOUR_TANDOOR_POSTGRES_PASSWORD}
       - POSTGRES_DB=${YOUR_TANDOOR_POSTGRES_DB}
     labels:
        # The following is relevant only if you are using Registrator and Consul
       - "SERVICE_NAME=tandoor"
     volumes:
       - ${YOUR_DOCKER_VOLUME_BASE_DIR}/tandoor/static:/opt/recipes/staticfiles:rw
       # Do not make this a bind mount, see https://docs.tandoor.dev/install/docker/#volumes- vs-bind-mounts
       - tandoor_nginx_config:/opt/recipes/nginx/conf.d
       - ${YOUR_DOCKER_VOLUME_BASE_DIR}}/tandoor/media:/opt/recipes/mediafiles:rw
     depends_on:
        # You will have to set up postgres accordingly
       - postgres
```

The relevant docker-compose.yml for Registrator, Consul, and Blocky, and Autoheal:
```
  consul:
    image: hashicorp/consul
    container_name: consul
    command: >
      agent -server
      -domain consul.local
      -advertise=${YOUR_DOCKER_HOST_IP_ON_THE_LAN}
      -client=0.0.0.0
      -encrypt=${SOME_SECRET_KEY}
      -datacenter=${YOUR_DC_NAME}
      -bootstrap-expect=1
      -ui
      -log-level=info
    environment:
      - "CONSUL_LOCAL_CONFIG={\"skip_leave_on_interrupt\": true, \"dns_config\": { \"service_ttl\": { \"*\": \"0s\" } } }"
    network_mode: "host"
    restart: always

  registrator:
    image: gliderlabs/registrator:latest
    container_name: registrator
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
    command: >
      -internal
      -cleanup=true
      -deregister="always"
      -resync=60
      consul://host.docker.internal:8500
    restart: always

  blocky:
    image: spx01/blocky
    container_name: blocky
    restart: unless-stopped
    healthcheck:
      interval: 30s
      timeout: 5s
      start_period: 1m
    labels:
        # The following is only relevant if you use autoheal
      autoheal: true
    # Optional the instance hostname for logging purpose
    hostname: blocky
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      - "1153:53/tcp"
      - "1153:53/udp"
      - 4000:4000
    environment:
      - TZ=YOUR_TIMEZONE # Optional to synchronize the log timestamp with host
    volumes:
      # Optional to synchronize the log timestamp with host
      - /etc/localtime:/etc/localtime:ro
      # config file
      - ${YOUR_DOCKER_VOLUME_BASE_DIR}/blocky/config.yml:/app/config.yml
    networks:
        # in case you want to bind Blocky to an IP address
      your-docker-network-name:
        ipv4_address: 'some-ip-address-in-the-docker-network-subnet'

  autoheal:
    image: willfarrell/autoheal
    volumes:
        - '/var/run/docker.sock:/var/run/docker.sock'
    environment:
        - AUTOHEAL_CONTAINER_LABEL=autoheal
    restart: always
    container_name: autoheal

```
as well as a snippet of the Blocky configuration:
```
conditional:
  fallbackUpstream: false
  mapping:
    consul.local: tcp+udp:host.docker.internal:8600
```


## WSL

If you want to install Tandoor on the Windows Subsystem for Linux you can find a detailed post here: <https://github.com/TandoorRecipes/recipes/issues/1733>.
