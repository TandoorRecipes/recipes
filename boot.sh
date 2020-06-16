#!/bin/sh
source venv/bin/activate

echo "Updating database"
python manage.py migrate
python manage.py collectstatic --noinput
echo "Done"

chmod -R 755 /opt/recipes/mediafiles

exec gunicorn -b :8080 --access-logfile - --error-logfile ./gunicorn-error.log recipes.wsgi