This application features a very versatile import and export feature in order 
to offer the best experience possible and allow you to freely choose where your data goes.

!!! warning "WIP"
    The Module is relatively new. There is a know issue with [Timeouts](https://github.com/vabene1111/recipes/issues/417) on large exports.
    A fix is being developed and will likely be released with the next version.

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

Overview of the capabilities of the different integrations.

| Integration | Import | Export | Images |
| ----------- | ------ | ------ | ------ |
| Default     | ✔️      | ✔️      | ✔️      |
| Nextcloud   | ✔️      | ⌚      | ✔️      |
| Mealie      | ✔️      | ⌚      | ✔️      |
| Chowdown    | ✔️      | ⌚      | ✔️      |
| Safron      | ✔️      | ⌚      | ❌      |
| Paprika     | ✔️      | ⌚      | ✔️      |
| ChefTap     | ✔️      | ❌      | ❌️      |

✔ = implemented, ❌ = not implemented and not possible/planned, ⌚ = not yet implemented

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
A Paprika export contains a folder with a html representation of your recipes and a `.paprikarecipes` file.

The `.paprikarecipes` file is basically just a zip with gzipped contents. Simply upload the whole file and import 
all your recipes. 

## ChefTap
ChefTaps allows you to export your recipes from the app (I think). The export is a zip file containing a folder called
`recipes` which in turn contains `.txt` files with your recipes.

This format is basically completely unstructured and every export looks different. This makes importing it very hard
and leads to suboptimal results. Images are also not supported as they are not included in the export (at least 
the tests I had).

Usually the import should recognize all ingredients and put everything else into the instructions. If you import fails
or is worse than this feel free to provide me with more example data and I can try to improve the importer.

As ChefTap cannot import these files anyway there won't be an exporter implemented in Tandoor.