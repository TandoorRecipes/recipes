This application features a very versatile import and export feature in order 
to offer the best experience possible and allow you to freely choose where your data goes.

The Module is build with maximum flexibility and expandability in mind and allows to easily add new
integrations to allow you to both import and export your recipes into whatever format you desire.

Feel like there is an important integration missing ? Just take a look at the [integration issues](https://github.com/vabene1111/recipes/issues?q=is%3Aissue+is%3Aopen+label%3Aintegration) or open a new one
if your favorite one is missing.

!!! warning "WIP"
    Please note that this feature is relatively new and many integrations are missing.
    Additionally, many recipe applications provide formats that are not structured in an easily machine-readable way
    and thus require a lot of work to integrate even tough the module is very versatile.
    If you are good at writing parsers feel free to add new integrations for your favorite services.


## Default
The default integration is the build in (and preferred) way to import and export recipes.
It is maintained with new fields added and contains all data to transfer your recipes from one installation to another.

It is also one of the few recipe formats that is actually structured in a way that allows for 
easy machine readability if you want to use the data for any other purpose. 

## Nextcloud
Importing recipes from Nextcloud cookbook is very easy and since Nextcloud Cookbook provides nice, standardized and 
structured information most of your recipe is going to be intact.

Follow these steps to import your recipes

1. Go to your Nextcloud Webinterface
2. Open the `Recipes` folder where your recipes are stored
3. Select the recipes you want to export or use the checkbox at the top of the list to select all of them
4. Click on the three dot **Actions** and press Download

You will get a `Recipes.zip` file. Simply upload the file and choose the Nextcloud Cookbook type.

!!! warning "Folder Structure"
    Importing only works if the folder structure is correct. If you do not use the standard path or create the 
    zip file in any other way make sure the strucutre is as follows
    ```
    Recipes.zip/
    └── Recipes/
        ├── Recipe1/
        │   ├── recipe.json
        │   └── full.jpg
        └── Recipe2/
            ├── recipe.json
            └── full.jpg
    ```


## Paprika
Paprika can create two types of export. The first is a proprietary `.paprikarecipes` file in some kind of binarized format.
The second one is HTML files containing at least a bit of microdata.

If you want to import your Paprika recipes create a html export. Then import the individual recipes HTML files.
Due to the lack of structure not all fields can be imported. 
Even tough images are present in the export they cannot be imported atm. This is technically possible and might be 
added in the future.