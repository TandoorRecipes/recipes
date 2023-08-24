import re

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class ChefTap(Integration):

    def import_file_name_filter(self, zip_info_object):
        print("testing", zip_info_object.filename)
        return re.match(r'^cheftap_export/([A-Za-z\d\s\-_()\[\]\u00C0-\u017F])+.txt$', zip_info_object.filename) or re.match(r'^([A-Za-z\d\s\-_()\[\]\u00C0-\u017F])+.txt$', zip_info_object.filename)

    def get_recipe_from_file(self, file):
        source_url = ''

        ingredient_mode = 0

        ingredients = []
        directions = []
        for i, fl in enumerate(file.readlines(), start=0):
            line = fl.decode("utf-8")
            if i == 0:
                title = line.strip()
            else:
                if line.startswith('https:') or line.startswith('http:'):
                    source_url = line.strip()
                else:
                    if ingredient_mode == 1 and len(line.strip()) == 0:
                        ingredient_mode = 2
                    if re.match(r'^([0-9])[^.](.)*$', line) and ingredient_mode < 2:
                        ingredient_mode = 1
                        ingredients.append(line.strip())
                    else:
                        directions.append(line.strip())

        recipe = Recipe.objects.create(name=title, created_by=self.request.user, internal=True, space=self.request.space, )

        step = Step.objects.create(instruction='\n'.join(directions), space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,)

        if source_url != '':
            step.instruction += '\n' + source_url
            step.save()

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

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
