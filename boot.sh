#!/bin/sh
source venv/bin/activate

echo "Updating database"
python manage.py migrate
python manage.py collectstatic --noinput
echo "Done"

chmod -R 755 /opt/recipes/mediafiles

mkdir -p /opt/recipes/nginx
cp -u -p /opt/recipes/Recipes.conf /opt/recipes/nginx

exec gunicorn -b :8080 --access-logfile - --error-logfile - --log-level INFO recipes.wsgi