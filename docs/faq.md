There are several questions and issues that come up from time to time, here are some answers:
please note that the existence of some questions is due the application not being perfect in some parts. 
Many of those shortcomings are planned to be fixed in future release but simply could not be addressed yet due to time limits.

## Is there a Tandoor app?
Tandoor can be installed as a progressive web app (PWA) on mobile and desktop devices. The PWA stores recently accessed recipes locally for offline use.

### Mobile browsers

#### Safari (iPhone/iPad)
Open Tandoor, click Safari's share button, select `Add to Home Screen`

### Chrome/Chromium
Open Tandoor, click the `add Tandoor to the home screen` message that pops up at the bottom of the screen

### Desktop browsers

#### Google Chrome 
Open Tandoor, open the menu behind the three vertical dots at the top right, select `Install Tandoor Recipes...`

#### Microsoft Edge
Open Tandoor, open the menu behind the three horizontal dots at the top right, select `Apps > Install Tandoor Recipes`

## Why is Tandoor not working correctly?
If you just set up your Tandoor instance and you're having issues like;

- Links not working
- CSRF errors
- CORS errors
- No recipes are loading

then make sure you have set [all required headers](install/docker.md#required-headers) in your reverse proxy correctly.
If that doesn't fix it, you can also refer to the appropriate sub section in the [reverse proxy documentation](install/docker.md#reverse-proxy) and verify your general webserver configuration.

## Why am I getting CSRF Errors?
If you are getting CSRF Errors this is most likely due to a reverse proxy not passing the correct headers.

If you are using swag by linuxserver you might need `proxy_set_header X-Forwarded-Proto $scheme;` in your nginx config.
If you are using a plain ngix you might need `proxy_set_header Host $http_host;`.

Further discussions can be found in this [Issue #518](https://github.com/vabene1111/recipes/issues/518)

## Why are images not loading?
If images are not loading this might be related to the same issue as the CSRF errors (see above). 
A discussion about that can be found at [Issue #452](https://github.com/vabene1111/recipes/issues/452)

The other common issue is that the recommended nginx container is removed from the deployment stack. 
If removed, the nginx webserver needs to be replaced by something else that servers the /mediafiles/ directory or 
`GUNICORN_MEDIA` needs to be enabled to allow media serving by the application container itself.


## Why does the Text/Markdown preview look different than the final recipe?

Tandoor has always rendered the recipe instructions markdown on the server. This also allows tandoor to implement things like ingredient templating and scaling in text.
To make editing easier a markdown editor was added to the frontend with integrated preview as a temporary solution. Since the markdown editor uses a different 
specification than the server the preview is different to the final result. It is planned to improve this in the future. 

The markdown renderer follows this markdown specification https://daringfireball.net/projects/markdown/

## Why is Tandoor not working on my Raspberry Pi?

Please refer to [here](install/docker.md#setup-issues-on-raspberry-pi).

## How can I create users?
To create a new user click on your name (top right corner) and select 'space settings'. Click create listed below invites.

It is not possible to create users through the admin because users must be assigned a default group and space.

To change a user's space you need to go to the admin and select User Infos. 

If you use an external auth provider or proxy authentication make sure to specify a default group and space in the 
environment configuration.

## What are spaces?
Spaces are is a type of feature used to separate one installation of Tandoor into several parts. 
In technical terms it is a multi-tenant system.

You can compare a space to something like google drive or dropbox. 
There is only one installation of the Dropbox system, but it handles multiple users without them noticing each other.
For Tandoor that means all people that work together on one recipe collection can be in one space. 
If you want to host the collection of your friends, family, or neighbor you can create a separate space for them (through the admin interface).

Sharing between spaces is currently not possible but is planned for future releases.

## How can I reset passwords?
To reset a lost password if access to the container is lost you need to:

1. execute into the container using `docker-compose exec web_recipes sh`
2. activate the virtual environment `source venv/bin/activate`
3. run `python manage.py changepassword <username>` and follow the steps shown.

## How can I add an admin user?
To create a superuser you need to 

1. execute into the container using `docker-compose exec web_recipes sh`
2. activate the virtual environment `source venv/bin/activate`
3. run `python manage.py createsuperuser` and follow the steps shown.
