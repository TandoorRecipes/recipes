The Updating process depends on your chosen method of [installation](/install/docker)

While intermediate updates can be skipped when updating please make sure to 
**read the release notes** in case some special action is required to update.

## Docker
For all setups using Docker the updating process look something like this

0. Before updating it is recommended to **create a [backup](/system/backup)!**
1. Stop the container using `docker-compose down`
2. Pull the latest image using `docker-compose pull`
3. Start the container again using `docker-compose up -d`


## Manual

For all setups using a manual installation updates usually involve downloading the latest source code from GitHub.
After that make sure to run:

1. `manage.py collectstatic`
2. `manage.py migrate`

To apply all new migrations and collect new static files.