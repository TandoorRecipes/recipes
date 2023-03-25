# Ubuntu Installation on Windows (WSL) and Docker Desktop

Install Docker from https://docs.docker.com/desktop/install/windows-install/
Be sure to select the Use WSL 2 instead of Hyper-V option on the configuration page when prompted

Follow the instructions to install Tandoor on Docker. Tandoor installation instructions using Docker is gotten from https://docs.tandoor.dev/install/docker/

You may get the error below if you are using Docker Desktop:
/usr/bin/docker-credential-desktop.exe: Invalid argument

This indicates that Docker Compose is not able to pull authentication credentials that are needed to pull recipe files.

Run the command:
export DOCKER_CONFIG=/non-existent-directory

"non-existent-directory" could be an arbitrary directory of your choosing. It could be empty,
we are just giving docker a file to point to. You can create a credentials file at a later date to add security to your application.

After you run the command docker-compose up -d, you may encounter an error similar to the one below:
fixing permissions on existing directory /var/lib/postgresql/data ... 2023-03-01T15:38:27.140501700Z chmod: /var/lib/postgresql/data: Operation not permitted

This indicates that the postgresql user 'postgres' does not have the necessary permissions to 
change the permissions of the /var/lib/postgresql/data directory.
Note: This issue does not occuer in the Powershell terminal, so it might be easier to install Tandoor in powershell and continue development using WSL.
Steps to fix this error:
Since the permissions have to be changed within the docker container, we will need to create a file that runs as soon as the container starts up. This container will change the permissions of the /var/lib/postgresql/data directory before the db_recipes-1 container is started up. This container sets up the database to accept connections.
Docker allows us to set up an entrypoint in the docker-compose.yml file. This is where we will set the commands to change the permissions of the postgres user.
Steps to set up entry-point file:
1.	Create a new file ‘docker-entrypoint.sh’ in the same directory as your docker-compose.yml file. This will be a bash file.
2.	Add the following commands to the file
a.	#!/bin/sh (This is called a shebang. It tells the OS the shell to use which is the sh shell in this case)
b.	chmod 777 /var/lib/postgresql/data (Gives read, write and execute permissions on the directory to all users, you may change these permissions as you wish)
c.	exec “@” (Runs the script with the commands above)

Your folder structure should look like this with docker-compose.yml and docker-entrypoint.sh in the same directory:
![image](https://user-images.githubusercontent.com/100102599/225214709-322417a1-1cab-47a6-83dd-555a4234e72a.png)


The docker-entrypoint.sh file should look like this:
![image](https://user-images.githubusercontent.com/100102599/225214795-102c9e53-b790-498a-a6d6-ad0bcc980b2f.png)
 
3.	Open the docker-compose.yml file
4.	Add an entrypoint configuration to the db_recipes service
entrypoint:
-	docker-entrypoint.sh
This command makes sure that the docker-entrypoint.sh file is run first before the db_recipes services is started. Using this, we set the database user permission before they are needed, so it gets rid of the error.
Your docker-compose.yml file should look like this:
![image](https://user-images.githubusercontent.com/100102599/225214865-869c9b24-61cf-4069-aa98-a7e18a165105.png)
 
5.	Run docker-compose up -d, all the containers should run!
