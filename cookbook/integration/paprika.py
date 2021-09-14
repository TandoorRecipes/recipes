import base64
import gzip
import json
import re
from io import BytesIO

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Ingredient, Keyword
from gettext import gettext as _


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
                if re.match(r'([0-9])+\s(.)*', recipe_json['servings']):
                    s = recipe_json['servings'].split(' ')
                    recipe.servings = s[0]
                    recipe.servings_text = s[1]

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
                instruction=instructions, space=self.request.space,
            )

            if 'description' in recipe_json and len(recipe_json['description'].strip()) > 500:
                step.instruction = recipe_json['description'].strip() + '\n\n' + step.instruction

            if 'categories' in recipe_json:
                for c in recipe_json['categories']:
                    keyword, created = Keyword.objects.get_or_create(name=c.strip(), space=self.request.space)
                    recipe.keywords.add(keyword)

            try:
                for ingredient in recipe_json['ingredients'].split('\n'):
                    if len(ingredient.strip()) > 0:
                        amount, unit, ingredient, note = parse(ingredient)
                        f = get_food(ingredient, self.request.space)
                        u = get_unit(unit, self.request.space)
                        step.ingredients.add(Ingredient.objects.create(
                            food=f, unit=u, amount=amount, note=note, space=self.request.space,
                        ))
            except AttributeError:
                pass

            recipe.steps.add(step)

            if recipe_json.get("photo_data", None):
                self.import_recipe_image(recipe, BytesIO(base64.b64decode(recipe_json['photo_data'])), filetype='.jpeg')

            return recipe
