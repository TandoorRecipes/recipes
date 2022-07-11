# How to migrate from sqlite3 database to postgresql 
This migration was written while using the unraid template (docker) for TandoorRecipes, version 1.3.0.
While some commands are unraid specific, it should in general work for any setup.

1. Make a backup of your `/mnt/user/appdata/recipes` dir.

2. Without changing any settings, get a shell into the TandoorRecipes docker through the Web-UI or by running `docker exec -it TandoorRecipes /bin/sh`
```cmd
cd /opt/recipes
./venv/bin/python manage.py export -a > /data/dump.json
```

3. Create a Postgresql database (With a new user & database for recipes)

I used the `postgresql14` template.

```cmd
psql -U postgres
postgres=# create database tandoor;
postgres=# create user tandoor with encrypted password 'yoursupersecretpassworddontusethisone';
postgres=# grant all privileges on database tandoor to tandoor;
```

4. Now its time to change some enviourment variables in TandoorRecipes template:
```env
DB_ENGINE=django.db.backends.postgresql  # Database Engine, previous value: `django.db.backends.sqlite3`
POSTGRES_HOST=<Your unraid host ip>  # PostgreSQL Host
POSTGRES_PORT=5432  # PostgreSQL Host
POSTGRES_USER=tandoor  # PostgreSQL User
POSTGRES_PASSWORD=yoursupersecretpassworddyoudidntcopy  # PostgreSQL Password
POSTGRES_DB=tandoor  # Database, previous value: `/data/recipes.db`
```

5. Save it, and start the container once.

It will perform all database migrations once for the postgresql database.

6. Get a shell into the docker through the WEB-UI or by running `docker exec -it TandoorRecipes /bin/sh`
```cmd
cd /opt/recipes
./venv/bin/python manage.py import /data/dump.json
```

7. Enjoy your new fuzzy search options and SLIGHTLY performance increase!
