!!! warning
    Connectors are currently in a beta stage.

## Connectors

Connectors are a powerful add-on component to TandoorRecipes.
They allow for certain actions to be translated to api calls to external services.

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
3. Create a connector 
![New Connector Config](https://github.com/TandoorRecipes/recipes/assets/7824786/7f14f181-1341-4cab-959b-a6bef79e2159)
4. ???
5. Profit
