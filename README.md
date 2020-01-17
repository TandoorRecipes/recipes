# Recipes
Recipes is a django application to manage, tag and search recipes using either built in models or external storage providers hosting PDF's, Images or other files.

![Preview](preview.png)

### Features

- :package: **Sync** files with Dropbox and Nextcloud (more can easily be added)
- :mag: Powerful **search** with djangos [TrigramSimilarity](https://docs.djangoproject.com/en/3.0/ref/contrib/postgres/search/#trigram-similarity)
- :label: Create and search for **tags**, assign them in batch to all files matching certain filters
- :page_facing_up: **Create recipes** locally within a nice, standardized web interface 
- :person_with_blond_hair: **Share** recipes with friends and comment on them to suggest or remember changes you made
- :whale: Easy setup with **Docker**

This application is meant for people with a collection of recipes they want to share with family and friends or simply store them in a nicely organized way. A basic permission system exists but this application is not meant to be run as a public page.

# Documentation

Most things should be straight forward but there are some more complicated things.
##### Storage Backends
A `Storage Backend` is a remote storage location where files are stored. To add a new backend click on `Storage Data` and then on `Storage Backends`. There click the plus button.

Enter a name (just a display name for you to identify it) and an API access Token for the account you want to use.
Dropboxes API tokens can be found on the [Dropboxes API explorer](https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1)
with the button on the top right. For Nextcloud you can use a App apssword created in the settings.

##### Adding Synced Paths
To add a new path from your Storage backend to the sync list, go to `Storage Data >> Configure Sync` and select the storage backend you want to use.
Then enter the path you want to monitor starting at the storage root (e.g. `/Folder/RecipesFolder`) and save it.

##### Syncing Data
To sync the recipes app with the storage backends press `Sync now` under `Storage Data >> Configure Sync`.
##### Import Recipes
All files found by the sync can be found under `Manage Data >> Import recipes`. There you can either import all at once without modifying them or import one by one, adding tags while importing.
##### Batch Edit
If you have many untagged recipes, you may want to edit them all at once. To do so, go to
`Storage Data >> Batch Edit`. Enter a word which should be contained in the recipe name and select the tags you want to apply.
When clicking submit, every recipe containing the word will be updated (tags are added).

> Currently the only option is word contains, maybe some more SQL like operators will be added later.

## Installation

### Docker-Compose
When cloning this repository, a simple docker-compose file is included. It is made for setups already running an nginx-reverse proxy network with let’s encrypt companion but can be changed easily. Copy `.env.template` to `.env` and fill in the missing values accordingly.  
Now simply start the containers and run the `update.sh` script that will apply all migrations and collect static files.
Create a default user by executing into the container with `docker-compose exec web_recipes sh` and run `python3 manage.py createsuperuser`.

### Manual
Copy `.env.template` to `.env` and fill in the missing values accordingly.  
You can leave out the docker specific variables (VIRTUAL_HOST, LETSENCRYPT_HOST, LETSENCRYPT_EMAIL). 
Make sure all variables are available to whatever serves your application.

Otherwise simply follow the instructions for any django based deployment
(for example this one http://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html).

To start developing:
1. Clone the repository using your preferred method
2. Install requirements from `requirements.txt` either globally or in a virtual environment
3. Run migrations with `manage.py migrate`
4. Create a first user with `manage.py createsuperuser`
5. Start development server with `manage.py runserver`

## Contributing

Pull Requests and ideas are welcome, feel free to contribute in any way.

## License
This project is licensed under the MIT license. Even though it is not required to publish derivatives, I highly encourage pushing changes upstream and letting people profit from any work done on this project.
