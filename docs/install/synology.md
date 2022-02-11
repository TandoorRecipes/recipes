!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested.

Many people appear to host this application on their Synology NAS. The following documentation was provided by 
@therealschimmi in [this issue discussion](https://github.com/vabene1111/recipes/issues/98#issuecomment-643062907).

There is also this 
([word](https://github.com/vabene1111/recipes/files/6708738/Tandoor.on.a.Synology.Disk.Station.docx), 
[pdf](https://github.com/vabene1111/recipes/files/6901601/Tandoor.on.a.Synology.Disk.Station.pdf)) awesome and 
very detailed guide provided by @DiversityBug.

There are, as always, most likely other ways to do this but this can be used as a starting point for your 
setup. Since I cannot test it myself feedback and improvements are always very welcome.

## **Instructions**

Basic guide to setup `vabenee1111/recipes` docker container on Synology NAS.

### 1. Login to Synology DSM through your browser
- Install Docker through package center
- Optional: Create a shared folder for your docker projects, they have to store data somewhere outside the containers
- Create a folder somewhere, I suggest naming it 'recipes' and storing it in the dedicated docker folder
- Within, create the necessary folder structure. You will need these folders:

![grafik](https://user-images.githubusercontent.com/66269214/84472395-63042580-ac87-11ea-8779-37555210e47a.png)

### 2. Download templates
!!!info
	vabene1111 gives you a few samples for various setups to work with. I chose to use the plain setup for now.

* Open https://github.com/vabene1111/recipes/tree/develop/docs/install/docker ([link](https://github.com/vabene1111/recipes/tree/develop/docs/install/docker))
* Download docker-compose.yml to your recipes folder ([direct link to plain](https://github.com/TandoorRecipes/recipes/raw/develop/docs/install/docker/plain/docker-compose.yml))
* Open https://github.com/vabene1111/recipes/tree/develop/nginx/conf.d ([link](https://github.com/vabene1111/recipes/tree/develop/nginx/conf.d))
* Download Recipes.conf to your conf.d folder ([direct link](https://raw.githubusercontent.com/TandoorRecipes/recipes/develop/nginx/conf.d/Recipes.conf))
* Open https://github.com/vabene1111/recipes/blob/develop/.env.template ([link](https://github.com/vabene1111/recipes/blob/develop/.env.template))
* Copy the text and save it as ```.env``` to your recipes folder (no filename extension!)
* Add a ```POSTGRES_PASSWORD```
* Once done, it should look like this:

![grafik](https://user-images.githubusercontent.com/66269214/84471828-75319400-ac86-11ea-97e1-42bcb166720e.png)

### 3. Edit docker-compose.yml
* Open docker-compose.yml in a text editor
* This file tells docker how to setup recipes. Docker will create three containers for recipes to work, recipes, nginx and postgresql. They are all required and need to store and share data through the folders you created before.
* Edit line 26, this line specifies which external synology port will point to which internal docker port. Chose a free port to use and replace the first number with it. You will open recipes by browsing to http://your.synology.ip:chosen.port, e.g. http://192.168.1.1:2000
* If you want to use port 2000 you would edit to 2000:80
	
### 4. SSH into your Synology
- You need to access your Synology through SSH 
- Execute following commands
- `ssh root@your.synology.ip`	connect to your synology. root password is the same as admin password, sometimes root access is not possible for whatever reason, then replace root with admin
- `cd /volume1/docker/recipes` 	access the folder where you store docker-compose.yml
- `docker-compose up -d`		this starts your containers according to your docker-compose.yml. if you logged in with admin you will have to use  `sudo docker-compose up -d` instead, it will ask for the admin password again. 
- This output tells you all 3 containers have been setup
```
...
Creating recipes_nginx_recipes_1 ... done
Creating recipes_db_recipes_1    ... done
Creating recipes_web_recipes_1   ... done
```
* Browse to 192.168.1.1:2000 or whatever your IP and port are
* While the containers are starting and doing whatever they need to do, you might still get HTTP errors e.g. 500 or 502. Just be patient and try again in a moment

### 5. Firewall
You need to set up firewall rules in order for the recipes_web container to be able to connect to the recipes_db container.

- Control Panel -> Security -> Firewall -> Edit Rules -> Create
	-  Ports: All
	-  Source IP: Specific IP -> Select -> Subnet
		- insert docker network ip (can be found in the docker application, network tab)
		- Example: IP address: 172.18.0.0 and Subnet mask/Prefix length: 255.255.255.0
	-  Action: Allow
- Save and make sure it's above the deny rules

### 6. Additional SSL Setup
Easiest way is to do it via Reverse Proxy.

- Control Panel -> Login Portal (renamed Since DSM 7, previously Application Portal) -> Advanced -> Reverse Proxy
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

[Deprecated, Note: ssl Path changed for DSM 7]
6.1 Additional SSL Setup 
- create folder `ssl` inside `nginx` folder
	- download your ssl certificate from `security` tab in dsm `control panel`
	- or create a task in `task manager` because Synology will update the certificate every few months
		- set task to repeat every day
		- in the script write:
		```
		SRC="/usr/syno/etc/certificate/system/default"
		DEST="/volume1/docker/recipes/nginx/ssl/"
		if [ ! -f "$DEST/fullchain.pem" ] || [ "$SRC/fullchain.pem" -nt "$DEST/fullchain.pem" ]; then
 		cp "$SRC/fullchain.pem" "$DEST/"
  		cp "$SRC/privkey.pem" "$DEST/"
  		chown root:root "$DEST/fullchain.pem" "$DEST/privkey.pem"
  		chmod 600 "$DEST/fullchain.pem" "$DEST/privkey.pem"
  		/usr/syno/bin/synowebapi --exec api=SYNO.Docker.Container version=1 method=restart name=recipes_nginx_recipes_1
		fi
		```
- change `docker-compose.yml`
  add `- ./nginx/ssl:/etc/nginx/certs` to the `volumes` of `nginx_recipes`
	
