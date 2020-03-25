#!/bin/sh

# Change ownership if needed
if [ ! -n "$(find staticfiles -user "$(id -u)" -print -prune -o -prune)" ]
then
    echo "Changing ownership of staticfiles"
    chown -R recipes:recipes staticfiles
fi
if [ ! -n "$(find mediafiles -user "$(id -u)" -print -prune -o -prune)" ]
then
    echo "Changing ownership of mediafiles"
    chown -R recipes:recipes mediafiles
fi

source venv/bin/activate

echo "Updating database"
python manage.py migrate
python manage.py collectstatic --noinput
echo "Done"

exec gunicorn -b :8080 --access-logfile - --error-logfile - recipes.wsgi