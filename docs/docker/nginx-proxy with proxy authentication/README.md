This is a further example combining the power of nginx with the reverse proxy authentication service, [Authelia](https://github.com/authelia/authelia).

Please refer to the appropriate documentation on how to setup the reverse proxy, authentication, and networks.

Ensure users have been configured for Authelia, and that the endpoint that recipes is pointed to is protected, but available.

There is a good guide to the other additional files that need to be added to your Nginx set up at the [Authelia Docs](https://docs.authelia.com/deployment/supported-proxies/nginx.html).

Remember to add the appropriate environment variables to `.env` file:
```
VIRTUAL_HOST=
LETSENCRYPT_HOST=
LETSENCRYPT_EMAIL=
PROXY_HEADER=
```