#!/bin/sh
source venv/bin/activate

echo "Waiting for database to be ready..."

attempt=0
max_attempts=20
while pg_isready --host=${POSTGRES_HOST} -q; status=$?; attempt=$((attempt+1)); [ $status -ne 0 ] && [ $attempt -le $max_attempts ]; do
    sleep 5 # no echo needed, response comes from pg_isready already
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

exec gunicorn -b :8080 --access-logfile - --error-logfile - --log-level INFO recipes.wsgi