# Import / Export Integration Contribution Guide

# Setup
There are 5 files you need to configure in order create a new integration
1. Create a new integration class in `/cookbook/integration/`
2. Include integration in `/cookbook/forms.py` 
3. Add the new integration class import and include in the 'if' chain in `/cookbook/views/import_export.py`
4. Add your integration to the documentation at `/docs/features/import_export.md`
5. Include integration and docs link in `/vue3/src/utils/integration_utils.ts`


## 1. Creating a New Integration Class
Your integration class should be named after what you are integrating with and should inherit from the `Integration` class. Use the template below to setup your class.

`/cookbook/integration/yourintegration.py`
```python
from io import BytesIO, StringIO
from zipfile import ZipFile

from cookbook.integration.integration import Integration
# from cookbook.helper.ingredient_parser import IngredientParser
# import other cookbook.helper as necessary
from cookbook.models import  Ingredient, Keyword, NutritionInformation, Recipe, Step


class YourIntegrationName(Integration):
    
    def get_recipe_from_file(self, file) -> Recipe:
        #Import Recipe Logic - convert information from file into Recipe() object
        pass
    
    def import_file_name_filter(self, file) -> bool:
        #check file extension, return True if extension is correct
        pass
    
    def get_file_from_recipe(self, recipe) -> tuple[str,str]:
        #Export Recipe Logic - convert from Recipe() object to a writable string in your integration's format
        # return 'Filename.extension', 'file string'
        pass
        
    def get_files_from_recipes(self, recipes, el, cookie) -> list[list[str,bytes]]:
        # 'el' and 'cookie' are passed through by the calling function 'do_export'
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')

        for recipe in recipes:
            if True: #add any verification logic
                # get string data and filename from get_file_from_recipe() method and save it to a zip stream
                recipe_stream = StringIO()
                filename, data = self.get_file_from_recipe(recipe)
                recipe_stream.write(data)
                export_zip_obj.writestr(f'{recipe.name}/{filename}', recipe_stream.getvalue())
                recipe_stream.close()

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(recipe)
            el.save()

        export_zip_obj.close()
        
        # returns a [[file name, zip stream data]]
        # self.get_export_file_name is an inherited from the Integration class and doesn't require definition
        return [[self.get_export_file_name(), export_zip_stream.getvalue()]]
    
```

## 2. including in Forms.py
In the `/cookbook/forms.py` find the `ImportExportBase` class and add to it the following amoung the others:
```python
YOURINTEGRATION = "YOURINTEGRATION"
```
Then you will find under that the following declaration:

`
type = forms.ChoiceField(choices=())
`
the choices will have a long list of tuples. Add to the list of tuples the following:

```python
(YOURINTEGRATION, 'Your Integration'),
```

## 3. Including in Views
In the `/cookbook/views/import_export.py` import your integration

```python
from cookbook.integration.yourintegration import YourIntegration
```

Then add the following code to the long `if` chain:

```python
if export_type == ImportExportBase.YOURINTEGRATION:
    return YourIntegration(request, export_type)
```

be careful to use the exact all caps name of your integration that you used in the `cookbook/forms.py` or else it won't recognize it as a type. the snake case is the class that you defined in `/cookbook/integration`

## 4. Add to the Documentation
If nothing else, you at least have to add one slugline about your integration in the `/docs/features/import_export.md` because the Vue pages require a link to send the send the user to if they hit the information button on the import/export form.

Go to the bottom of the doc and add:
```markdown
## YourIntegration
a little blurb about how it works or anything users should know about how the data needs to be formated.
```

Additionally add your integration to the table at the top of the document, marking the state of your integration, or wait until it is integrated and tested before adding to the table.

## 5. Add to Vue Integration Utils
In the `/vue3/src/utils/integration_utils.ts` find `export const INTEGRATIONS: Array<Integration>` and in the long list add:
```typo3_typoscript
{id: 'YOURINTEGRATION', name: "Your Integration", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#yourintegration'},
```
be sure to change 'true' or 'false' value for the import and export options to the correct values for your integration. 'true' indicates that it should be listed in the menu for imports or exports respectively.

