import json
import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient, Keyword


class Pepperplate(Integration):

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False

        ingredients = []
        directions = []
        for fl in file.readlines():
            line = fl.decode("utf-8")
            if 'Title:' in line:
                title = line.replace('Title:', '').replace('"', '').strip()
            if 'Description:' in line:
                description = line.replace('Description:', '').strip()
            if 'Original URL:' in line or 'Source:' in line or 'Yield:' in line or 'Total:' in line:
                if len(line.strip().split(':')[1]) > 0:
                    directions.append(line.strip() + '\n')
            if ingredient_mode:
                if len(line) > 2 and 'Instructions:' not in line:
                    ingredients.append(line.strip())
            if direction_mode:
                if len(line) > 2:
                    directions.append(line.strip() + '\n')
            if 'Ingredients:' in line:
                ingredient_mode = True
            if 'Instructions:' in line:
                ingredient_mode = False
                direction_mode = True

        recipe = Recipe.objects.create(name=title, description=description, created_by=self.request.user, internal=True, space=self.request.space)

        step = Step.objects.create(
            instruction='\n'.join(directions) + '\n\n', space=self.request.space,
        )

        for ingredient in ingredients:
            if len(ingredient.strip()) > 0:
                amount, unit, ingredient, note = parse(ingredient)
                f = get_food(ingredient, self.request.space)
                u = get_unit(unit, self.request.space)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, space=self.request.space,
                ))
        recipe.steps.add(step)

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
