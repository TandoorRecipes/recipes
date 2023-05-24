#!/bin/sh
source venv/bin/activate

TANDOOR_PORT="${TANDOOR_PORT:-8080}"
GUNICORN_WORKERS="${GUNICORN_WORKERS:-3}"
GUNICORN_THREADS="${GUNICORN_THREADS:-2}"
GUNICORN_LOG_LEVEL="${GUNICORN_LOG_LEVEL:-'info'}"
NGINX_CONF_FILE=/opt/recipes/nginx/conf.d/Recipes.conf

display_warning() {
    echo "[WARNING]"
    echo -e "$1"
}

echo "Checking configuration..."

# Nginx config file must exist if gunicorn is not active
if [ ! -f "$NGINX_CONF_FILE" ] && [ $GUNICORN_MEDIA -eq 0 ]; then
    display_warning "Nginx configuration file could not be found at the default location!\nPath: ${NGINX_CONF_FILE}"
fi

# SECRET_KEY must be set in .env file
if [ -z "${SECRET_KEY}" ]; then
    display_warning "The environment variable 'SECRET_KEY' is not set but REQUIRED for running Tandoor!"
fi


echo "Waiting for database to be ready..."

attempt=0
max_attempts=20

if [ "${DB_ENGINE}" != 'django.db.backends.sqlite3' ]; then

  # POSTGRES_PASSWORD must be set in .env file
  if [ -z "${POSTGRES_PASSWORD}" ]; then
      display_warning "The environment variable 'POSTGRES_PASSWORD' is not set but REQUIRED for running Tandoor!"
  fi

  while pg_isready --host=${POSTGRES_HOST} --port=${POSTGRES_PORT} --user=${POSTGRES_USER} -q; status=$?; attempt=$((attempt+1)); [ $status -ne 0 ] && [ $attempt -le $max_attempts ]; do
      sleep 5
  done
fi

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

exec gunicorn -b :$TANDOOR_PORT --workers $GUNICORN_WORKERS --threads $GUNICORN_THREADS --access-logfile - --error-logfile - --log-level $GUNICORN_LOG_LEVEL recipes.wsgi