### Be sure to update vue using `yarn` after to be sure the html files get updated

---

# Integration Test Setup
## File Structure and Files
Tandoor uses Pytest to implement its testing features. To add tests and test documents navigate to 
```
cookbook/tests/other/
``` 
There you can create a test file `test_yourintegration.py`. It is very important that it starts with "test_" as that is how pytest knows to run it as a test.

For the text files that you will want to parse and test for your integration you can put them at:

```
cookbook/test/other/test_data/your_integration/
```
making your own folder for your test inputs there. When directing your tests to pull the files from that folder make sure to include the whole path starting at `cookbook/`

## Creating an Integration Test with a Request object
Like the filename, inside the file `test_yourintegration.py` pytest looks specifically for the functions that start with the string `test_` any function that does not have that prefex won't be run. This is useful if you want to define helper methods to your tests.

Since your integration is a child of the `Integration` class you must pass your integration the required arguments: `request` and `export_type`. Unless your test has a specific export_type you are trying to test, it is not consequential what you put for `export_type`, so long as it is a string. I generally just use "export" in my test. For request though we need to generate one

You can accomplish this with the following code:
```python
from io import BytesIO

from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.integration.cooklang import YourIntegrationClass

def test_yourintegration(u1_s1):
    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    
    with scope(space=space):
        integration_object = YourIntegrationClass(request, "export")
        with open("cookbook/test/other/test_data/your_integration/recipe_file.txt", "rb") as file:
            recipe_bytes = file.read()
            recipe_name = file.name
        buffer = BytesIO(recipe_bytes)
        buffer.name = recipe_name
        recipe_object = integration_object.get_recipe_from_file(buffer)
        # all of your test function logic inside this with clause 
```
though it is not important for you to understand, the u1_s1 is a pytest fixture that can be passed into your tests. By adding it as an argument for the test, pytest will fill that fixture in and you can use it to get a test user using the `auth.get_user()` method

with that you can add your assertions and test it using pytest.

---
# Integration Class Logic
Now that the setup is complete you need to implement the logic on the new Integration class you created.

## get_recipe_from_file method
This function is called by the `Integration.do_import()` class method when a file is imported through the web portal. The `get_recipe_from_file(self, file)` takes only a file as an argument, which is passed from the `Integration.do_import()` as an `IOByte` binary object containing only the binary characters of the contents of the file, as well as a property called `name` that has a "utf-8" string of what the file name was.

### Reading the File
To get the string values of the contents of the file, you must call the following methods:

```python
file_text = file.getvalue().decode("utf-8")
```
Then you can parse the file_text however you see fit for your integration. no need to do a `with open()` statement. The `Integration` parent class handles the opening and the closing of the file.

If your recipe name is dependent on the filename you can access the file name with:
```python
filename = file.name
```

