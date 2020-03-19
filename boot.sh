#!/bin/sh
source venv/bin/activate

echo "Updating database"
python3 manage.py migrate
python3 manage.py collectstatic --noinput
echo "Done"

exec gunicorn -b :8080 --access-logfile - --error-logfile - recipes.wsgi