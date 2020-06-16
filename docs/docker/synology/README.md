Many people appear to host this application on their Synology NAS. The following documentation was provided by 
@therealschimmi in [this issue discussion](https://github.com/vabene1111/recipes/issues/98#issuecomment-643062907).

There are, as always, most likely other ways to do this but this can be used as a starting point for your 
setup. Since i cannot test it myself feedback and improvements are always very welcome.

## Instructions

Basic guide to setup vabenee1111/recipes docker container on Synology NAS

1. Login to Synology DSM through your browser

- Install Docker through package center
- Optional: Create a shared folder for your docker projects, they have to store data somewhere outside the containers
- Create a folder somewhere, i suggest naming it 'recipes' and storing it in the dedicated docker folder
- Within, create the necessary folder structure. You will need these folders:

![grafik](https://user-images.githubusercontent.com/66269214/84472395-63042580-ac87-11ea-8779-37555210e47a.png)

2. Download templates
- vabene1111 gives you a few samples for various setups to work with. I chose to use the plain setup for now.
- Open https://github.com/vabene1111/recipes/tree/develop/docs/docker
- Download docker-compose.yml to your recipes folder 
- Open https://github.com/vabene1111/recipes/tree/develop/docs/docker/plain/nginx/conf.d
- Download Recipes.conf to your conf.d folder 
- Open https://github.com/vabene1111/recipes/blob/develop/.env.template
- Copy the text and save it as 'env' to your recipes folder (no filename extension!)
- Once done, it should look like this:

![grafik](https://user-images.githubusercontent.com/66269214/84471828-75319400-ac86-11ea-97e1-42bcb166720e.png)

3. Edit docker-compose.yml
- Open docker-compose.yml in a text editor
- This file tells docker how to setup recipes. Docker will create three containers for recipes to work, recipes, nginx and postgresql. They are all required and need to store and share data through the folders you created before.
- Edit line 26, this line specifies which external synology port will point to which internal docker port. Chose a free port to use and replace the first number with it. You will open recipes by browsing to http://your.synology.ip:chosen.port, e.g. http://192.168.1.1:2000
- If you want to use port 2000 you would edit to 2000:80
	
4. SSH into your Synology
- You need to access your Synology through SSH 
- execute following commands
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
- Browse to 192.168.1.1:2000 or whatever your IP and port are
- While the containers are starting and doing whatever they need to do, you might still get HTTP errors e.g. 500 or 502. Just be patient and try again in a moment