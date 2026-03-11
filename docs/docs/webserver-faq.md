# Webserver Setup FAQ

## Required Headers

When running TandoorRecipes behind a reverse proxy make sure the following headers are configured:


## Common Errors

- Missing proxy headers
- Incorrect port configuration
- HTTPS redirect loops

## Subdomain vs Subfolder

Example subdomain:
recipes.example.com

Example subfolder:
example.com/recipes

## Supported Reverse Proxies

- NGINX
- Apache
- Traefik
- Swag
- Caddy
