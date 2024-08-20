import json
from io import BytesIO

import requests

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class RecipeSage(Integration):

    def get_recipe_from_file(self, file):

        recipe = Recipe.objects.create(
            name=file['name'].strip(),
            created_by=self.request.user, internal=True,
            space=self.request.space)

        if file['recipeYield'] != '':
            recipe.servings = parse_servings(file['recipeYield'])
            recipe.servings_text = parse_servings_text(file['recipeYield'])

        try:
            if 'totalTime' in file and file['totalTime'] != '':
                recipe.working_time = parse_time(file['totalTime'])

            if 'timePrep' in file and file['prepTime'] != '':
                recipe.working_time = parse_time(file['timePrep'])
                recipe.waiting_time = parse_time(file['totalTime']) - parse_time(file['timePrep'])
        except Exception as e:
            print('failed to parse time ', str(e))

        recipe.save()

        ingredient_parser = IngredientParser(self.request, True)
        ingredients_added = False
        for s in file['recipeInstructions']:
            step = Step.objects.create(
                instruction=s['text'], space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
            )
            if not ingredients_added:
                ingredients_added = True

                for ingredient in file['recipeIngredient']:
                    amount, unit, food, note = ingredient_parser.parse(ingredient)
                    f = ingredient_parser.get_food(food)
                    u = ingredient_parser.get_unit(unit)
                    step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                    ))
            recipe.steps.add(step)

        if len(file['image']) > 0:
            try:
                url = file['image'][0]
                if validate_import_url(url):
                    response = requests.get(url)
                    self.import_recipe_image(recipe, BytesIO(response.content))
            except Exception as e:
                print('failed to import image ', str(e))

        return recipe

    def get_file_from_recipe(self, recipe):
        data = {
            '@context': 'http://schema.org',
            '@type': 'Recipe',
            'creditText': '',
            'isBasedOn': '',
            'name': recipe.name,
            'description': recipe.description,
            'prepTime': str(recipe.working_time),
            'totalTime': str(recipe.waiting_time + recipe.working_time),
            'recipeYield': str(recipe.servings),
            'image': [],
            'recipeCategory': [],
            'comment': [],
            'recipeIngredient': [],
            'recipeInstructions': [],
        }

        for s in recipe.steps.all():
            data['recipeInstructions'].append({
                '@type': 'HowToStep',
                'text': s.instruction
            })

            for i in s.ingredients.all():
                data['recipeIngredient'].append(f'{float(i.amount)} {i.unit} {i.food}')

        return data

    def get_files_from_recipes(self, recipes, el, cookie):
        json_list = []
        for r in recipes:
            json_list.append(self.get_file_from_recipe(r))

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(r)
            el.save()

        return [[self.get_export_file_name('json'), json.dumps(json_list)]]

    def split_recipe_file(self, file):
        return json.loads(file.read().decode("utf-8"))
