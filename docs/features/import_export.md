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
| ChefTap     | ✔️      | ❌      |  ❌     |
| Pepperplate     | ✔️      | ⌚      | ❌      |
| RecipeSage     | ✔️      | ✔️      | ✔️      |
| Domestica     | ✔️      | ⌚      | ✔️      |
| MealMaster     | ✔️      | ❌      |  ❌        |
| RezKonv     | ✔️      | ❌      |  ❌        |
| OpenEats     | ✔️      | ❌      |  ⌚        |
| OpenEats     | ✔️      | ❌      |  ✔        |

✔ = implemented, ❌ = not implemented and not possible/planned, ⌚ = not yet implemented

## Default
The default integration is the build in (and preferred) way to import and export recipes.
It is maintained with new fields added and contains all data to transfer your recipes from one installation to another.

It is also one of the few recipe formats that is actually structured in a way that allows for 
easy machine readability if you want to use the data for any other purpose. 

## RecipeSage
Go to Settings > Export Recipe Data and select `EXPORT AS JSON-LD (BEST)`. Then simply upload the exported file 
to Tandoor.

The RecipeSage integration also allows exporting. To migrate from Tandoor to RecipeSage simply export with Recipe Sage 
selected and import the json file in RecipeSage. Images are currently not supported for exporting.

## Domestica
Go to Import/Export and select `Export Recipes`. Then simply upload the exported file 
to Tandoor.

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

## Pepperplate
Pepperplate provides a `.zip` files contain all your recipes as `.txt` files. These files are well-structured and allow
the import of all data without loosing anything.

Simply export the recipes from Pepperplate and upload the zip to Tandoor. Images are not included in the export and 
thus cannot be imported.

## ChefTap
ChefTaps allows you to export your recipes from the app (I think). The export is a zip file containing a folder called
`cheftap_export` which in turn contains `.txt` files with your recipes.

This format is basically completely unstructured and every export looks different. This makes importing it very hard
and leads to suboptimal results. Images are also not supported as they are not included in the export (at least 
the tests I had).

Usually the import should recognize all ingredients and put everything else into the instructions. If you import fails
or is worse than this feel free to provide me with more example data and I can try to improve the importer.

As ChefTap cannot import these files anyway there won't be an exporter implemented in Tandoor.

## MealMaster
Meal master can be imported by uploading one or more meal master files. 
The files should either be `.txt`, `.MMF` or `.MM` files. 

The MealMaster spec allow for many variations. Currently, only the on column format for ingredients is supported.
Second line notes to ingredients are currently also not imported as a note but simply put into the instructions.
If you have MealMaster recipes that cannot be imported feel free to raise an issue.

## RezKonv
The RezKonv format is primarily used in the german recipe manager RezKonv Suite. 
To migrate from RezKonv Suite to Tandoor select `Export > Gesamtes Kochbuch exportieren` (the last option in the export menu).
The generated file can simply be imported into Tandoor.

As I only had limited sample data feel free to open an issue if your RezKonv export cannot be imported.

## Recipekeeper
Recipe keeper allows to export a zip file containing recipes and images using its apps. 
This zip file can simply be imported into Tandoor.

## OpenEats
OpenEats does not provide any way to export the data using the interface. Luckily it is relatively easy to export it from the command line.
You need to run the command `python manage.py dumpdata recipe ingredient` inside of the application api container.
If you followed the default installation method you can use the following command `docker-compose -f docker-prod.yml run --rm --entrypoint 'sh' api ./manage.py dumpdata recipe ingredient`.
This command might also work `docker exec -it openeats_api_1 ./manage.py dumpdata recipe ingredient > recipe_ingredients.json`

Store the outputted json string in a `.json` file and simply import it using the importer. The file should look something like this
```json
[
   {
      "model":"recipe.recipe",
      "pk":1,
      "fields":{
         "title":"Tasty Chili",
         ...
      }
   },
  ...
    {
      "model":"ingredient.ingredientgroup",
      "pk":1,
      "fields":{
         "title":"Veges",
         "recipe":1
      }
   },
  ...
  {
      "model":"ingredient.ingredient",
      "pk":1,
      "fields":{
         "title":"black pepper",
         "numerator":1.0,
         "denominator":1.0,
         "measurement":"dash",
         "ingredient_group":1
      }
   }
]

```