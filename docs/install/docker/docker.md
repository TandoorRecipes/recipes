It is possible to install this application using many docker configurations. 

!!! warning 
    Please note that some examples here are given 
    because some people want to use them even tough they are not recommended!

Please read the instructions/notes on each example carefully and decide if this is the way for you.

## Docker
The docker image (`vabene1111/recipes`) simply exposes the application on port `8080`. 

It can be run using
```shell
docker run -d \
    -v ./staticfiles:/opt/recipes/staticfiles \
    -v ./mediafiles:/opt/recipes/mediafiles \
    -p 80:8080 \
    -e SECRET_KEY=
    -e DB_ENGINE=django.db.backends.postgresql
    -e POSTGRES_HOST=db_recipes
    -e POSTGRES_PORT=5432
    -e POSTGRES_USER=djangodb
    -e POSTGRES_PASSWORD=
    -e POSTGRES_DB=djangodb
    vabene1111/recipes
```

Please make sure, if you run your image this way, to consult the [.env.template](https://raw.githubusercontent.com/vabene1111/recipes/master/.env.template)
file in the GitHub repository to verify if additional environment variables are required for your setup.

## Docker Compose
The main and also recommended installation option is to install this application using docker compose.

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
    env_file:
      - ./.env
    volumes:
      - ./staticfiles:/opt/recipes/staticfiles
      - ./mediafiles:/opt/recipes/mediafiles
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
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./staticfiles:/static
      - ./mediafiles:/media

```