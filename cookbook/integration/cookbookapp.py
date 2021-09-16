import base64
import gzip
import json
import re
from io import BytesIO

import yaml

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Ingredient, Keyword
from gettext import gettext as _


class CookBookApp(Integration):

    def import_file_name_filter(self, zip_info_object):
        return zip_info_object.filename.endswith('.yml')

    def get_recipe_from_file(self, file):
        recipe_yml = yaml.safe_load(file.getvalue().decode("utf-8"))

        recipe = Recipe.objects.create(
            name=recipe_yml['name'].strip(),
            created_by=self.request.user, internal=True,
            space=self.request.space)

        try:
            recipe.servings = re.findall('([0-9])+', recipe_yml['recipeYield'])[0]
        except Exception as e:
            pass

        try:
            recipe.working_time = recipe_yml['prep_time'].replace(' minutes', '')
            recipe.waiting_time = recipe_yml['cook_time'].replace(' minutes', '')
        except Exception:
            pass

        if recipe_yml['on_favorites']:
            recipe.keywords.add(Keyword.objects.get_or_create(name=_('Favorites'), space=self.request.space))

        step = Step.objects.create(instruction=recipe_yml['directions'], space=self.request.space, )

        if 'notes' in recipe_yml and recipe_yml['notes'].strip() != '':
            step.instruction = step.instruction + '\n\n' + recipe_yml['notes']

        if 'nutritional_info' in recipe_yml:
            step.instruction = step.instruction + '\n\n' + recipe_yml['nutritional_info']

        if 'source' in recipe_yml and recipe_yml['source'].strip() != '':
            step.instruction = step.instruction + '\n\n' + recipe_yml['source']

        step.save()
        recipe.steps.add(step)

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in recipe_yml['ingredients'].split('\n'):
            if ingredient.strip() != '':
                amount, unit, ingredient, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(ingredient)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, space=self.request.space,
                ))

        recipe.save()
        return recipe
