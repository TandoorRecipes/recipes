#!/bin/sh
source venv/bin/activate

TANDOOR_PORT="${TANDOOR_PORT:-8080}"

echo "Updating database"
python manage.py migrate
python manage.py collectstatic_js_reverse
python manage.py collectstatic --noinput
echo "Done"

chmod -R 755 /opt/recipes/mediafiles

exec gunicorn -b :$TANDOOR_PORT --access-logfile - --error-logfile - --log-level INFO recipes.wsgi