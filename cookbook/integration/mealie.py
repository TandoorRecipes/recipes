import json
import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class Mealie(Integration):

    def import_file_name_filter(self, zip_info_object):
        return re.match(r'^recipes/([A-Za-z\d\s\-_()\[\]\u00C0-\u017F])+/([A-Za-z\d\s\-_()\[\]\u00C0-\u017F])+.json$', zip_info_object.filename)

    def get_recipe_from_file(self, file):
        recipe_json = json.loads(file.getvalue().decode("utf-8"))

        description = '' if len(recipe_json['description'].strip()) > 500 else recipe_json['description'].strip()

        recipe = Recipe.objects.create(
            name=recipe_json['name'].strip(), description=description,
            created_by=self.request.user, internal=True, space=self.request.space)

        for s in recipe_json['recipe_instructions']:
            step = Step.objects.create(instruction=s['text'], space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients, )
            recipe.steps.add(step)

        step = recipe.steps.first()
        if not step:  # if there is no step in the exported data
            step = Step.objects.create(instruction='', space=self.request.space, )
            recipe.steps.add(step)

        if len(recipe_json['description'].strip()) > 500:
            step.instruction = recipe_json['description'].strip() + '\n\n' + step.instruction

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in recipe_json['recipe_ingredient']:
            try:
                if ingredient['food']:
                    f = ingredient_parser.get_food(ingredient['food'])
                    u = ingredient_parser.get_unit(ingredient['unit'])
                    amount = ingredient['quantity']
                    note = ingredient['note']
                    original_text = None
                else:
                    amount, unit, food, note = ingredient_parser.parse(ingredient['note'])
                    f = ingredient_parser.get_food(food)
                    u = ingredient_parser.get_unit(unit)
                    original_text = ingredient['note']
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=original_text, space=self.request.space,
                ))
            except Exception:
                pass

        if 'tags' in recipe_json and len(recipe_json['tags']) > 0:
            for k in recipe_json['tags']:
                if 'name' in k:
                    keyword, created = Keyword.objects.get_or_create(name=k['name'].strip(), space=self.request.space)
                    recipe.keywords.add(keyword)

        if 'notes' in recipe_json and len(recipe_json['notes']) > 0:
            notes_text = "#### Notes  \n\n"
            for n in recipe_json['notes']:
                notes_text += f'{n["text"]}  \n'

            step = Step.objects.create(
                instruction=notes_text, space=self.request.space,
            )
            recipe.steps.add(step)

        if 'recipe_yield' in recipe_json and recipe_json['recipe_yield'] is not None:
            recipe.servings = parse_servings(recipe_json['recipe_yield'])
            recipe.servings_text = parse_servings_text(recipe_json['recipe_yield'])

        if 'total_time' in recipe_json and recipe_json['total_time'] is not None:
            recipe.working_time = parse_time(recipe_json['total_time'])

        if 'org_url' in recipe_json and recipe_json['org_url'] is not None:
            recipe.source_url = recipe_json['org_url']

        recipe.save()

        for f in self.files:
            if '.zip' in f['name']:
                import_zip = ZipFile(f['file'])
                try:
                    self.import_recipe_image(recipe, BytesIO(import_zip.read(f'recipes/{recipe_json["slug"]}/images/min-original.webp')),
                                             filetype=get_filetype(f'recipes/{recipe_json["slug"]}/images/original'))
                except Exception:
                    pass

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
