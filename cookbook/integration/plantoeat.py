from io import BytesIO

import requests

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class Plantoeat(Integration):

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False

        image_url = None
        tags = None
        ingredients = []
        directions = []
        description = ''
        for line in file.replace('\r', '').split('\n'):
            if line.strip() != '':
                if 'Title:' in line:
                    title = line.replace('Title:', '').replace('"', '').strip()
                if 'Description:' in line:
                    description = line.replace('Description:', '').strip()
                if 'Source:' in line or 'Serves:' in line or 'Prep Time:' in line or 'Cook Time:' in line:
                    directions.append(line.strip() + '\n')
                if 'Photo Url:' in line:
                    image_url = line.replace('Photo Url:', '').strip()
                if 'Tags:' in line:
                    tags = line.replace('Tags:', '').strip()
                if ingredient_mode:
                    if len(line) > 2 and 'Instructions:' not in line:
                        ingredients.append(line.strip())
                if direction_mode:
                    if len(line) > 2:
                        directions.append(line.strip() + '\n')
                if 'Ingredients:' in line:
                    ingredient_mode = True
                if 'Directions:' in line:
                    ingredient_mode = False
                    direction_mode = True

        recipe = Recipe.objects.create(name=title, description=description, created_by=self.request.user, internal=True, space=self.request.space)

        step = Step.objects.create(
            instruction='\n'.join(directions) + '\n\n', space=self.request.space,
        )

        if tags:
            for k in tags.split(','):
                keyword, created = Keyword.objects.get_or_create(name=k.strip(), space=self.request.space)
                recipe.keywords.add(keyword)

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in ingredients:
            if len(ingredient.strip()) > 0:
                amount, unit, food, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(food)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                ))
        recipe.steps.add(step)

        if image_url:
            try:
                response = requests.get(image_url)
                self.import_recipe_image(recipe, BytesIO(response.content))
            except Exception as e:
                print('failed to import image ', str(e))

        return recipe

    def split_recipe_file(self, file):
        recipe_list = []
        current_recipe = ''

        for fl in file.readlines():
            try:
                line = fl.decode("utf-8")
            except UnicodeDecodeError:
                line = fl.decode("windows-1250")

            if line.startswith('--------------'):
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
