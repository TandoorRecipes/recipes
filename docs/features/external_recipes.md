The original intend of this application was to provide a search interface to my large collection of PDF scans of recipes.
This feature is now called External recipes.

!!! info
    Internal recipes are stored in a structured manner inside the database. They can be displayed using the standardized
    interface and support features like shopping lists, scaling and steps.
    External recipes are basically files that are displayed within the interface. The benefit is that you can quickly
    import all your old recipes and convert them one by one.

To use external recipes you will first need to configure a storage source. After that a synced path can be created.
Lastly you will need to sync with the external path and import recipes you desire.

# Storage Backends
!!! success
    Currently only Nextcloud and Dropbox are supported. There are plans to add more provider 

A `Storage Backend` is a remote storage location where files are **read** from.
To add a new backend click on `Storage Data` and then on `Storage Backends`. 
There click the plus button.

Enter a name (just a display name for you to identify it) and an API access Token for the account you want to use.
Dropboxes API tokens can be found on the 
[Dropboxes API explorer](https://dropbox.github.io/dropbox-api-v2-explorer/#auth_token/from_oauth1)
with the button on the top right. For Nextcloud, you can use an App password created in the settings.

## Adding Synced Paths
To add a new path from your Storage backend to the sync list, go to `Storage Data >> Configure Sync` and 
select the storage backend you want to use.
Then enter the path you want to monitor starting at the storage root (e.g. `/Folder/RecipesFolder`) and save it.

## Syncing Data
To sync the recipes app with the storage backends press `Sync now` under `Storage Data >> Configure Sync`.

## Discovered Recipes
All files found by the sync can be found under `Manage Data >> Discovered recipes`. 
There you can either import all at once without modifying them or import one by one, adding tags while importing.
