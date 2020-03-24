This is a docker compose example when using [jwilder's nginx reverse proxy](https://github.com/jwilder/docker-gen) 
in combination with [jrcs's letsencrypt companion](https://hub.docker.com/r/jrcs/letsencrypt-nginx-proxy-companion/).

Please refer to the appropriate documentation on how to setup the reverse proxy and networks.

Remember to add the appropriate environment variables to `.env` file:
```
VIRTUAL_HOST=
LETSENCRYPT_HOST=
LETSENCRYPT_EMAIL=
```