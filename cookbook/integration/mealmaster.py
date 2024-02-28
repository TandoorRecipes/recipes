import re

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class MealMaster(Integration):

    def get_recipe_from_file(self, file):
        servings = 1
        ingredients = []
        directions = []
        for line in file.replace('\r', '').split('\n'):
            if not line.startswith('MMMMM') and line.strip != '':
                if 'Title:' in line:
                    title = line.replace('Title:', '').strip()
                else:
                    if 'Categories:' in line:
                        tags = line.replace('Categories:', '').strip()
                    else:
                        if 'Yield:' in line:
                            servings_text = line.replace('Yield:', '').strip()
                        else:
                            if re.match(r'\s{2,}([0-9])+', line):
                                ingredients.append(line.strip())
                            else:
                                directions.append(line.strip())

        try:
            servings = re.findall('([0-9])+', servings_text)[0]
        except Exception as e:
            print('failed parsing servings ', e)

        recipe = Recipe.objects.create(name=title, servings=servings, created_by=self.request.user, internal=True, space=self.request.space)

        for k in tags.split(','):
            keyword, created = Keyword.objects.get_or_create(name=k.strip(), space=self.request.space)
            recipe.keywords.add(keyword)

        step = Step.objects.create(
            instruction='\n'.join(directions) + '\n\n', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
        )

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in ingredients:
            if len(ingredient.strip()) > 0:
                amount, unit, food, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(ingredient)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                ))
        recipe.steps.add(step)

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def split_recipe_file(self, file):
        recipe_list = []
        current_recipe = ''

        for fl in file.readlines():
            line = fl.decode("windows-1250")
            if (line.startswith('MMMMM') or line.startswith('-----')) and 'meal-master' in line.lower():
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
