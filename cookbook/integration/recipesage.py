import json
from io import BytesIO

import requests

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Ingredient


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

        ingredients_added = False
        for s in file['recipeInstructions']:
            step = Step.objects.create(
                instruction=s['text'], space=self.request.space,
            )
            if not ingredients_added:
                ingredients_added = True

                for ingredient in file['recipeIngredient']:
                    amount, unit, ingredient, note = parse(ingredient)
                    f = get_food(ingredient, self.request.space)
                    u = get_unit(unit, self.request.space)
                    step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=amount, note=note, space=self.request.space,
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
            if s.type != Step.TIME:
                data['recipeInstructions'].append({
                    '@type': 'HowToStep',
                    'text': s.instruction
                })

                for i in s.ingredients.all():
                    data['recipeIngredient'].append(f'{float(i.amount)} {i.unit} {i.food}')

        return data

    def split_recipe_file(self, file):
        return json.loads(file.read().decode("utf-8"))
