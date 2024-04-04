There is currently no "good" way of backing up your data implemented in the application itself.
This mean that you will be responsible for backing up your data.

It is planned to add a "real" backup feature similar to applications like homeassistant where a snapshot can be
downloaded and restored through the web interface.

!!! warning
    When developing a new backup strategy, make sure to also test the restore process!

## Database
Please use any standard way of backing up your database. For most systems this can be achieved by using a dump
command that will create an SQL file with all the required data.

Please refer to your Database System documentation.

I personally use a [little script](https://github.com/vabene1111/DockerPostgresBackups) that I have created to automatically pull SQL dumps from a postgresql database.
It is **neither** well tested nor documented so use at your own risk.
I would recommend using it only as a starting place for your own backup strategy.

## Mediafiles
The only Data this application stores apart from the database are the media files (e.g. images) used in your
recipes.

They can be found in the mediafiles mounted directory (depending on your installation).

To create a backup of those files simply copy them elsewhere. Do it the other way around for restoring.

The filenames consist of `<random uuid4>_<recipe_id>`. In case you screw up really badly this can help restore data.

## Manual backup from docker build
The standard docker build of tandoor uses postgresql as the back end database. This can be backed up using a function called "dumpall". This generates a .SQL file containing a list of commands for a postgresql server to use to rebuild your database. You will also need to back up the media files separately.

Making a full copy of the docker directory can work as a back up, but only if you know you will be using the same hardware, os, and postgresql version upon restore. If not, then the different version of postgresql won't be compatible with the existing tables.
You can back up from docker even when the tandoor container is failing, so long as the postgresql database has started successfully. When using this backup method, ensure that your recipes have imported successfully. One user reported only the titles and images importing on first try, requiring a second run of the import command.

the following commands assume that your docker-compose files are in a folder called "docker". replace "docker_db_recipes_1" with the name of your db container. The commands also assume you use a backup name of pgdump.sql. It's a good idea to include a date in this filename, so that successive backups do not get deleted.
To back up:
```
sudo docker exec -t docker_db_recipes_1 pg_dumpall -U djangouser > pgdump.sql

```

To restore:
```
cat pgdump.sql | sudo docker exec -i docker_db_recipes_1 psql postgres -U djangouser

```
This connects to the postgres table instead of the actual djangodb table, as the import function needs to delete the table, which can't be dropped off you're connected to it.

## Backup using export and import
You can now export recipes from Tandoor using the export function. This method requires a working web interface.
1. Click on a recipe
2. Click on the three meatballs then export
3. Select the all recipes toggle and then export. This should download a zip file.

Import:
Go to Import > from app > tandoor and select the zip file you want to import from.

## Backing up using the pgbackup container
You can add [pgbackup](https://hub.docker.com/r/prodrigestivill/postgres-backup-local) to manage the scheduling and automatic backup of your postgres database.
Modify the below to match your environment and add it to your `docker-compose.yml`

``` yaml
  pgbackup:
    container_name: pgbackup
    env_file:
      - ./.env
    environment:
      BACKUP_KEEP_DAYS: "8"
      BACKUP_KEEP_MONTHS: "6"
      BACKUP_KEEP_WEEKS: "4"
      POSTGRES_EXTRA_OPTS: -Z6 --schema=public --blobs
      SCHEDULE: '@daily'
    # Note: the tag must match the version of postgres you are using
    image: prodrigestivill/postgres-backup-local:15
    restart: unless-stopped
    volumes:
      - backups/postgres:/backups
```
You can manually initiate a backup by running `docker exec -it pgbackup ./backup.sh`
