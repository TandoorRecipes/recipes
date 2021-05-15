import json
import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient, Keyword


class RezKonv(Integration):

    def get_recipe_from_file(self, file):

        ingredient_mode = False
        direction_mode = False

        ingredients = []
        directions = []
        for line in file.replace('\r', '').split('\n'):
            if 'Titel:' in line:
                title = line.replace('Titel:', '').strip()
            if 'Kategorien:' in line:
                tags = line.replace('Kategorien:', '').strip()
            if ingredient_mode and ('quelle' in line.lower() or 'source' in line.lower()):
                ingredient_mode = False
            if ingredient_mode:
                if line != '' and '===' not in line and 'Zubereitung' not in line:
                    ingredients.append(line.strip())
            if direction_mode:
                if line.strip() != '' and line.strip() != '=====':
                    directions.append(line.strip())
            if 'Zutaten:' in line:
                ingredient_mode = True
            if 'Zubereitung:' in line:
                ingredient_mode = False
                direction_mode = True

        recipe = Recipe.objects.create(name=title, created_by=self.request.user, internal=True, space=self.request.space)

        for k in tags.split(','):
            keyword, created = Keyword.objects.get_or_create(name=k.strip(), space=self.request.space)
            recipe.keywords.add(keyword)

        step = Step.objects.create(
            instruction='\n'.join(directions) + '\n\n'
        )

        for ingredient in ingredients:
            if len(ingredient.strip()) > 0:
                amount, unit, ingredient, note = parse(ingredient)
                f = get_food(ingredient, self.request.space)
                u = get_unit(unit, self.request.space)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note
                ))
        recipe.steps.add(step)

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def split_recipe_file(self, file):
        recipe_list = []
        current_recipe = ''

        for fl in file.readlines():
            line = fl.decode("ANSI")
            if line.startswith('=====') and 'rezkonv' in line.lower():
                if current_recipe != '':
                    recipe_list.append(current_recipe)
                    current_recipe = ''
                else:
                    current_recipe = ''
            else:
                current_recipe += line + '\n'

        if current_recipe != '':
            recipe_list.append(current_recipe)

        return recipe_list
