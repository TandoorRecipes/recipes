This application features a very versatile import and export feature in order
to offer the best experience possible and allow you to freely choose where your data goes.

!!! WARNING "WIP"
    The Module is relatively new. There is a known issue with [Timeouts](https://github.com/vabene1111/recipes/issues/417) on large exports.
    A fix is being developed and will likely be released with the next version.

The Module is built with maximum flexibility and expandability in mind and allows to easily add new
integrations to allow you to both import and export your recipes into whatever format you desire.

Feel like there is an important integration missing? Just take a look at the [integration issues](https://github.com/vabene1111/recipes/issues?q=is%3Aissue+is%3Aopen+label%3Aintegration) or open a new one
if your favorite one is missing.

!!! info "Export"
    I strongly believe in everyone's right to use their data as they please and therefore want to give you
    the best possible flexibility with your recipes.
    That said for most of the people getting this application running with their recipes is the biggest priority.
    Because of this importing as many formats as possible is prioritized over exporting.
    Exporter for the different formats will follow over time.

Overview of the capabilities of the different integrations.

| Integration        | Import | Export | Images |
| ------------------ | ------ | ------ | ------ |
| Default            | ✔️     | ✔️     | ✔️     |
| Nextcloud          | ✔️     | ⌚     | ✔️     |
| Mealie             | ✔️     | ⌚     | ✔️     |
| Chowdown           | ✔️     | ⌚     | ✔️     |
| Safron             | ✔️     | ✔️     | ❌     |
| Paprika            | ✔️     | ⌚     | ✔️     |
| ChefTap            | ✔️     | ❌     | ❌     |
| Pepperplate        | ✔️     | ⌚     | ❌     |
| RecipeSage         | ✔️     | ✔️     | ✔️     |
| Rezeptsuite.de     | ✔️     | ❌     | ✔️     |
| Domestica          | ✔️     | ⌚     | ✔️     |
| MealMaster         | ✔️     | ❌     | ❌     |
| RezKonv            | ✔️     | ❌     | ❌     |
| OpenEats           | ✔️     | ❌     | ⌚     |
| Plantoeat          | ✔️     | ❌     | ✔      |
| CookBookApp        | ✔️     | ⌚     | ✔️     |
| CopyMeThat         | ✔️     | ❌     | ✔️     |
| Melarecipes        | ✔️     | ⌚     | ✔️     |
| Cookmate           | ✔️     | ⌚     | ✔️     |
| PDF (experimental) | ⌚️    | ✔️     | ✔️     |
| Gourmet            | ✔️     | ❌     | ✔️     |

✔️ = implemented, ❌ = not implemented and not possible/planned, ⌚ = not yet implemented

## Default

The default integration is the built in (and preferred) way to import and export recipes.
It is maintained with new fields added and contains all data to transfer your recipes from one installation to another.

It is also one of the few recipe formats that is actually structured in a way that allows for
easy machine readability if you want to use the data for any other purpose.

## JSON Import/Export

This application features a very versatile import and export feature in order to offer the best experience possible and allow you to freely choose where your data goes.

### Recipe JSON Format

The `recipe.json` file is a structured representation of your recipes, enabling easy import and export between different platforms and applications. This format ensures that all essential details of a recipe are preserved and can be seamlessly integrated into your recipe management system.

#### Structure Overview

The JSON structure is designed to encapsulate all necessary information about a recipe, including its name, description, keywords, ingredients, preparation steps, and additional metadata. Below is the detailed breakdown of the structure:

```json
{
  "name": "Fantasy Recipe Name",
  "description": "A brief description of the recipe.",
  "keywords": [
    {
      "name": "keyword1",
      "description": "",
      "created_at": "YYYY-MM-DDTHH:MM:SSZ",
      "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
    }
    // Additional keywords...
  ],
  "steps": [
    {
      "name": "Step Name",
      "instruction": "Detailed instructions for this step.\n\nAdditional details.",
      "ingredients": [
        {
          "food": {
            "name": "Ingredient Name",
            "plural_name": null,
            "ignore_shopping": false,
            "supermarket_category": null
          },
          "unit": {
            "name": "Unit Name",
            "plural_name": "Unit Plural",
            "description": null
          },
          "amount": 0.0,
          "note": "Additional notes",
          "order": 0,
          "is_header": false,
          "no_amount": false,
          "always_use_plural_unit": false,
          "always_use_plural_food": false
        }
        // Additional ingredients...
      ],
      "time": 0,
      "order": 0,
      "show_as_header": false,
      "show_ingredients_table": true
    }
    // Additional steps...
  ],
  "working_time": 0,
  "waiting_time": 0,
  "internal": true,
  "nutrition": null,
  "servings": 0,
  "servings_text": "",
  "source_url": null
}
```

### Components Description

- **name**: The title of the recipe.
- **description**: A brief overview or background of the recipe.
- **keywords**: An array of relevant tags or categories associated with the recipe.
    - **name**: The keyword itself.
    - **description**: (Optional) Additional details about the keyword.
    - **created_at** & **updated_at**: Timestamps for metadata management.
- **steps**: An ordered list of instructions to prepare the recipe.
    - **name**: The title of the step.
    - **instruction**: Detailed guidance on performing the step, with `\n` representing line breaks.
    - **ingredients**: A list of ingredients required for the step.
        - **food**: Details about the ingredient.
            - **name**: Ingredient name.
            - **plural_name**: (Optional) Plural form if different from the name.
            - **ignore_shopping**: Boolean indicating if the ingredient should be excluded from shopping lists.
            - **supermarket_category**: (Optional) Category classification for the ingredient.
        - **unit**: Measurement unit for the ingredient.
            - **name**: Singular form of the unit.
            - **plural_name**: Plural form of the unit.
            - **description**: (Optional) Additional details about the unit.
        - **amount**: Quantity required.
        - **note**: (Optional) Additional notes about the ingredient.
        - **order**: Sequence order in the ingredient list.
        - **is_header**, **no_amount**, **always_use_plural_unit**, **always_use_plural_food**: Boolean flags for advanced formatting and usage.
    - **time**: Time required for the step.
    - **order**: Sequence order of the step.
    - **show_as_header**: Boolean indicating if the step should be highlighted.
    - **show_ingredients_table**: Boolean indicating if ingredients should be displayed in a table format.
- **working_time**: Total active preparation time in minutes.
- **waiting_time**: Total passive waiting time in minutes.
- **internal**: Boolean indicating if the recipe is for internal use.
- **nutrition**: (Optional) Nutritional information.
- **servings**: Number of servings the recipe yields.
- **servings_text**: (Optional) Additional servings information.
- **source_url**: (Optional) URL source of the recipe.

### Fantasy Recipe Example

Below is an example of a fantasy-themed recipe structured in the described JSON format:

```json
{
  "name": "Dragonfire Stew",
  "description": "A fiery stew inspired by the legendary dragons, infused with exotic spices and enchanted ingredients.",
  "keywords": [
    {
      "name": "fantasy",
      "description": "",
      "created_at": "2024-04-01T12:00:00Z",
      "updated_at": "2024-04-01T12:00:00Z"
    },
    {
      "name": "dragon cuisine",
      "description": "",
      "created_at": "2024-04-01T12:00:00Z",
      "updated_at": "2024-04-01T12:00:00Z"
    }
  ],
  "steps": [
    {
      "name": "Prepare the Fiery Broth",
      "instruction": "Combine dragon's breath pepper, phoenix feathers, and volcanic water in a cauldron.\n\nBring to a rolling boil over an open flame.",
      "ingredients": [
        {
          "food": {
            "name": "Dragon's Breath Pepper",
            "plural_name": null,
            "ignore_shopping": false,
            "supermarket_category": null
          },
          "unit": {
            "name": "tbsp",
            "plural_name": "tbsp",
            "description": null
          },
          "amount": 3.0,
          "note": "finely ground",
          "order": 0,
          "is_header": false,
          "no_amount": false,
          "always_use_plural_unit": false,
          "always_use_plural_food": false
        },
        {
          "food": {
            "name": "Phoenix Feathers",
            "plural_name": null,
            "ignore_shopping": false,
            "supermarket_category": null
          },
          "unit": {
            "name": "pieces",
            "plural_name": "pieces",
            "description": null
          },
          "amount": 5.0,
          "note": "pure essence",
          "order": 1,
          "is_header": false,
          "no_amount": false,
          "always_use_plural_unit": false,
          "always_use_plural_food": false
        },
        {
          "food": {
            "name": "Volcanic Water",
            "plural_name": null,
            "ignore_shopping": false,
            "supermarket_category": null
          },
          "unit": {
            "name": "liter",
            "plural_name": "liters",
            "description": null
          },
          "amount": 2.0,
          "note": "boiled and cooled",
          "order": 2,
          "is_header": false,
          "no_amount": false,
          "always_use_plural_unit": false,
          "always_use_plural_food": false
        }
      ],
      "time": 30,
      "order": 0,
      "show_as_header": false,
      "show_ingredients_table": true
    },
    {
      "name": "Add Mystic Vegetables",
      "instruction": "Introduce enchanted root vegetables and lunar mushrooms into the simmering broth.\n\nStir counterclockwise five times to activate the magic.",
      "ingredients": [
        {
          "food": {
            "name": "Enchanted Root Vegetables",
            "plural_name": null,
            "ignore_shopping": false,
            "supermarket_category": null
          },
          "unit": {
            "name": "cup",
            "plural_name": "cups",
            "description": null
          },
          "amount": 4.0,
          "note": "chopped",
          "order": 0,
          "is_header": false,
          "no_amount": false,
          "always_use_plural_unit": false,
          "always_use_plural_food": false
        },
        {
          "food": {
            "name": "Lunar Mushrooms",
            "plural_name": null,
            "ignore_shopping": false,
            "supermarket_category": null
          },
          "unit": {
            "name": "handful",
            "plural_name": "handfuls",
            "description": null
          },
          "amount": 2.0,
          "note": "freshly harvested",
          "order": 1,
          "is_header": false,
          "no_amount": false,
          "always_use_plural_unit": false,
          "always_use_plural_food": false
        }
      ],
      "time": 20,
      "order": 1,
      "show_as_header": false,
      "show_ingredients_table": true
    }
  ],
  "working_time": 50,
  "waiting_time": 60,
  "internal": false,
  "nutrition": {
    "calories": 450,
    "protein": "15g",
    "fat": "20g",
    "carbohydrates": "50g"
  },
  "servings": 6,
  "servings_text": "Serves six adventurers",
  "source_url": "https://fantasysrecipes.com/dragonfire-stew"
}
```

### Zip File Structure

To package the recipe along with its associated image, adhere to the following zip file structure:

- **Root Zip File**: Named in the format `export_YYYY-MM-DD.zip` (e.g., `export_2024-12-09.zip`).
  - **Inner Folder**: A folder named with any arbitrary number, followed by `.zip` (e.g., `6.zip`).
    - **Contents of Inner Folder**:
      - `recipe.json`: The JSON file containing the recipe data.
      - `image.jpeg`: An image associated with the recipe (e.g., a photo of the prepared dish or a scan of the original handwritten recipe).

`  export_YYYY-MM-DD.zip/
    └── 6.zip/
        ├── recipe.json
        └── image.jpeg

### Converting Recipe Photos to JSON

To digitize recipes from physical copies (such as photos from a recipe book), follow these steps:

1. **Capture the Recipe Image**:
    - Take a clear photo of the recipe page ensuring all text and details are legible.

2. **Extract Text Using OCR (Optical Character Recognition)**:
    - Utilize OCR tools or applications (e.g., Adobe Scan, Google Keep, ChatGPT or specialized OCR software) to convert the image text into editable digital text.

3. **Organize Extracted Data**:
    - Structure the extracted text into the predefined JSON format. Pay attention to correctly mapping recipe components such as ingredients, instructions, and metadata.

4. **Use a Language Model for Structuring**:
    - Employ a language model (like GPT-4) to assist in formatting the extracted text into the JSON structure. You can prompt the model with the raw text and request it to output the structured JSON.

    **Example Prompt**:

    ```
    Convert the following recipe into the specified JSON format:

    [Insert extracted recipe text here]
    ```

5. **Validate the JSON**:
    - Use online tools like [JSONLint](https://jsonlint.com/) to ensure the JSON syntax is correct and free of errors.

6. **Prepare the Zip File**:
    - Create the inner zip folder (e.g., `6.zip`) containing the `recipe.json` and `image.jpeg`.
    - Compress the inner folder into the root zip file named `export_YYYY-MM-DD.zip`.

7. **Store or Share**:
    - The final zip file can be stored digitally for easy access, sharing, or integration with recipe management applications.

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

!!! WARNING "Folder Structure"
Importing only works if the folder structure is correct. If you do not use the standard path or create the
zip file in any other way make sure the structure is as follows
`  Recipes.zip/
    └── Recipes/
        ├── Recipe1/
        │   ├── recipe.json
        │   └── full.jpg
        └── Recipe2/
            ├── recipe.json
            └── full.jpg
 `

## Mealie

Mealie provides structured data similar to nextcloud.

To migrate your recipes

1. Go to your Mealie settings and create a new Backup.
2. Download the backup by clicking on it and pressing download (this wasn't working for me, so I had to manually pull it from the server).
3. Upload the entire `.zip` file to the importer page and import everything.

## Chowdown

Chowdown stores all your recipes in plain text markdown files in a directory called `_recipes`.
Images are saved in a directory called `images`.

In order to import your Chowdown recipes simply create a `.zip` file from those two folders and import them.
The folder structure should look as follows

!!! info "_recipes"
For some reason chowdown uses `_`before the`recipes`folder. To avoid confusion the import supports both
   `\_recipes`and`recipes`

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

Go to your safron settings page and export your recipes.
Then simply upload the entire `.zip` file to the importer.

!!! warning "Images"
Safron exports do not contain any images. They will be lost during import.

## Paprika

A Paprika export contains a folder with a html representation of your recipes and a `.paprikarecipes` file.

The `.paprikarecipes` file is basically just a zip with gzipped contents. Simply upload the whole file and import
all your recipes.

## Pepperplate

Pepperplate provides a `.zip` file containing all of your recipes as `.txt` files. These files are well-structured and allow
the import of all data without losing anything.

Simply export the recipes from Pepperplate and upload the zip to Tandoor. Images are not included in the export and
thus cannot be imported.

## ChefTap

ChefTaps allows you to export your recipes from the app (I think). The export is a zip file containing a folder called
`cheftap_export` which in turn contains `.txt` files with your recipes.

This format is basically completely unstructured and every export looks different. This makes importing it very hard
and leads to suboptimal results. Images are also not supported as they are not included in the export (at least
the tests I had).

Usually the import should recognize all ingredients and put everything else into the instructions. If your import fails
or is worse than this feel free to provide me with more example data and I can try to improve the importer.

As ChefTap cannot import these files anyway there won't be an exporter implemented in Tandoor.

## MealMaster

Meal master can be imported by uploading one or more meal master files.
The files should either be `.txt`, `.MMF` or `.MM` files.

The MealMaster spec allows for many variations. Currently, only the one column format for ingredients is supported.
Second line notes to ingredients are currently also not imported as a note but simply put into the instructions.
If you have MealMaster recipes that cannot be imported feel free to raise an issue.

## RezKonv

The RezKonv format is primarily used in the german recipe manager RezKonv Suite.
To migrate from RezKonv Suite to Tandoor select `Export > Gesamtes Kochbuch exportieren` (the last option in the export menu).
The generated file can simply be imported into Tandoor.

As I only had limited sample data feel free to open an issue if your RezKonv export cannot be imported.

## Recipekeeper

Recipe keeper allows you to export a zip file containing recipes and images using its apps.
This zip file can simply be imported into Tandoor.

## OpenEats

OpenEats does not provide any way to export the data using the interface. Luckily it is relatively easy to export it from the command line.
You need to run the command `python manage.py dumpdata recipe ingredient` inside of the application api container.
If you followed the default installation method you can use the following command `docker-compose -f docker-prod.yml run --rm --entrypoint 'sh' api ./manage.py dumpdata recipe ingredient`.
This command might also work `docker exec -it openeats_api_1 ./manage.py dumpdata recipe ingredient rating recipe_groups > recipe_ingredients.json`

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

To import your images you'll need to create the folder `openeats-import` in your Tandoor's `recipes` media folder (which is usually found inside `/opt/recipes/mediafiles`). After that you'll need to copy the `/code/site-media/upload` folder from the openeats API docker container to the `openeats` folder you created. You should now have the file path `/opt/recipes/mediafiles/recipes/openeats-import/upload/...` in Tandoor.

## Plantoeat

Plan to eat allows you to export a text file containing all your recipes. Simply upload that text file to Tandoor to import all recipes

## CookBookApp

CookBookApp can export .zip files containing .html files. Upload the entire ZIP to Tandoor to import all included recipes.

## CopyMeThat

CopyMeThat can export .zip files containing an `.html` file as well as a folder containing all the images. Upload the entire ZIP to Tandoor to import all included recipes.

## Cookmate

Cookmate allows you to export a `.mcb` file which you can simply upload to tandoor and import all your recipes.

## RecetteTek

RecetteTek exports are `.rtk` files which can simply be uploaded to tandoor to import all your recipes.

## Rezeptsuite.de

Rezeptsuite.de exports are `.xml` files which can simply be uploaded to tandoor to import all your recipes.

It appears that Reptsuite, depending on the client, might export a `.zip` file containing a `.cml` file.
If this happens just unzip the zip file and change `.cml` to `.xml` to import your recipes.

## Melarecipes

Melarecipes provides multiple export formats but only the `MelaRecipes` format can export the complete collection.
Perform this export and open the `.melarecipes` file using your favorite archive opening program (e.g 7zip).
Repeat this if the file contains another `.melarecipes` file until you get a list of one or many `.melarecipe` files.
Upload all `.melarecipe` files you want to import to tandoor and start the import.

## PDF

The PDF Exporter is an experimental feature that uses the puppeteer browser renderer to render each recipe and export it to PDF.
For that to work it downloads a chromium binary of about 140 MB to your server and then renders the PDF files using that.

Since that is something some server administrators might not want there the PDF exporter is disabled by default and can be enabled with `ENABLE_PDF_EXPORT=1` in `.env`.

See [this issue](https://github.com/TandoorRecipes/recipes/pull/1211) for more discussion on this and
[this issue](https://github.com/TandoorRecipes/recipes/issues/781) for the future plans to support server side rendering.

## Gourmet

An importer for files from [Gourmet](https://github.com/thinkle/gourmet/). As the `.grmt` files appears to lack the unit for ingredients
a file with `.zip` file with `.htm` and `.jpg`is expected.

To generate the file export to 'html' in Gourmet and zip the folder generated.

The import of menues is not supported

Export is not supported due to problems with `.grmt` format.
