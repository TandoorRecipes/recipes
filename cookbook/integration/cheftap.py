import re

from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient


class ChefTap(Integration):

    def import_file_name_filter(self, zip_info_object):
        print("testing", zip_info_object.filename)
        return re.match(r'^cheftap_export/([A-Za-z\d\w\s-])+.txt$', zip_info_object.filename)

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

        step = Step.objects.create(instruction='\n'.join(directions))

        if source_url != '':
            step.instruction += '\n' + source_url
            step.save()

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
