This is the most basic configuration to run this image with docker compose.

> **NOTE**: There is no proxy included in this configuration and gunicorn is directly exposed as the webserver which is
> not recommended by according to the [gunicorn devs](https://serverfault.com/questions/331256/why-do-i-need-nginx-and-something-like-gunicorn). 
> It is higly recommended to configure an additional proxy (nginx, ...) in front of this.