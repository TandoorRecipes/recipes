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

# SECRET_KEY (or a valid file at SECRET_KEY_FILE) must be set in .env file

if [ -f "${SECRET_KEY_FILE}" ]; then
    export SECRET_KEY=$(cat "$SECRET_KEY_FILE")
fi

if [ -z "${SECRET_KEY}" ]; then
    display_warning "The environment variable 'SECRET_KEY' (or 'SECRET_KEY_FILE' that points to an existing file) is not set but REQUIRED for running Tandoor!"
fi

if [ -f "${AUTH_LDAP_BIND_PASSWORD_FILE}" ]; then
    export AUTH_LDAP_BIND_PASSWORD=$(cat "$AUTH_LDAP_BIND_PASSWORD_FILE")
fi

if [ -f "${EMAIL_HOST_PASSWORD_FILE}" ]; then
    export EMAIL_HOST_PASSWORD=$(cat "$EMAIL_HOST_PASSWORD_FILE")
fi

if [ -f "${SOCIALACCOUNT_PROVIDERS_FILE}" ]; then
    export SOCIALACCOUNT_PROVIDERS=$(cat "$SOCIALACCOUNT_PROVIDERS_FILE")
fi


echo "Waiting for database to be ready..."

attempt=0
max_attempts=20

if [ "${DB_ENGINE}" == 'django.db.backends.postgresql' ] || [ "${DATABASE_URL}" == 'postgres'* ]; then

  # POSTGRES_PASSWORD (or a valid file at POSTGRES_PASSWORD_FILE) must be set in .env file

  if [ -f "${POSTGRES_PASSWORD_FILE}" ]; then
    export POSTGRES_PASSWORD=$(cat "$POSTGRES_PASSWORD_FILE")
  fi

  if [ -z "${POSTGRES_PASSWORD}" ]; then
      display_warning "The environment variable 'POSTGRES_PASSWORD' (or 'POSTGRES_PASSWORD_FILE' that points to an existing file) is not set but REQUIRED for running Tandoor!"
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

echo "Collecting static files, this may take a while..."

python manage.py collectstatic_js_reverse
python manage.py collectstatic --noinput

echo "Done"

chmod -R 755 /opt/recipes/mediafiles

ipv6_disable=$(cat /sys/module/ipv6/parameters/disable)

# Check if IPv6 is enabled, only then run gunicorn with ipv6 support
if [ "$ipv6_disable" -eq 0 ]; then
    exec gunicorn -b "[::]:$TANDOOR_PORT" --workers $GUNICORN_WORKERS --threads $GUNICORN_THREADS --access-logfile - --error-logfile - --log-level $GUNICORN_LOG_LEVEL recipes.wsgi
else
    exec gunicorn -b ":$TANDOOR_PORT" --workers $GUNICORN_WORKERS --threads $GUNICORN_THREADS --access-logfile - --error-logfile - --log-level $GUNICORN_LOG_LEVEL recipes.wsgi
fi
