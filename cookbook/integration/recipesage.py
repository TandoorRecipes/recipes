import json
from io import BytesIO

import requests

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class RecipeSage(Integration):

    def get_recipe_from_file(self, file):

        recipe = Recipe.objects.create(
            name=file['name'].strip(),
            created_by=self.request.user, internal=True,
            space=self.request.space)

        try:
            if file['recipeYield'] != '':
                recipe.servings = int(file['recipeYield'])

            if file['totalTime'] != '':
                recipe.waiting_time = int(file['totalTime']) - int(file['timePrep'])

            if file['prepTime'] != '':
                recipe.working_time = int(file['timePrep'])

            recipe.save()
        except Exception as e:
            print('failed to parse yield or time ', str(e))

        ingredient_parser = IngredientParser(self.request, True)
        ingredients_added = False
        for s in file['recipeInstructions']:
            step = Step.objects.create(
                instruction=s['text'], space=self.request.space,
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
                response = requests.get(file['image'][0])
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
