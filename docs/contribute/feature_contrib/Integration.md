# Import / Export Integration Contribution Guide

## Setup
There are 5 files you need to configure in order create a new integration
1. Create a new integration class in `/cookbook/integration/`
2. Include integration in `/cookbook/forms.py` 
3. Add the new integration class import and include in the 'if' chain in `/cookbook/views/import_export.py`
4. Add your integration to the documentation at `/docs/features/import_export.md`
5. Include integration and docs link in `/vue3/src/utils/integration_utils.ts`


### 1. Creating a New Integration Class
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
    
    def import_file_name_filter(self, file) -> bool:
        #check file extension, return True if extension is correct
        pass
    
    def get_recipe_from_file(self, file) -> Recipe:
        #Import Recipe Logic - convert information from file into Recipe() object
        pass
    
    def get_file_from_recipe(self, recipe) -> tuple[str,str]:
        #Export Recipe Logic - convert from Recipe() object to a writable string in your integration's format
        # return 'Filename.extension', 'file string'
        pass
        
    def get_files_from_recipes(self, recipes, el, cookie) -> str:
        
        for recipe in recipes:
            If True: #add any verification logic
                #convert recipe to File string
            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(recipe)
            el.save()
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

### 2. including in Forms.py
In the `/cookbook/forms.py` find the `ImportExportBase` class and add to it the following amoung the others:
```python
YOURINTEGRATION = "YOURINTEGRATION"
```
Then you will find under that the following declaration:

`
type = forms.ChoiceField(choices=())
`
the choices will have a long list of tuples. add to the list of tuples the following:

```python
(YOURINTEGRATION, 'Your Integration'),
```

### 3. Including in Views
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

### 4. Add to the Documentation
If nothing else you at least have to add one slugline about your integration in the `/docs/features/import_export.md` because the Vue pages require a link to send the send the user to if they hit the information button on the import/export form.

Go to the bottom of the doc and add:
```markdown
## YourIntegration
a little blurb about how it works or anything users should know about how the data needs to be formated.
```

Additionally add your integration to the table at the top of the document, or wait until it is integrated and tested before adding to the table.

### 5. Add to Vue Integration Utils
In the `/vue3/src/utils/integration_utils.ts` find `export const INTEGRATIONS: Array<Integration>` and in the long list add:
```typo3_typoscript
{id: 'YOURINTEGRATION', name: "Your Integration", import: true, export: false, helpUrl: 'https://docs.tandoor.dev/features/import_export/#yourintegration'},
```

## Integration Class Logic
Now that the setup is complete you need to implement the logic on the new Integration class you created.