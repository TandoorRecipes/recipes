!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested. Since I cannot test it myself, feedback and improvements are always very welcome.

!!! danger "Tandoor 2 Compatibility"
    This guide has not been verified/tested for Tandoor 2, which now integrates a nginx service inside the default docker container and exposes its service on port 80 instead of 8080.

## **Instructions**

Basic guide to setup `vabenee1111/recipes` docker container on Synology NAS.

### 1. Preparations
- Login to Synology DSM through your browser
- Install `Container Manager` through package center
- Install `Text Editor` through package center (needed to edit `.env` if you don't edit it locally first)
- If you do not already have a `docker` folder in your File Station, create one at the root of your volume. 
- inside of your `volume1/docker` folder, create a `recipes` folder. 
- Within, create the necessary folder structure. You will need these folders:

```
volume1/docker/
├─ recipes/
│  ├─ postgresql/
│  ├─ mediafiles/
│  ├─ staticfiles/
│  ├─ nginx_config/
```

### 2. `.env` and `docker-compose.yml`
!!!info The guide uses the `plain` setup.

- Open the [.env template](https://github.com/vabene1111/recipes/blob/develop/.env.template)
  - Copy the text and save it as `.env.txt` to your recipes folder (the .txt extension allows you to modify it)
  - Open the file with Text Editor. Populate the necessary fields, such as `SECRET_KEY` and `POSTGRES_PASSWORD`. 
  - Save the file and then rename it as `.env` (without the .txt extension) 
- Open the [docker-compose.yml template](https://raw.githubusercontent.com/TandoorRecipes/recipes/refs/heads/develop/docs/install/docker/plain/docker-compose.yml)
  - Copy the text and keep reading. 

### 3. Creating the Container
- In DSM, open `Container Manager`. Click on `Project`. 
- Click `Create` to create a new project. Fill out the following fields: 
  - `Name`: `tandoor_recipes` or similar. 
  - `Path`: select your `recipes` folder. If you have been following along `/docker/recipes`
  - `Source`: Select `Create docker-compose.yml`. A textbox will appear. 

### 4. Edit docker-compose.yml
- Paste the `docker-compose.yml` into the `source` textbox. 
- This file tells docker how to setup recipes. Docker will create three containers for recipes to work, recipes, nginx and postgresql. They are all required and need to store and share data through the folders you created before.
- Under the `nginx_recipes` section, look for `ports` that lists `80:80` as the default. This line specifies which external synology port will point to which internal docker port. Chose a free port to use and replace the first number with it. You will open recipes by browsing to http://your.synology.ip:chosen.port, e.g. http://192.168.1.1:2000
- If you want to use port 2000 you would edit the `ports` to `2000:80`

### 5. Finishing up
- Click `Next`. 
- Synology will take you to a `web portal settings` page. Skip this page by clicking `Next`. 
  - If you enable this option then the container will not build because your specified port will be used by the Web Service. The Container already comes with nginx configured to serve files so you do not need the `web portal settings`. 
- You'll see a `Summary` page. Review and click `Done`. 
- The project will begin being built and should finish. 
	```bash
	Container recipes-db_recipes-1 Starting
	Container recipes-db_recipes-1 Started
	Container recipes-web_recipes-1 Starting
	Container recipes-web_recipes-1 Started
	Container recipes-nginx_recipes-1 Starting
	Container recipes-nginx_recipes-1 Started
	Exit Code: 0
	```
  - If you get an error, review the error and fix. A common reason it might fail is because you did not create the folders specified in the directory tree in step 1.
- Browse to 192.168.1.1:2000 or whatever your IP and port are

### 6. Firewall
!!!info "Depreciated?" This section may be depreciated and may no longer needed. The container may be able to be used without any firewall rules enabled. Further datapoints needed before section or this warning is removed. 

You need to set up firewall rules in order for the recipes_web container to be able to connect to the recipes_db container.

- Control Panel -> Security -> Firewall -> Edit Rules -> Create
	-  Ports: All
	-  Source IP: Specific IP -> Select -> Subnet
		- insert docker network ip (can be found in the docker application, network tab)
		- Example: IP address: 172.18.0.0 and Subnet mask/Prefix length: 255.255.255.0
	-  Action: Allow
- Save and make sure it's above the deny rules

### 7. Additional SSL Setup
Easiest way is to do it via Reverse Proxy.

- Control Panel -> Login Portal -> Advanced -> Reverse Proxy
- Create
	- insert name
	- Source:
		- Protocol: HTTPS
		- Hostname: URL if you access from outside, otherwise ip in network
		- Port: The port you want to access, has to be a different one that the one in the docker-compose file
		- HSTS can be enabled
	- Destination:
		- Protocol: HTTP
		- Hostname: localhost
		- Port: port in docker-compose file
	- Click on Custom Header and press Create -> Websocket
	- Save
- Control Panel -> Security -> Firewall -> Edit Rules -> Create
	- Ports: Select form a list of built-in applications -> Select -> You find your Reverse Proxy, enable it
	- Source IP: Depends, All allows access from outside, i use specific to only connect in my network
	- Action: Allow
- Save and make sure it's above the deny rules
	
### 8. Depreciated Guides

The following are older guides that may be useful if you are running older versions of DSM. 

- The following documentation was provided by 
@therealschimmi in [this issue discussion](https://github.com/vabene1111/recipes/issues/98#issuecomment-643062907).

- There is also this 
([word](https://github.com/vabene1111/recipes/files/6708738/Tandoor.on.a.Synology.Disk.Station.docx), 
[pdf](https://github.com/vabene1111/recipes/files/6901601/Tandoor.on.a.Synology.Disk.Station.pdf)) awesome and very detailed guide provided by @DiversityBug.