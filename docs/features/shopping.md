!!! info "WIP"
    While being around for a while there are still a lot of features that I plan on adding to the shopping list.
    You can see an overview of what is still planned on [this](https://github.com/vabene1111/recipes/issues/114) issue.


Shopping lists allow you to easily convert a recipe or even a whole meal plan into a shopping list. From there
you can either use it on the site or export it to your shopping list of choice. 
It also includes automatic supermarket specific ordering.

![Shopping List View](https://user-images.githubusercontent.com/6819595/105896231-d4c29100-6016-11eb-88a2-eb67d8fb3ad2.png)

## Create Shopping Lists
You have three options to create a shopping list

1. Open a recipe of your choice. From the context menu choose `Add to Shoppinglist` and create a new list with the recipe already added.
2. After adding recipes to the meal plan you can click the little shopping cart icon to add the recipes to the shopping list.
   They will be shown below the plan, from there you can open a new shopping list with them.
3. The last option is to open the shopping list page and click the little plus icon to create a new list.

## Supermarket Ordering

!!! warning "WIP"
    This feature is relatively new and I did not have the time to completely polished it yet, that said 
    it already works quite well.

You can create Supermarket Categories and Supermarkets in the admin interface.
After setting this up you can choose a supermarket for each shopping list.
This will automatically show the categories configured for this supermarket in the order specified.
All Foods that are not yet categorized can be dragged into their category, this will save the categories
for the future.

## Sharing & Autosync
If you want to collaborate on the creation and usage of the shopping list you can add a user to the list of shared users.
Each user now has access to the list and can edit it. 

When checking items in viewing mode the change is synced to all other clients that currently have the same list open.
You can set the syncing interval in your user settings.

## Other Features
There are a few more features worth pointing out

1. You can export recipes for use in other applications (Google Keep, etc.) by using the export button
2. In the export popup you can define a prefix to be put before each row in case an external app requires that
3. Marking a shopping list as finished will hide it from the shopping list page
