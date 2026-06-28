<!-- prettier-ignore -->
!!! warning
    Connectors are currently in a beta stage.

## Connectors

Connectors are a powerful add-on component to TandoorRecipes.
They allow for certain actions to be translated to api calls to external services.

<!-- prettier-ignore -->
!!! danger
    In order for this application to push data to external providers it needs to store authentication information.
    Please use read only/separate accounts or app passwords wherever possible.

for the configuration please see [Configuration](https://docs.tandoor.dev/system/configuration/#connectors)

## Current Connectors

### HomeAssistant

The current HomeAssistant connector supports the following features:
1. Push newly created shopping list items.
2. Pushes all shopping list items if a recipe is added to the shopping list.
3. Removed todo's from HomeAssistant IF they are unchanged and are removed through TandoorRecipes.

#### How to configure:

Step 1:
1. Generate a HomeAssistant Long-Lived Access Tokens
![Profile Page](https://github.com/TandoorRecipes/recipes/assets/7824786/15ebeec5-5be3-48db-97d1-c698405db533)
2. Get/create a todo list entry you want to sync too.
![Todos Viewer](https://github.com/TandoorRecipes/recipes/assets/7824786/506c4c34-3d40-48ae-a80c-e50374c5c618)
3. Create a Home Assistant connector and fill in the required fields:

- **URL:** Enter your Home Assistant URL **including the `/api` suffix**.
  Example:
  ```
  http://homeassistant.local:8123/api
  ```
  or
  ```
  https://homeassistant.example.com/api
  ```

- **Access Token:** Paste the Long-Lived Access Token created in Step 1.

- **Name of Todo List:** Enter the full Home Assistant todo entity ID (for example, `todo.shopping`), not just the display name (`shopping`).

![New Connector Config](...)
!!! note
    Recent versions of the Home Assistant connector UI no longer explicitly mention adding `/api` to the URL. Make sure the URL includes `/api`, otherwise the connector will not work.

    The **Name of Todo List** field expects the full entity ID (for example, `todo.shopping`) rather than only the list name.
4. ???
5. Profit
