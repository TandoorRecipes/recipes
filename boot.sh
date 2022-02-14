#!/bin/sh
source venv/bin/activate

TANDOOR_PORT="${TANDOOR_PORT:-8080}"
NGINX_CONF_FILE=/opt/recipes/nginx/conf.d/Recipes.conf

echo "Checking configuration..."

if [ ! -f "$NGINX_CONF_FILE" ] && [ $GUNICORN_MEDIA -ne 1 ]; then
    echo -e "\n[WARNING]\nNginx configuration file could not be found at the default location!"
    echo -e "Path: ${NGINX_CONF_FILE}\n"
fi

echo "Waiting for database to be ready..."

attempt=0
max_attempts=20
while pg_isready --host=${POSTGRES_HOST} -q; status=$?; attempt=$((attempt+1)); [ $status -ne 0 ] && [ $attempt -le $max_attempts ]; do
    sleep 5
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "\nDatabase not reachable. Maximum attempts exceeded."
    echo "Please check logs above - misconfiguration is very likely."
    echo "Make sure the DB container is up and POSTGRES_HOST is set properly."
    echo "Shutting down container."
    exit 1 # exit with error to make the container stop
fi

echo "Database is ready"

echo "Migrating database"


python manage.py migrate

echo "Generating static files"

python manage.py collectstatic_js_reverse
python manage.py collectstatic --noinput

echo "Done"

chmod -R 755 /opt/recipes/mediafiles

exec gunicorn -b :$TANDOOR_PORT --access-logfile - --error-logfile - --log-level INFO recipes.wsgi
