### Migration from v1 to v2

In version 2, Nginx is included inside the application container. 
You no longer need a separate Nginx service.

Here is a minimal docker-compose example for v2:

```yaml
version: "3.8"

services:
  db:
    image: postgres:16-alpine
    restart: always
    volumes:
      - /path/to/data:/var/lib/postgresql/data
    env_file:
      - ./.env

  app:
    image: vabene1111/recipes:2
    restart: always
    volumes:
      - staticfiles:/opt/recipes/staticfiles
      - /path/to/media:/opt/recipes/mediafiles
    environment:
      POSTGRES_HOST: db
    labels:
      # Traefik is used to expose the app
      traefik.enable: true
      traefik.http.services.tandoor.loadbalancer.server.port: 80

volumes:
  staticfiles: null
