# Recipies
Recipes is a Django application that allows categorization and tagging of arbitrary numbers of recipes (or in fact any other file) in a storage backend.
Currently the only supported storage backend is dropbox, but this can easily be changed as the system is modular and already has fields to support different backends.

## Usage
Most things should be straight forward but there are some more complicated things.
##### General
Create Categories and Keywords under the `New` tab. You can have a simple look at most Tables under the `List` Tab.
Management options for your Data are under `Manage Data`
##### Storage Backends
Currently only dropbox is supported as a storage backend. To add a new Dropbox go to `New >> Storage Backend` and enter
a name (just a display name for you to identify it) and an API access Token for the account you want to use.
You can obtain the API token on [Dropboxes API explorer](https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1)
with the button on the top right.
##### Adding Synced Path's
To add a new path from your Storage backend to the sync list, go to `Manage Data >> Configure Sync` and select the storage backend you want to use.
Then enter the path you want to monitor starting at the storage root (e.g. `/Folder/RecipesFolder`) and save it.
##### Syncing Data
To sync the recipes app with the storage backends press `Sync now` under `Manage Data >> Configure Sync`.
##### Import Recipes
All files found by the sync can be found under `List >> New Recipes`. There you can either import all at once without
modifying them or import one by one, adding Category and Tags while importing.
##### Batch Edit
If you have many uncategorized and untagged recipes you may want to edit them all at once. For this go to
`Manage Data >> Batch Edit`. Enter a word which should be contained in the recipe name and select category and tags.
When clicking submit every recipe containing the word will be updated (tags are added).

> Currently the only option is word contains, maybe some more SQL like operators will be added later.

## Installation
If you want to *install* the application for usage use a tutorial of your choice
(for example this one http://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html)
on deploying django applications.

To start developing:
1. Clone the repository using your preferred method
2. Install requirements from `requirements.txt` either globally or in a virtual environment
3. Copy `secret_settings.template` to `secret_settings.py`
4. Configure preferred database backend in `secret_settings.py`, default is sqlite
5. Run migrations with `manage.py migrate`
6. Create a first user with `manage.py createsuperuser`
7. Start development server with `manage.py runserver`

## Contributing
Pull Requests and ideas are welcome, feel free to contribute in any way.

## License
This project is licensed under the MIT license. Even though it is not required to publish derivatives i highly encourage
pushing changes upstream and letting people profit from any work done on this project.