import imghdr
import json
import re
from io import BytesIO
from zipfile import ZipFile

import requests

from django.utils.translation import gettext as _

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class RecetteTek(Integration):

    def import_file_name_filter(self, zip_info_object):
        print("testing", zip_info_object.filename)
        return re.match(r'^recipes_0.json$', zip_info_object.filename) or re.match(r'^recipes.json$', zip_info_object.filename)

    def split_recipe_file(self, file):

        recipe_json = json.loads(file)

        recipe_list = [r for r in recipe_json]

        return recipe_list

    def get_recipe_from_file(self, file):

        # Create initial recipe with just a title and a description
        recipe = Recipe.objects.create(name=file['title'], created_by=self.request.user, internal=True, space=self.request.space, )

        # set the description as an empty string for later use for the source URL, in case there is no description text.
        recipe.description = ''

        try:
            if file['description'] != '':
                recipe.description = file['description'].strip()
        except Exception as e:
            print(recipe.name, ': failed to parse recipe description ', str(e))

        instructions = file['instructions']
        if not instructions:
            instructions = ''

        step = Step.objects.create(instruction=instructions, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,)

        # Append the original import url to the step (if it exists)
        try:
            if file['url'] != '':
                step.instruction += '\n\n' + _('Imported from') + ': ' + file['url']
                step.save()
        except Exception as e:
            print(recipe.name, ': failed to import source url ', str(e))

        try:
            # Process the ingredients. Assumes 1 ingredient per line.
            ingredient_parser = IngredientParser(self.request, True)
            for ingredient in file['ingredients'].split('\n'):
                if len(ingredient.strip()) > 0:
                    amount, unit, food, note = ingredient_parser.parse(ingredient.strip())
                    f = ingredient_parser.get_food(ingredient)
                    u = ingredient_parser.get_unit(unit)
                    step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                    ))
        except Exception as e:
            print(recipe.name, ': failed to parse recipe ingredients ', str(e))
        recipe.steps.add(step)

        # Attempt to import prep/cooking times
        # quick hack, this assumes only one number in the quantity field.
        try:
            if file['quantity'] != '':
                for item in file['quantity'].split(' '):
                    if item.isdigit():
                        recipe.servings = int(item)
                        break
        except Exception as e:
            print(recipe.name, ': failed to parse quantity ', str(e))

        try:
            if file['totalTime'] != '':
                recipe.waiting_time = int(file['totalTime'])
        except Exception as e:
            print(recipe.name, ': failed to parse total times ', str(e))

        try:
            if file['preparationTime'] != '':
                recipe.working_time = int(file['preparationTime'])
        except Exception as e:
            print(recipe.name, ': failed to parse prep time ', str(e))

        try:
            if file['cookingTime'] != '':
                recipe.waiting_time = int(file['cookingTime'])
        except Exception as e:
            print(recipe.name, ': failed to parse cooking time ', str(e))

        recipe.save()

        # Import the recipe keywords
        try:
            if file['keywords'] != '':
                for keyword in file['keywords'].split(';'):
                    k, created = Keyword.objects.get_or_create(name=keyword.strip(), space=self.request.space)
                    recipe.keywords.add(k)
            recipe.save()
        except Exception as e:
            print(recipe.name, ': failed to parse keywords ', str(e))

        # TODO: Parse Nutritional Information

        # Import the original image from the zip file, if we cannot do that, attempt to download it again.
        try:
            if file['pictures'][0] != '':
                image_file_name = file['pictures'][0].split('/')[-1]
                for f in self.files:
                    if '.rtk' in f['name']:
                        import_zip = ZipFile(f['file'])
                        self.import_recipe_image(recipe, BytesIO(import_zip.read(image_file_name)), filetype=get_filetype(image_file_name))
            else:
                if file['originalPicture'] != '':
                    url = file['originalPicture']
                    if validate_import_url(url):
                        response = requests.get(url)
                        if imghdr.what(BytesIO(response.content)) is not None:
                            self.import_recipe_image(recipe, BytesIO(response.content), filetype=get_filetype(file['originalPicture']))
                        else:
                            raise Exception("Original image failed to download.")
        except Exception as e:
            print(recipe.name, ': failed to import image ', str(e))

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
