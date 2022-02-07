#!/bin/sh
source venv/bin/activate

echo "Migrating database"

attempt=0
max_attempts=20
while python manage.py migrate; \
      status=$?; \
      attempt=$((attempt+1)); \
      [ $status -eq 1 ] \
   && [ $attempt -le $max_attempts ]; do
    echo -e "\n!!! Migration failed (error ${status}, attempt ${attempt}/${max_attempts})."
    echo "!!! Database may not be ready yet or system is misconfigured."
    echo -e "!!! Retrying in 5 seconds...\n"
    sleep 5
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "\n!!! Migration failed. Maximum attempts exceeded."
    echo "!!! Please check logs above - misconfiguration is very likely."
    echo "!!! Shutting down container."
    exit 1 # exit with error to make the container stop
fi

echo "Generating static files"

python manage.py collectstatic_js_reverse
python manage.py collectstatic --noinput

echo "Done"

chmod -R 755 /opt/recipes/mediafiles

exec gunicorn -b :8080 --access-logfile - --error-logfile - --log-level INFO recipes.wsgi
