from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient


class Safron(Integration):

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False

        ingredients = []
        directions = []
        for fl in file.readlines():
            line = fl.decode("utf-8")
            if 'Title:' in line:
                title = line.replace('Title:', '').strip()
            if 'Description:' in line:
                description = line.replace('Description:', '').strip()
            if 'Yield:' in line:
                directions.append(_('Servings') + ' ' + line.replace('Yield:', '').strip() + '\n')
            if 'Cook:' in line:
                directions.append(_('Waiting time') + ' ' + line.replace('Cook:', '').strip() + '\n')
            if 'Prep:' in line:
                directions.append(_('Preparation Time') + ' ' + line.replace('Prep:', '').strip() + '\n')
            if 'Cookbook:' in line:
                directions.append(_('Cookbook') + ' ' + line.replace('Cookbook:', '').strip() + '\n')
            if 'Section:' in line:
                directions.append(_('Section') + ' ' + line.replace('Section:', '').strip() + '\n')
            if ingredient_mode:
                if len(line) > 2 and 'Instructions:' not in line:
                    ingredients.append(line.strip())
            if direction_mode:
                if len(line) > 2:
                    directions.append(line.strip())
            if 'Ingredients:' in line:
                ingredient_mode = True
            if 'Instructions:' in line:
                ingredient_mode = False
                direction_mode = True

        recipe = Recipe.objects.create(name=title, description=description, created_by=self.request.user, internal=True, space=self.request.space, )

        step = Step.objects.create(instruction='\n'.join(directions), space=self.request.space,)

        for ingredient in ingredients:
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
