#!/bin/sh

set -e
  
host="$1"
shift
cmd="$@"
  
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "postgres" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"
exec $cmd


source venv/bin/activate

echo "Updating database"
python manage.py migrate
python manage.py collectstatic_js_reverse
python manage.py collectstatic --noinput
echo "Done"

chmod -R 755 /opt/recipes/mediafiles

exec gunicorn -b :8080 --access-logfile - --error-logfile - --log-level INFO recipes.wsgi
