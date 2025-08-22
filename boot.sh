#!/bin/sh
source venv/bin/activate

# these are envsubst in the nginx config, make sure they default to something sensible when unset
export TANDOOR_PORT="${TANDOOR_PORT:-8080}"
export MEDIA_ROOT=${MEDIA_ROOT:-/opt/recipes/mediafiles};
export STATIC_ROOT=${STATIC_ROOT:-/opt/recipes/staticfiles};

GUNICORN_WORKERS="${GUNICORN_WORKERS:-3}"
GUNICORN_THREADS="${GUNICORN_THREADS:-2}"
GUNICORN_LOG_LEVEL="${GUNICORN_LOG_LEVEL:-'info'}"

PLUGINS_BUILD="${PLUGINS_BUILD:-0}"

if [ "${TANDOOR_PORT}" -eq 80 ]; then
    echo "TANDOOR_PORT set to 8080 because 80 is now taken by the integrated nginx"
    TANDOOR_PORT=8080
fi

display_warning() {
    echo "[WARNING]"
    echo -e "$1"
}

echo "Checking configuration..."

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

if [ -f "${S3_SECRET_ACCESS_KEY_FILE}" ]; then
    export S3_SECRET_ACCESS_KEY=$(cat "$S3_SECRET_ACCESS_KEY_FILE")
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

if [ "${PLUGINS_BUILD}" -eq 1 ]; then
    echo "Running yarn build at startup because PLUGINS_BUILD is enabled"
    python plugin.py
fi

echo "Collecting static files, this may take a while..."

python manage.py collectstatic --noinput

echo "Done"

chmod -R 755 ${MEDIA_ROOT:-/opt/recipes/mediafiles}

ipv6_disable=$(cat /sys/module/ipv6/parameters/disable)

# prepare nginx config
envsubst '$MEDIA_ROOT $STATIC_ROOT $TANDOOR_PORT' < /opt/recipes/http.d/Recipes.conf.template > /opt/recipes/http.d/Recipes.conf

# start nginx
echo "Starting nginx"
nginx

echo "Starting gunicorn"
# Check if IPv6 is enabled, only then run gunicorn with ipv6 support
if [ "$ipv6_disable" -eq 0 ]; then
    exec gunicorn -b "[::]:$TANDOOR_PORT" --workers $GUNICORN_WORKERS --threads $GUNICORN_THREADS --access-logfile - --error-logfile - --log-level $GUNICORN_LOG_LEVEL recipes.wsgi
else
    exec gunicorn -b ":$TANDOOR_PORT" --workers $GUNICORN_WORKERS --threads $GUNICORN_THREADS --access-logfile - --error-logfile - --log-level $GUNICORN_LOG_LEVEL recipes.wsgi
fi
