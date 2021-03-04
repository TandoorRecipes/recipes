This application features a very versatile import and export feature in order 
to offer the best experience possible and allow you to freely choose where your data goes.

The Module is build with maximum flexibility and expandability in mind and allows to easily add new
integrations to allow you to both import and export your recipes into whatever format you desire.

Feel like there is an important integration missing ? Just take a look at the [integration issues](https://github.com/vabene1111/recipes/issues?q=is%3Aissue+is%3Aopen+label%3Aintegration) or open a new one
if your favorite one is missing.

!!! info "Export"
    I strongly believe in everyone's right to use their data as they please and therefore want to give you 
    the most possible flexibility with your recipes.
    That said for most of the people getting this application running with their recipes is the biggest priority.
    Because of this importing as many formats as possible is prioritized over exporting.
    Exporter for the different formats will follow over time.

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
    zip file in any other way make sure the structure is as follows
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

## Mealie
Mealie provides structured data similar to nextcloud. 

To migrate your recipes 

1. Go to you Mealie settings and create a new Backup
2. Download the backup by clicking on it and pressing download (this wasn't working for me, so I had to manually pull it from the server)
3. Upload the entire `.zip` file to the importer page and import everything

## Chowdown
Chowdown stores all your recipes in plain text markdown files in a directory called `_recipes`. 
Images are saved in a directory called `images`.

In order to import your Chowdown recipes simply create a `.zip` file from those two folders and import them. 
The folder structure should look as follows

!!! info "_recipes"
    For some reason chowdown uses `_` before the `recipes` folder. To avoid confusion the import supports both
    `_recipes` and `recipes`

```
Recipes.zip/
    ├── _recipes/
    │   ├── recipe one.md
    │   ├── recipe two.md
    │   └── ...
    └── images/
        ├── image-name.jpg
        ├── second-image-name.jpg
        └── ...
```

## Safron
Go to you safron settings page and export your recipes.
Then simply upload the entire `.zip` file to the importer.

!!! warning "Images"
    Safron exports do not contain any images. They will be lost during import.

## Paprika
Paprika can create two types of export. The first is a proprietary `.paprikarecipes` file in some kind of binarized format.
The second one is HTML files containing at least a bit of microdata.

If you want to import your Paprika recipes follow these steps

1. create a html export
2. Create a `.zip` file from the `Recipes` folder (next to the `index.html`) the structure should look like this
```
Recipes.zip/
    └── Recipes/
        ├── recipe one.html
        ├── recipe two.thml
        └── Images/
            ├── 5D5E09CD-8F88-4F61-8121-0727DD3E0E89/
            │   └── 5D5E09CD-8F88-4F61-8121-0727DD3E0E89.jpg
            └── 7CEE2AC6-DF60-4464-9B61-4F5E347EB90C/
                └── 7CEE2AC6-DF60-4464-9B61-4F5E347EB90C.jpg
```
3. Upload the zip file in the import module and import it