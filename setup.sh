#!/bin/sh
source venv/bin/activate
echo "Creating Superuser."
python manage.py createsuperuser
echo "Done"