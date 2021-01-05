!!! info "Community Contributed"
    The examples in this section were contributed by members of the community.
    This page especially contains some setups that might help you if you really want to go down a certain path but none
    of the examples are supported (as i simply am not able to give you support for them).


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

I left out the TLS config in this example for simplicty.