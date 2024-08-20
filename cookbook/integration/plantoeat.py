from io import BytesIO

import requests

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
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
        fields = {}
        for line in file.replace('\r', '').split('\n'):
            if line.strip() != '':
                if 'Title:' in line:
                    fields['name'] = line.replace('Title:', '').replace('"', '').strip()
                if 'Description:' in line:
                    fields['description'] = line.replace('Description:', '').strip()
                if 'Serves:' in line:
                    fields['servings'] = parse_servings(line.replace('Serves:', '').strip())
                if 'Source:' in line:
                    fields['source_url'] = line.replace('Source:', '').strip()
                if 'Photo Url:' in line:
                    image_url = line.replace('Photo Url:', '').strip()
                if 'Prep Time:' in line:
                    fields['working_time'] = parse_time(line.replace('Prep Time:', '').strip())
                if 'Cook Time:' in line:
                    fields['waiting_time'] = parse_time(line.replace('Cook Time:', '').strip())
                if 'Tags:' in line:
                    tags = line.replace('Tags:', '').strip()
                if 'Ingredients:' in line:
                    ingredient_mode = True
                if 'Directions:' in line:
                    ingredient_mode = False
                    direction_mode = True
                if ingredient_mode:
                    if len(line) > 2 and 'Ingredients:' not in line:
                        ingredients.append(line.strip())
                if direction_mode:
                    if len(line) > 2:
                        directions.append(line.strip() + '\n')                

        recipe = Recipe.objects.create(**fields, created_by=self.request.user, internal=True, space=self.request.space)

        step = Step.objects.create(
            instruction='\n'.join(directions) + '\n\n', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
        )

        if tags:
            tags = tags.replace('^',',')
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
                if validate_import_url(image_url):
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
