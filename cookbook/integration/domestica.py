import base64
import json
from io import BytesIO

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class Domestica(Integration):

    def get_recipe_from_file(self, file):

        recipe = Recipe.objects.create(
            name=file['name'].strip(),
            created_by=self.request.user, internal=True,
            space=self.request.space)

        if file['servings'] != '':
            recipe.servings = file['servings']

        if file['timeCook'] != '':
            recipe.waiting_time = file['timeCook']

        if file['timePrep'] != '':
            recipe.working_time = file['timePrep']

        recipe.save()

        step = Step.objects.create(
            instruction=file['directions'], space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
        )

        if file['source'] != '':
            step.instruction += '\n' + file['source']

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in file['ingredients'].split('\n'):
            if len(ingredient.strip()) > 0:
                amount, unit, food, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(food)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                ))
        recipe.steps.add(step)

        if file['image'] != '':
            self.import_recipe_image(recipe, BytesIO(base64.b64decode(file['image'].replace('data:image/jpeg;base64,', ''))), filetype='.jpeg')

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def split_recipe_file(self, file):
        return json.loads(file.read().decode("utf-8"))
