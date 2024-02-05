!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested.

This guide is to assist those installing Tandoor Recipes on Truenas Core using Docker and or Portainer

Docker install instructions adapted from [PhasedLogix IT Services's guide](https://getmethegeek.com/blog/2021-01-07-add-docker-capabilities-to-truenas-core/). Portainer install instructions adopted from the [Portainer Official Documentation](https://docs.portainer.io/start/install-ce/server/docker/linux). Tandoor installation on Portainer provided by users `Szeraax` and `TransatlanticFoe` on Discord (Thank you two!)

## **Instructions**

Basic guide to setup Docker and Portainer TrueNAS Core.

### 1. Login to TrueNAS through your browser
- Go to the Virtual Machines Menu
![Screenshot of TrueNAS VM Menu[(https://d33wubrfki0l68.cloudfront.net/e5bc016268e41fadea77fd91a35c40d52280d221/c9daf/images/blog/truenasvmpage.png)
- Click Add to add a new virtual machine. You will want the following settings:
	-Guest operating system: Linux
	-Name: UBUDocker (or whatever you want it to be)
	-System Clock: Local
	-Boot method: UEFI
	-Shutdown time: 90
	-Start on boot enabled
	-Enable VNC enabled
![Screenshot of Add VM Menu](https://d33wubrfki0l68.cloudfront.net/d366b2c17d8e8515c9b266ff5451d2b35413cca3/1e0fa/images/blog/vmsetupscreen.png)
- Click next to dedicate resources to the VM (see below image of authors setup, you may need to change resources to fit your needs)
![Screenshot of Suggested VM resources](https://d33wubrfki0l68.cloudfront.net/b96ec49a4ba0c3a5577d5f22275e31d7dbdebe52/81017/images/blog/dockerresourcesetup.png)
- Hit next to go to disk setup
	-You want to create a new disk, here are the settings you should use
	-Disk Type: AHCI
	-Zvol location: tank/vm (Or wherever you have your VM memory located at)
	-Size: Atleast 30 gigs
![Screenshot of Disk Setup](https://d33wubrfki0l68.cloudfront.net/adb782ea4ec5531710e69bfefde641927ebdce00/a8cde/images/blog/dockerdisksetup.png)
-Hit next to go to network interface (The defaults are fine but make sure you select the right network adapter)
-Hit next to go to installation
	-Navigate to your ubuntu ISO file (The original author and this author used Ubuntu Server. This OS uses less resources than some other OS's and can be ran Headless with either VNC or SSH access. You can use other OS's, but this guide was written with Ubuntu Server)
-Hit next, then submit, you have made the virtual machine!
	-Open the virtual machine then hit VNC to open ubuntu
![Screenshot of VM Options](https://d33wubrfki0l68.cloudfront.net/93d874e9630735f8a8d851a220b0411446149c6a/5deb3/images/blog/docketvmpage.png)
-Once its up choose your language and go through the installer
	-Once you are done with the setup we want to SSH into the ubuntu VM to setup docker
	-Open powershell and type SSH "user"@(ip) (replace "user" with the user you setup in the OS installation)
	-Enter your Password if requested
	-Close the VNC Console
	-Go back into the SSH console and get ready to type some commands. Type these commands in order:
	`sudo apt update`
	`sudo apt install apt-transport-https ca-certificates curl software-properties-common`
	`y` (If prompted with a question)
	`curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`
	`sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"`
	`sudo apt update`
	`apt-cache policy docker-ce`
	-To make it so you don’t have to use sudo for every docker command run this command
	`sudo usermod -aG docker ${USER}`
	`su - ${USER}`

### 2. Install Portainer
!!! Note: By default, Portainer Server will expose the UI over port 9443 and expose a TCP tunnel server over port 8000. The latter is optional and is only required if you plan to use the Edge compute features with Edge agents.

-First, create the volume that Portainer Server will use to store its database:
`docker volume create portainer_data`
-Then, download and install the Portainer Server container:
`docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest`
-Portainer Server has now been installed. You can check to see whether the Portainer Server container has started by running `docker ps`
-Now that the installation is complete, you can log into your Portainer Server instance by opening a web browser and going to:
	`https://localhost:9443`
	-Replace `localhost` with the relevant IP address or FQDN if needed, and adjust the port if you changed it earlier.
-You will be presented with the initial setup page for Portainer Server.
-Create your first user
	-Your first user will be an administrator. The username defaults to admin but you can change it if you prefer. The password must be at least 12 characters long and meet the listed password requirements.
-Connect Portainer to your environments.
	-Once the admin user has been created, the "Environment Wizard" will automatically launch. The wizard will help get you started with Portainer.
	-Select "Get Started" to use the Enviroment Portainer is running in
![Screenshot of Enviroment Wizard](https://2914113074-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FiZWHJxqQsgWYd9sI88sO%2Fuploads%2Fsig45vFliINvOKGKVStk%2F2.15-install-server-setup-wizard.png?alt=media&token=cd21d9e8-0632-40db-af9a-581365f98209)

### 3. Install Tandoor Recipes VIA Portainer Web Editor
-From the menu select Stacks, click Add stack, give the stack a descriptive name then select Web editor.
![Screenshot of Stack List](https://2914113074-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FiZWHJxqQsgWYd9sI88sO%2Fuploads%2FnBx62EIPhmUy1L0S1iKI%2F2.15-docker_add_stack_web_editor.gif?alt=media&token=c45c0151-9c15-4d79-b229-1a90a7a86b84)
-Use the below code and input it into the Web Editor:

```yaml
version: "3"
services:
  db_recipes:
    restart: always
    image: postgres:16-alpine
    volumes:
      - ./postgresql:/var/lib/postgresql/data
    env_file:
      - stack.env

  web_recipes:
    image: vabene1111/recipes:latest
    env_file:
      - stack.env
    volumes:
      - staticfiles:/opt/recipes/staticfiles
      # Do not make this a bind mount, see https://docs.tandoor.dev/install/docker/#volumes-vs-bind-mounts
      - nginx_config:/opt/recipes/nginx/conf.d 
      - ./mediafiles:/opt/recipes/mediafiles
    depends_on:
      - db_recipes

  nginx_recipes:
    image: nginx:mainline-alpine
    restart: always
    ports:
      - 12008:80
    env_file:
      - stack.env
    depends_on:
      - web_recipes
    volumes:
      # Do not make this a bind mount, see https://docs.tandoor.dev/install/docker/#volumes-vs-bind-mounts
      - nginx_config:/etc/nginx/conf.d:ro
      - staticfiles:/static
      - ./mediafiles:/media

volumes:
  nginx_config:
  staticfiles:
```

-Download the .env template from [HERE](https://raw.githubusercontent.com/vabene1111/recipes/develop/.env.template) and load this file by pressing the "Load Variables from .env File" button:
![Screenshot of Add Stack screen](https://www.portainer.io/hubfs/image-png-Feb-21-2022-06-21-15-88-PM.png)

-You will need to change the following variables:
	-`SECRET_KEY` needs to be replaced with a new key. This can be generated from websites like [Djecrety](https://djecrety.ir/)
	-`TIMEZONE` needs to be replaced with the appropriate code for your timezone. Accepted values can be found at [TimezoneDB](https://timezonedb.com/time-zones)
	-`POSTGRES_USER` and `POSTGRES_PASSWORD` needs to be replaced with your username and password from [PostgreSQL](https://www.postgresql.org/) !!!NOTE Do not sign in using social media. You need to sign up using Email and Password.
-After those veriables are changed, you may press the `Deploy the Stack` button at the bottom of the page. This will create the needed containers to run Tandoor Recipes.

### 4. Login and Setup your new server!
- You need to access your Tandoor Server through its Webpage: `https://localhost:xxxx` replacing `localhost` with the IP of the VM running Docker and `xxxx` with the port you chose in the Web Editor for `nginx_recipes` above. In this case, `12008`. 
!!! While the containers are starting and doing whatever they need to do, you might still get HTTP errors e.g. 500 or 502. Just be patient and try again in a moment
-You will now need to set up the Tandoor Server through the WebGUI.
