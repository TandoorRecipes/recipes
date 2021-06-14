import base64
import json
from io import BytesIO

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Ingredient


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
            instruction=file['directions']
        )

        if file['source'] != '':
            step.instruction += '\n' + file['source']

        for ingredient in file['ingredients'].split('\n'):
            if len(ingredient.strip()) > 0:
                amount, unit, ingredient, note = parse(ingredient)
                f = get_food(ingredient, self.request.space)
                u = get_unit(unit, self.request.space)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note
                ))
        recipe.steps.add(step)

        if file['image'] != '':
            self.import_recipe_image(recipe, BytesIO(base64.b64decode(file['image'].replace('data:image/jpeg;base64,', ''))), filetype='.jpeg')

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def split_recipe_file(self, file):
        return json.loads(file.read().decode("utf-8"))
