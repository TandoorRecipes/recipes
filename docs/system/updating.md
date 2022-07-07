The Updating process depends on your chosen method of [installation](/install/docker)

While intermediate updates can be skipped when updating please make sure to 
**read the release notes** in case some special action is required to update.

## Docker
For all setups using Docker the updating process look something like this

0. Before updating it is recommended to **create a [backup](/system/backup)!**
1. Stop the container using `docker-compose down`
2. Pull the latest image using `docker-compose pull`
3. Start the container again using `docker-compose up -d`

## Docker Script
```
#get vars
input name of docker_db_container
input working directory

#backup docker
sudo docker exec -t docker_db_recipes_1 pg_dumpall -U djangouser > pgdump.sql

docker-compose down
mv postgresql date_postgresqlbackup
check that docker-compose.yml files are up to date with latest recommended from install instructions
check that .env is up to date with latest recommended from install instructions

#start update
docker-compose pull
docker-compose up -d
wait 5 minutes
docker-compose down
docker-compose up -d
wait 5 minutes

#import database to new setup
cat pgdump.sql | sudo docker exec -i docker_db_recipes_1 psql postgres -U djangouser
docker-compose down
docker-compose up -d
```

## Manual

For all setups using a manual installation updates usually involve downloading the latest source code from GitHub.
After that make sure to run:

1. `manage.py collectstatic`
2. `manage.py migrate`

To apply all new migrations and collect new static files.
