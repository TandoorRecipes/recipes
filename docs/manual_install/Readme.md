# Manual installation instructions

These intructions are inspired from a standard django/gunicorn/postgresql instructions ([for example](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-16-04))

**Important note:** Be sure to use pyton3.8 and pip related to python 3.8. Depending on your distribution calling `python` or `pip` will use python2 instead of pyton 3.8.

## Prerequisites

*Optional*: create a virtual env and activate it

Download the latest release from <https://github.com/vabene1111/recipes/releases>

Install postgresql requirements: `sudo apt install libpq-dev postgresql`
Install project requirements: `pip3.8 install -r requirements.txt`

## Setup postgresql

Run `sudo -u postgres psql`

In the psql console:

```sql
CREATE DATABASE djangodb;
CREATE USER djangouser WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE djangodb TO djangouser;
ALTER DATABASE djangodb OWNER TO djangouser;

--Maybe not necessary, but should be faster:
ALTER ROLE djangouser SET client_encoding TO 'utf8';
ALTER ROLE djangouser SET default_transaction_isolation TO 'read committed';
ALTER ROLE djangouser SET timezone TO 'UTC';

--Grant superuser right to your new user, it will be removed later
ALTER USER djangouser WITH SUPERUSER;
```

Move or copy `.env.template` to `.env` and update it with relevent values. For example:

```env
# only set this to true when testing/debugging
# when unset: 1 (true) - dont unset this, just for development
DEBUG=0

# hosts the application can run under e.g. recipes.mydomain.com,cooking.mydomain.com,...
#ALLOWED_HOSTS=*

# random secret key, use for example base64 /dev/urandom | head -c50 to generate one
SECRET_KEY=TOGENERATE

# add only a database password if you want to run with the default postgres, otherwise change settings accordingly
DB_ENGINE=django.db.backends.postgresql_psycopg2
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=djangouser
POSTGRES_PASSWORD=password
POSTGRES_DB=djangodb

# Serve mediafiles directly using gunicorn. Basically everyone recommends not doing this. Please use any of the examples
# provided that include an additional nxginx container to handle media file serving.
# If you know what you are doing turn this back on (1) to serve media files using djangos serve() method.
# when unset: 1 (true) - this is temporary until an appropriate amount of time has passed for everyone to migrate
GUNICORN_MEDIA=0


# allow authentication via reverse proxy (e.g. authelia), leave of if you dont know what you are doing
# docs: https://github.com/vabene1111/recipes/tree/develop/docs/docker/nginx-proxy%20with%20proxy%20authentication
# when unset: 0 (false)
REVERSE_PROXY_AUTH=0


# the default value for the user preference 'comments' (enable/disable commenting system)
# when unset: 1 (true)
COMMENT_PREF_DEFAULT=1
```

## Initialize the application

Execute `export $(cat .env |grep "^[^#]" | xargs)` to load variables from `.env`

Execute `/python3.8 manage.py migrate`

And revert superuser from postgres: `sudo -u postgres psql` and `ALTER USER djangouser WITH NOSUPERUSER;`

Generate static files: `python3.8 manage.py collectstatic` and remember the folder where files have been copied.

## Setup web services

### gunicorn

Create a service that will start gunicorn at boot: `sudo nano /etc/systemd/system/gunicorn_recipes.service`

And enter these lines:

```service
[Unit]
Description=gunicorn daemon for recipes
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=3
Group=www-data
WorkingDirectory=/media/data/recipes
EnvironmentFile=/media/data/recipes/.env
ExecStart=/opt/.pyenv/versions/3.8.5/bin/gunicorn --error-logfile /tmp/gunicorn_err.log --log-level debug --capture-output --bind unix:/media/data/recipes/recipes.sock recipes.wsgi:application

[Install]
WantedBy=multi-user.target
```

*Note*: `-error-logfile /tmp/gunicorn_err.log --log-level debug --capture-output` are usefull for debugging and can be removed later

*Note2*: Fix the path in the `ExecStart` line to where you gunicorn and recipes are

Finally, run `sudo systemctl enable gunicorn_recipes.service` and `sudo systemctl start gunicorn_recipes.service`. You can check that the service is correctly started with `systemctl status gunicorn_recipes.service`

### nginx

Now we tell nginx to listen to a new port and forward that to gunicorn. `sudo nano /etc/nginx/sites-available/recipes.conf`

And enter these lines:

```nginx
server {
    listen 8002;
    #access_log /var/log/nginx/access.log;
    #error_log /var/log/nginx/error.log;

    # serve media files
    location /static {
        alias /media/data/recipes/staticfiles;
    }

    location / {
        proxy_pass http://unix:/media/data/recipes/recipes.sock;
    }
}
```

*Note*: Enter the correct path in static and proxy_pass lines.

Enable the website `sudo ln -s /etc/nginx/sites-available/recipes.conf /etc/nginx/sites-enabled` and restart nginx : `sudo systemctl restart nginx.service`
