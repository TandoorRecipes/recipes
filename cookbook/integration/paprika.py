import base64
import gzip
import json
import re
from gettext import gettext as _
from io import BytesIO

import requests

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class Paprika(Integration):

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def get_recipe_from_file(self, file):
        with gzip.open(file, 'r') as recipe_zip:
            recipe_json = json.loads(recipe_zip.read().decode("utf-8"))

            recipe = Recipe.objects.create(
                name=recipe_json['name'].strip(), created_by=self.request.user, internal=True, space=self.request.space)

            if 'description' in recipe_json:
                recipe.description = '' if len(recipe_json['description'].strip()) > 500 else recipe_json['description'].strip()

            try:
                if 'servings' in recipe_json:
                    recipe.servings = parse_servings(recipe_json['servings'])
                    recipe.servings_text = parse_servings_text(recipe_json['servings'])

                if len(recipe_json['cook_time'].strip()) > 0:
                    recipe.waiting_time = re.findall(r'\d+', recipe_json['cook_time'])[0]

                if len(recipe_json['prep_time'].strip()) > 0:
                    recipe.working_time = re.findall(r'\d+', recipe_json['prep_time'])[0]
            except Exception:
                pass

            recipe.save()

            instructions = recipe_json['directions']
            if recipe_json['notes'] and len(recipe_json['notes'].strip()) > 0:
                instructions += '\n\n### ' + _('Notes') + ' \n' + recipe_json['notes']

            if recipe_json['nutritional_info'] and len(recipe_json['nutritional_info'].strip()) > 0:
                instructions += '\n\n### ' + _('Nutritional Information') + ' \n' + recipe_json['nutritional_info']

            try:
                if len(recipe_json['source'].strip()) > 0 or len(recipe_json['source_url'].strip()) > 0:
                    instructions += '\n\n### ' + _('Source') + ' \n' + recipe_json['source'].strip() + ' \n' + recipe_json['source_url'].strip()
            except AttributeError:
                pass

            step = Step.objects.create(
                instruction=instructions, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
            )

            if 'description' in recipe_json and len(recipe_json['description'].strip()) > 500:
                step.instruction = recipe_json['description'].strip() + '\n\n' + step.instruction

            if 'categories' in recipe_json:
                for c in recipe_json['categories']:
                    keyword, created = Keyword.objects.get_or_create(name=c.strip(), space=self.request.space)
                    recipe.keywords.add(keyword)

            ingredient_parser = IngredientParser(self.request, True)
            try:
                for ingredient in recipe_json['ingredients'].split('\n'):
                    if len(ingredient.strip()) > 0:
                        amount, unit, food, note = ingredient_parser.parse(ingredient)
                        f = ingredient_parser.get_food(food)
                        u = ingredient_parser.get_unit(unit)
                        step.ingredients.add(Ingredient.objects.create(
                            food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                        ))
            except AttributeError:
                pass

            recipe.steps.add(step)

            # Paprika exports can have images in either of image_url, or photo_data.
            # If a user takes an image himself, only photo_data will be set.
            # If a user imports an image, both will be set. But the photo_data will be a center-cropped square resized version, so the image_url is preferred.
            
            # Try to download image if possible
            try:
                if recipe_json.get("image_url", None):
                    url = recipe_json.get("image_url", None)
                    if validate_import_url(url):
                        response = requests.get(url)
                        if response.status_code == 200 and len(response.content) > 0:
                            self.import_recipe_image(recipe, BytesIO(response.content))
            except Exception:
                pass

            # If no image downloaded, try to extract from photo_data
            if not recipe.image:
                if recipe_json.get("photo_data", None):
                    self.import_recipe_image(recipe, BytesIO(base64.b64decode(recipe_json['photo_data'])), filetype='.jpeg')

            return recipe
