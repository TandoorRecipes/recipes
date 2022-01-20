# Manual installation instructions

These instructions are inspired from a standard django/gunicorn/postgresql instructions ([for example](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-16-04))

!!! warning
    Be sure to use python 3.9 and pip related to python 3.9. Depending on your distribution calling `python` or `pip` will use python2 instead of python 3.9.

## Prerequisites

Setup user: `sudo useradd recipes`

Get the last version from the repository: `git clone https://github.com/vabene1111/recipes.git -b master`

Move it to the `/var/www` directory: `mv recipes /var/www`

Change to the directory: `cd /var/www/recipes`

Give the user permissions: `chown -R recipes:www-data /var/www/recipes`

Create virtual env: `python3.9 -m venv /var/www/recipes`

Install Javascript Tools
```shell
apt install nodejs
npm install --global yarn
```

### Install postgresql requirements

`sudo apt install libpq-dev postgresql`

###Install project requirements

!!! warning "Update"
    Dependencies change with most updates so the following steps need to be re-run with every update or else the application might stop working.
    See section **Updating** below

Using binaries from the virtual env:

`/var/www/recipes/bin/pip3.9 install -r requirements.txt`

You will also need to install front end requirements and build them. For this navigate to the `./vue`folder and run

```shell
yarn install
yarn build
```

## Setup postgresql

`sudo -u postgres psql`

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

Download the `.env` configuration file and **edit it accordingly**.
```shell
wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O /var/www/recipes/.env
```

Things to edit:
- `SECRET_KEY`: use something secure.
- `POSTGRES_HOST`: probably 127.0.0.1.
- `POSTGRES_PASSWORD`: the password we set earlier when setting up djangodb.
- `STATIC_URL`, `MEDIA_URL`: these will be in `/var/www/recipes`, under `/staticfiles/` and `/mediafiles/` respectively.

## Initialize the application

Execute `export $(cat /var/www/recipes/.env |grep "^[^#]" | xargs)` to load variables from `/var/www/recipes/.env`

Execute `bin/python3.9 manage.py migrate`

and revert superuser from postgres: `sudo -u postgres psql` and `ALTER USER djangouser WITH NOSUPERUSER;`

Generate static files: `bin/python3.9 manage.py collectstatic` and `bin/python3.9 manage.py collectstatic_js_reverse` and remember the folder where files have been copied.

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
User=recipes
Group=www-data
WorkingDirectory=/var/www/recipes
EnvironmentFile=/var/www/recipes/.env
ExecStart=/var/www/recipes/bin/gunicorn --error-logfile /tmp/gunicorn_err.log --log-level debug --capture-output --bind unix:/var/www/recipes/recipes.sock recipes.wsgi:application

[Install]
WantedBy=multi-user.target
```

*Note*: `-error-logfile /tmp/gunicorn_err.log --log-level debug --capture-output` are useful for debugging and can be removed later

*Note2*: Fix the path in the `ExecStart` line to where you gunicorn and recipes are

Finally, run `sudo systemctl enable gunicorn_recipes` and `sudo systemctl start gunicorn_recipes`. You can check that the service is correctly started with `systemctl status gunicorn_recipes`

### nginx

Now we tell nginx to listen to a new port and forward that to gunicorn. `sudo nano /etc/nginx/conf.d/recipes.conf`

And enter these lines:

```nginx
server {
    listen 8002;
    #access_log /var/log/nginx/access.log;
    #error_log /var/log/nginx/error.log;

    # serve media files
    location /static {
        alias /var/www/recipes/staticfiles;
    }
    
    location /media {
        alias /var/www/recipes/mediafiles;
    }

    location / {
        proxy_set_header Host $http_host;
        proxy_pass http://unix:/var/www/recipes/recipes.sock;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

*Note*: Enter the correct path in static and proxy_pass lines.

Reload nginx : `sudo systemctl reload nginx`

## Updating
In order to update the application you will need to run the following commands (probably best to put them into a small script).

```shell
# Update source files
git pull
# load envirtonment variables
export $(cat /var/www/recipes/.env |grep "^[^#]" | xargs)
# migrate database 
bin/python3.9 manage.py migrate
# collect static files
bin/python3.9 manage.py collectstatic
bin/python3.9 manage.py collectstatic_js_reverse
# change to frontend directory
cd vue
# install and build frontend
yarn install
yarn build
# restart gunicorn service
sudo systemctl restart gunicorn_recipes
```
