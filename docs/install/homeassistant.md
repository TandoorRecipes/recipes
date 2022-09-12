!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested. 
    Many thanks to [alexbelgium](https://github.com/alexbelgium) for making implementing everything required to have 
    Tandoor run in HA.

![Addon version](https://img.shields.io/badge/dynamic/json?label=Version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Falexbelgium%2Fhassio-addons%2Fmaster%2Ftandoor_recipes%2Fconfig.json) ![Last update](https://img.shields.io/badge/dynamic/json?label=Updated&query=%24.last_update&url=https%3A%2F%2Fraw.githubusercontent.com%2Falexbelgium%2Fhassio-addons%2Fmaster%2Ftandoor_recipes%2Fupdater.json) ![aarch64][aarch64-badge] ![amd64][amd64-badge] ![armv7][armv7-badge]

### Introduction
[Home Assistant (HA)](https://www.home-assistant.io/) is a free and open-source software for home automation designed to be a central control system for smart home devices with a focus on local control and privacy. It can be accessed through a web-based user interface by using companion apps for Android and iOS, or by voice commands via a supported virtual assistant such as Google Assistant or Amazon Alexa.

It can be [installed](https://www.home-assistant.io/installation/) as a standalone Operating System on a dedicated system, making it easy to deploy and maintain through Over The Air updates. It can also be installed as Docker container.

In addition to its large depth of native functions, modular addons can be added to expand its functions. An addon for Tandoor Recipes was created, allowing to store the server on the Home Assistant devices and access the user interface either through direct web access or securely through the native Home Assistant app.

### Installation

1. Once you have a running Home Assistant system, the next step is to add the [alexbelgium](https://github.com/alexbelgium)'s custom repository to your system. This is performed by clicking on the button below, and simply filling your HA url. [![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Falexbelgium%2Fhassio-addons)
2. Install the addon [![Install the addon](https://my.home-assistant.io/badges/supervisor_store.svg)](https://my.home-assistant.io/redirect/supervisor_store)
3. Set the add-on options to your preferences (see below)
4. Start the add-on
5. Check the logs of the add-on to see if everything went well.
6. Open the webUI (either through Ingress, or direct webUI with http://homeassistant.local:9928) and adapt the software options

### Configuration

The following environment variable are configurable from the addon options. Please see the [Docker documentation](https://docs.tandoor.dev/install/docker/) for more information on how they should be filled.

```yaml
Required :
    "ALLOWED_HOSTS": "your system url", # You need to input your homeassistant urls (comma separated, without space) to allow ingress to work
    "DB_TYPE": "list(sqlite|postgresql_external|mariadb_addon)" # Type of database to use. Mariadb_addon allows to be automatically configured if the maria_db addon is already installed on your system. Sqlite is an internal database. For postgresql_external, you'll need to fill the below settings
    "SECRET_KEY": "str", # Your secret key
    "PORT": 9928 # By default, the webui is available on http://homeassistant.local:9928. If you ever need to change the port, you should never do it within the app, but only through this option
Optional :
    "POSTGRES_HOST": "str?", # Needed for postgresql_external
    "POSTGRES_PORT": "str?", # Needed for postgresql_external
    "POSTGRES_USER": "str?", # Needed for postgresql_external
    "POSTGRES_PASSWORD": "str?", # Needed for postgresql_external
    "POSTGRES_DB": "str?" # Needed for postgresql_external
```

### Updates and backups

The alexbelgium's repo incorporates a script that aligns every 3 days the addon to the containers released. Just wait a few hours for HA to refreshes its repo list and the uodate will be proposed automatically in your HA system.

It is recommended to frequently backup. All data is stored outside of the addon, the main location `/config/addons_config/tandoor_recipes`, so be sure to backup this folder in addition to the addon itself when updating. If you have selected mariadb as database option, don't forget to also backup it.

### Support

Issues related to the addon itself should be reported on the [maintainer repo][repository].

Issues related to HA should be reported on the [HA Community Forum][forum].

Issues related to Tandoor recipes should be reported on this github repo.

[aarch64-badge]: https://img.shields.io/badge/aarch64-yes-green.svg?logo=arm
[amd64-badge]: https://img.shields.io/badge/amd64-yes-green.svg?logo=amd
[armv7-badge]: https://img.shields.io/badge/armv7-yes-green.svg?logo=arm
[forum]: https://community.home-assistant.io/t/my-custom-repo
[repository]: https://github.com/alexbelgium/hassio-addons
