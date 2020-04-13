# Recipes ![CI](https://github.com/vabene1111/recipes/workflows/Continous%20Integration/badge.svg?branch=develop)
Recipes is a Django application to manage, tag and search recipes using either built in models or external storage providers hosting PDF's, Images or other files.

![Preview](docs/preview.png)

### Features

- :package: **Sync** files with Dropbox and Nextcloud (more can easily be added)
- :mag: Powerful **search** with Djangos [TrigramSimilarity](https://docs.djangoproject.com/en/3.0/ref/contrib/postgres/search/#trigram-similarity)
- :label: Create and search for **tags**, assign them in batch to all files matching certain filters
- :page_facing_up: **Create recipes** locally within a nice, standardized web interface 
- :iphone: Optimized for use on **mobile** devices like phones and tablets
- :shopping_cart: Generate **shopping** lists from recipes
- :calendar: Create a **Plan** on what to eat when
- :person_with_blond_hair: **Share** recipes with friends and comment on them to suggest or remember changes you made
- :whale: Easy setup with **Docker**
- :art: Customize your interface with **themes**
- :heavy_plus_sign: Many more like recipe scaling, image compression, cookbooks, printing views, ...

This application is meant for people with a collection of recipes they want to share with family and friends or simply store them in a nicely organized way. A basic permission system exists but this application is not meant to be run as a public page.

# Installation

The docker image (`vabene1111/recipes`) simply exposes the application on port `8080`. You may choose any preferred installation method, the following are just examples to make it easier.

### Docker-Compose

2. Choose one of the included configurations [here](docs/docker).
2. Download the environment (config) file template and fill it out `wget https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template -O .env `
3. Start the container `docker-compose up -d`
4. Create a default user by running `docker-compose exec web_recipes createsuperuser`. 

### Manual
Copy `.env.template` to `.env` and fill in the missing values accordingly.  
Make sure all variables are available to whatever serves your application.

Otherwise simply follow the instructions for any django based deployment
(for example [this one](http://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html)).

## Updating

While intermediate updates can be skipped when updating please make sure to **read the release notes** in case some special action is required to update.

0. Before updating it is recommended to **create a backup!**
1. Stop the container using `docker-compose down`
2. Pull the latest image using `docker-compose pull`
3. Start the container again using `docker-compose up -d`

## Kubernetes

You can find a basic kubernetes setup [here](docs/k8s/). Please see the README in the folder for more detail.

# Documentation

Most things should be straight forward but there are some more complicated things.
##### Storage Backends
A `Storage Backend` is a remote storage location where PDF files are read from. To add a new backend click on `Storage Data` and then on `Storage Backends`. There click the plus button.

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

## Contributing
Pull Requests and ideas are welcome, feel free to contribute in any way.
For any questions on how to work with django please refer to their excellent [documentation](https://www.djangoproject.com/start/).

## License
This project is licensed under the MIT license. Even though it is not required to publish derivatives, I highly encourage pushing changes upstream and letting people profit from any work done on this project.