### Managing the Tandoor 'Recipe' Object
The `Recipe` class has many properties, and it is recommended to view all of them [here](https://github.com/TandoorRecipes/recipes/blob/develop/cookbook/models.py) in order to determine specifically how your integration will organize its data into the `Recipe` object data structure. The important ones to know are:
```python
name = models.CharField(max_length=128)
description = models.CharField(max_length=512, blank=True, null=True)
servings = models.IntegerField(default=1)
servings_text = models.CharField(default='', blank=True, max_length=32)
image = models.ImageField(upload_to='recipes/', blank=True, null=True)
keywords = models.ManyToManyField(Keyword, blank=True)
steps = models.ManyToManyField(Step, blank=True)
internal = models.BooleanField(default=False)

created_by = models.ForeignKey(User, on_delete=models.PROTECT)

space = models.ForeignKey(Space, on_delete=models.CASCADE)
```
You can define as many of these variables as you like at the time of creating the Recipe object but the bare minimum should be:

```python
from cookbook.models import Recipe

def get_recipe_from_file(self, file)-> Recipe:
    #opening the file and parsing it
    
    recipe_object = Recipe.objects.create(
        name = your_recipe_name,
        created_by = self.request.user,
        internal = True,
        space = self.request.space,
    )
    
    #translating the parsed file into th recipe object
    
    return recipe_object
```
Both `created_by` and `space` require the request object from the webpage or API that initiated the request, the `Integration` parent class handles both of those and they can be retrieved through the `self.request` property. The `name` allows the recipe to be identifiable from the other recipes, making it uniquely identifiable from other newly instantiated `Recipe` objects. lasty `True` is the default value for `internal` only change it to false if that is what you intend.

After the `Recipe` object is created you can change or add data to its properties, these changes will show up in tests and work as expected until the program drops it from memory. Then all those changes will be lost unless you use the `.save()` method. It is recommended not to use the `.save()` after every change, but instead to make all your changes and call `.save()` once at the end of the `get_recipe_from_file` method before the object gets returned back to the `Integration.do_import()` method.

```python
from cookbook.models import Recipe

def get_recipe_from_file(self, file)-> Recipe:
    #opening the file and parsing it
    
    recipe_object = Recipe.objects.create(
        name = your_recipe_name,
        created_by = self.request.user,
        internal = True,
        space = self.request.space,
    )
    
    # Integration logic, making many changes to the recipe_object
    
    recipe_object.description = "A yummy treat for any day!"
    recipe_object.save()
    return recipe_object
```

### Other Models You Need To Know
The 3 main models other than `Recipe` you will need to use are the `Step`, `Ingredient`(also `Food` and `Unit`- They all go hand in hand), and `Keyword`. The rough structure of these object in a `Recipe` are:

(Note that the `Recipe` object is not a `Json` object, the below is just a representation of the data)
```json
{Recipe: 
    [{"steps": 
        [{Step: [
            {"ingredients": [
                {Ingredient: 
                  {"food": 
                    {Food:
                      [{"name": "food name"},
                        {Unit: {"name": "unit name"}},
                        {"amount": int}
                    ]}}}]},
            {"instruction": "recipe step text"}
        ]}]},
    {"keywords": [
        {Keyword: 
          {"name": "keyword name"}
        }]}]}
```
Below are their bare-bones implementations in regard to creating a `Recipe` object integration.

```python
from cookbook.models import Recipe, Keyword, Step, Ingredient, Food, Unit

def get_recipe_from_file(self, file)-> Recipe:
    #opening the file and parsing it
    
    recipe_object = Recipe.objects.create(
        name = your_recipe_name,
        created_by = self.request.user,
        internal = True,
        space = self.request.space,)
    
    #logic for creating a list of keywords

    for keyword in parsed_file.keywords:
        recipe_object.keywords.add(
            Keyword.objects.get_or_create(
                space=self.request.space, 
                name=keyword)[0])
    
    i = 0
    for line in parsed_file:
        #logic for creating a list of ingredients
        #logic for instructions
        step = Step.objects.create(
            instruction=line.instruction_string, 
            order=i, 
            space=self.request.space, 
            show_ingredients_table=self.request.user.userpreference.show_step_ingredients)
        for ingredient in line.ingredients:
            step.ingredients.add(
                Ingredient.objects.create(
                    food=Food.objects.get_or_create(name=ingredient.name, space=self.request.space)[0],
                    unit=Unit.objects.get_or_create(name=ingredient.quantity.unit, space=self.request.space)[0],
                    amount=ingredient.quantity.amount,
                    space=self.request.space, ))
        recipe_object.steps.add(step)
        i+=1
    recipe_object.save()
    return recipe_object
```

## import_file_name_filter method
Documentation to come.

## get_file_from_recipe method
Documentation to come.

## get_files_from_recipes method
Documentation to come.
