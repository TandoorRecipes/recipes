#!/bin/sh
source venv/bin/activate

echo "Updating database"
while python manage.py migrate ; status=$? ; [ $status -eq 1 ]; do
        echo "Migration failed (error #${status})! Database may not be ready yet, retrying in 5 seconds..."
        sleep 5
done
python manage.py collectstatic_js_reverse
python manage.py collectstatic --noinput
echo "Done"

chmod -R 755 /opt/recipes/mediafiles

exec gunicorn -b :8080 --access-logfile - --error-logfile - --log-level INFO recipes.wsgi
