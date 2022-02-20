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
The standard docker build of tandoor uses postgresql as the back end database. This can be backed up using a function called "dumpall". This effectively generates a list of commands for a postgresql server to use to rebuild your database. You will also need to back up the media files separately.

Making a full copy of the docker directory can work as a back up, but only if you know you will be using the same hardware, os, and postgresql version upon restore. If not, then the different version of postgresql won't be compatible with the existing tables.

To back up:
```
Sudo docker exec -t db_recipes -c -U djangouser
```

To restore:
```
Cat dump.sql | docker exec -i psql postgres -U djangouser
```
This connects to the postgres table instead of the actual dgangodb table, as the import function needs to delete the table, which can't be dropped off you're connected to it.

