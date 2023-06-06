#!/bin/bash
docker exec -i recipes-db_recipes-1 bash -c 'PGPASSWORD=password psql -h db_recipes -U djangouser -d djangodb -c "truncate auth_user cascade;"'