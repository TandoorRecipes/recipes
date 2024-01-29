There are several questions and issues that come up from time to time, here are some answers:
please note that the existence of some questions is due the application not being perfect in some parts.
Many of those shortcomings are planned to be fixed in future release but simply could not be addressed yet due to time limits.

## Is there a Tandoor app?
Tandoor can be installed as a progressive web app (PWA) on mobile and desktop devices. The PWA stores recently accessed recipes locally for offline use.

### Mobile browsers

#### Safari (iPhone/iPad)
Open Tandoor, click Safari's share button, select `Add to Home Screen`

#### Chrome/Chromium
Open Tandoor, click the `add Tandoor to the home screen` message that pops up at the bottom of the screen

#### Firefox for Android
Open Tandoor, click on the `⋮` menu icon, then on `Install`

### Desktop browsers

#### Google Chrome
Open Tandoor, open the menu behind the three vertical dots at the top right, select `Install Tandoor Recipes...`

#### Microsoft Edge
Open Tandoor, open the menu behind the three horizontal dots at the top right, select `Apps > Install Tandoor Recipes`

## Why is Tandoor not working correctly?
If you just set up your Tandoor instance and you're having issues like;

- Links not working
- CSRF errors
- CORS errors
- No recipes are loading

then make sure you have set [all required headers](install/docker.md#required-headers) in your reverse proxy correctly.
If that doesn't fix it, you can also refer to the appropriate sub section in the [reverse proxy documentation](install/docker.md#reverse-proxy) and verify your general webserver configuration.

### Required Headers
Navigate to `/system` and review the headers listed in the DEBUG section.  At a minimum, if you are using a reverse proxy the headers must match the below conditions.

| Header      | Requirement |
| :---        |    :----   |
| HTTP_HOST:mydomain.tld      | The host domain must match the url that you are using to open Tandoor.  |
| HTTP_X_FORWARDED_HOST:mydomain.tld      | The host domain must match the url that you are using to open Tandoor.  |
| HTTP_X_FORWARDED_PROTO:http(s)      | The protocol must match the url you are using to open Tandoor.  There must be exactly one protocol listed.  |
| HTTP_X_SCRIPT_NAME:/subfolder      | If you are hosting Tandoor at a subfolder instead of a subdomain this header must exist. |


## Why am I getting CSRF Errors?
If you are getting CSRF Errors this is most likely due to a reverse proxy not passing the correct headers.

If you are using swag by linuxserver you might need `proxy_set_header X-Forwarded-Proto $scheme;` in your nginx config.
If you are using a plain ngix you might need `proxy_set_header Host $http_host;`.

Further discussions can be found in this [Issue #518](https://github.com/vabene1111/recipes/issues/518)

## Why are images not loading?
If images are not loading this might be related to the same issue as the CSRF errors (see above).
A discussion about that can be found at [Issue #452](https://github.com/vabene1111/recipes/issues/452)

The other common issue is that the recommended nginx container is removed from the deployment stack.
If removed, the nginx webserver needs to be replaced by something else that servers the /mediafiles/ directory or
`GUNICORN_MEDIA` needs to be enabled to allow media serving by the application container itself.

## Why am I getting an error stating database files are incompatible with server?
Your version of Postgres has been upgraded.  See [Updating PostgreSQL](https://docs.tandoor.dev/system/updating/#postgresql)


## Why does the Text/Markdown preview look different than the final recipe?

Tandoor has always rendered the recipe instructions markdown on the server. This also allows tandoor to implement things like ingredient templating and scaling in text.
To make editing easier a markdown editor was added to the frontend with integrated preview as a temporary solution. Since the markdown editor uses a different
specification than the server the preview is different to the final result. It is planned to improve this in the future.

The markdown renderer follows this markdown specification https://daringfireball.net/projects/markdown/

## Why is Tandoor not working on my Raspberry Pi?

Please refer to [here](install/docker.md#setup-issues-on-raspberry-pi).

## How can I create users?
To create a new user click on your name (top right corner) and select 'space settings'. Click create listed below invites.

It is not possible to create users through the admin because users must be assigned a default group and space.

To change a user's space you need to go to the admin and select User Infos.

If you use an external auth provider or proxy authentication make sure to specify a default group and space in the
environment configuration.

## What are spaces?
Spaces are is a type of feature used to separate one installation of Tandoor into several parts.
In technical terms it is a multi-tenant system.

You can compare a space to something like google drive or dropbox.
There is only one installation of the Dropbox system, but it handles multiple users without them noticing each other.
For Tandoor that means all people that work together on one recipe collection can be in one space.
If you want to host the collection of your friends, family, or neighbor you can create a separate space for them (through the admin interface).

Sharing between spaces is currently not possible but is planned for future releases.

## How can I reset passwords?
To reset a lost password if access to the container is lost you need to:

1. execute into the container using `docker-compose exec web_recipes sh`
2. activate the virtual environment `source venv/bin/activate`
3. run `python manage.py changepassword <username>` and follow the steps shown.

## How can I add an admin user?
To create a superuser you need to

1. execute into the container using `docker-compose exec web_recipes sh`
2. activate the virtual environment `source venv/bin/activate`
3. run `python manage.py createsuperuser` and follow the steps shown.


## Why cant I get support for my manual setup?
Even tough I would love to help everyone get tandoor up and running I have only so much time
that I can spend on this project besides work, family and other life things.
Due to the countless problems that can occur when manually installing I simply do not have
the time to help solving each one.

You can install Tandoor manually but please do not expect me or anyone to help you with that. 
As a general advice: If you do it manually do NOT change anything at first and slowly work yourself 
to your dream setup.

## How can I upgrade postgres (major versions)?
Postgres requires manual intervention when updating from one major version to another. The steps are roughly

1. use `pg_dumpall` to dump your database into SQL (for Docker `docker-compose exec -T <postgres_container_name> pg_dumpall -U <postgres_user_name> -f /path/to/dump.sql`)
2. stop the DB / down the container
3. move your postgres directory in order to keep it as a backup (e.g. `mv postgres postgres_old`)
4. update postgres to the new major version (for Docker just change the version number and pull)
5. start the db / up the container (do not start tandoor as it will automatically perform the database migrations which will conflict with loading the dump)
6. if not using docker, you might need to create the same postgres user you had in the old database
7. load the postgres dump (for Docker `'/usr/local/bin/docker-compose exec -T <postgres_container_name> psql -U <postgres_user_name> <postgres_database_name> < /path/to/dump.sql`)

If anything fails, go back to the old postgres version and data directory and try again. 

There are many articles and tools online that might provide a good starting point to help you upgrade [1](https://thomasbandt.com/postgres-docker-major-version-upgrade), [2](https://github.com/tianon/docker-postgres-upgrade), [3](https://github.com/vabene1111/DockerPostgresBackups). 
