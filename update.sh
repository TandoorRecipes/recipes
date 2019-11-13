#!/usr/bin/env bash
docker-compose run web_recipes python3 manage.py migrate
docker-compose run web_recipes python3 manage.py collectstatic --noinput
