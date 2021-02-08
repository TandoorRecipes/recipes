import json

import microdata

from cookbook.helper.recipe_url_import import find_recipe_json
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Ingredient, Unit


class Paprika(Integration):

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def get_recipe_from_file(self, file):
        html_text = file.getvalue().decode("utf-8")

        items = microdata.get_items(html_text)
        for i in items:
            md_json = json.loads(i.json())
            if 'schema.org/Recipe' in str(md_json['type']):
                recipe_json = find_recipe_json(md_json['properties'], '')
                recipe = Recipe.objects.create(name=recipe_json['name'].strip(), created_by=self.request.user, internal=True)
                step = Step.objects.create(
                    instruction=recipe_json['recipeInstructions']
                )

                for ingredient in recipe_json['recipeIngredient']:
                    f, created = Food.objects.get_or_create(name=ingredient['ingredient']['text'])
                    u, created = Unit.objects.get_or_create(name=ingredient['unit']['text'])
                    step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=ingredient['amount'], note=ingredient['note']
                    ))

                recipe.steps.add(step)
                return recipe
