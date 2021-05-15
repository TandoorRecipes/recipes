There are several questions and issues that come up from time to time. Here are some answers.
Please note that the existence of some questions is due the application not being perfect in some parts. 
Many of those shortcomings are planned to be fixed in future release but simply could not be addressed yet due to time limits.

## CSRF Errors
If you are getting CSRF Errors this is most likely due to a reverse proxy not passing the correct headers.

If you are using swag by linuxserver you might need `proxy_set_header X-Forwarded-Proto $scheme;` in your nginx config.
If you are using a plain ngix you might need `proxy_set_header Host $http_host;`.

Further discussions can be found in this [Issue #518](https://github.com/vabene1111/recipes/issues/518)

## Images not loading
If images are not loading this might be related to the same issue as the CSRF Errors. 
A discussion about that can be found [Issue #452](https://github.com/vabene1111/recipes/issues/452)

The other common issue is that the recommended nginx container is removed from the deployment stack. 
If removed, the nginx webserver needs to be replaced by something else that servers the /mediafiles/ directory or 
`GUNICORN_MEDIA` needs to be enabled to allow media serving by the application container itself.

## User Creation
To create a new user click on your name (top right corner) and select system. There click on invite links and create a new invite link.

It is not possible to create users through the admin because users must be assigned a default group and space.

To change a users space you need to go to the admin and select User Infos. 

If you use an external auth provider or proxy authentication make sure to specify a default group and space in the 
environment configuration.

## Spaces
Spaces are a feature used to separate one installation of Tandoor into several parts. 
In technical terms it is a multi tenant system.

You can compare a space to something like google drive or dropbox. 
There is only one installation of the Dropbox system, but it handles multiple users without them noticing each other.
For Tandoor that means all people that work together on one recipe collection can be in one space. 
If you want to host the collection of your friends family or your neighbor you can create a separate space for them (trough the admin interface).

Sharing between spaces is currently not possible but is planned for future releases.