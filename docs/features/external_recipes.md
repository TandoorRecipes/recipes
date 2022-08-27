The original intend of this application was to provide a search interface to my large collection of PDF scans of recipes.
This feature is now called External recipes.

!!! info
    Internal recipes are stored in a structured manner inside the database. They can be displayed using the standardized
    interface and support features like shopping lists, scaling and steps.
    External recipes are basically files that are displayed within the interface. The benefit is that you can quickly
    import all your old recipes and convert them one by one.

To use external recipes you will first need to configure a storage source. After that a synced path can be created.
Lastly you will need to sync with the external path and import recipes you desire.

## Storage

!!! danger
    In order for this application to retrieve data from external providers it needs to store authentication information.
    Please use read only/separate accounts or app passwords wherever possible.
    There are better ways to do this but they are currently not implemented

A `Storage Backend` is a remote storage location where files are **read** from.
To add a new backend click on `username >> External Recipes >> Manage External Storage >> the + next to Storage Backend List`. 
There click the plus button.

The basic configuration is the same for all providers. 

| Field    | Value |
|----------|-------|
| Name     | Your identifier for this storage source, can be everything you want. |
| Method   | The desired method.  |

!!! success
    Only the providers listed below are currently implemented. If you need anything else feel free to open
    an issue or pull request.

### Local

!!! info
    There is currently no way to upload files through the webinterface. This is a feature that might be added later.

The local provider does not need any configuration (username, password, token or URL).
For the monitor you will need to define a valid path on your host system. (Path) 
The Path depends on your setup and can be both relative and absolute. 

!!! warning "Volume"
    By default no data other than the mediafiles and the database is persisted. If you use the local provider
    make sure to mount the path you choose to monitor to your host system in order to keep it persistent.

#### Docker
If you use docker the default directory is `/opt/recipes/`.
add
```
      - ./externalfiles:/opt/recipes/externalfiles
```
to your docker-compose.yml file under the `web_recipes >> volumes` section. This will create a folder in your docker directory named `externalfiles` under which you could choose to store external pdfs (you could of course store them anywhere, just change `./externalfiles` to your preferred location).
save the docker-compose.yml and restart your docker container.

### Dropbox

| Field    | Value |
|----------|-------|
| Username | Dropbox username |
| Token    | Dropbox API Token. Can be found [here](https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1)|

### Nextcloud

!!! warning "Path"
    It appears that the correct webdav path varies from installation to installation (for whatever reason).
    In the Nextcloud webinterface click the `Settings` button in the bottom left corner, there your WebDav Url will be displayed.

| Field    | Value |
|----------|-------|
| Username | Nextcloud username |
| Password | Nextcloud app password |
| Url      | Nextcloud Server URL (e.g. `https://cloud.mydomain.com`) |
| Path     | (optional) webdav path (e.g. `/remote.php/dav/files/vabene1111`). If no path is supplied `/remote.php/dav/files/` plus your username will be used. |

## Adding External Recipes
To add a new path from your Storage backend to the sync list, go to `username >> External Recipes` and 
select the storage backend you want to use.
Then enter the path you want to monitor starting at the storage root (e.g. `/Folder/RecipesFolder`, or `/opt/recipes/externalfiles' in the docker example above) and save it.

## Syncing Data
To sync the recipes app with the storage backends press `Sync now` under `username >> External Recipes`

## Discovered Recipes
All files found by the sync can be found under `Manage Data >> Discovered recipes`. 
There you can either import all at once without modifying them or import one by one, adding tags while importing.
