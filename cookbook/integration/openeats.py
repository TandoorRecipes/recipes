import json

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Ingredient


class OpenEats(Integration):

    def get_recipe_from_file(self, file):
        recipe = Recipe.objects.create(name=file['name'].strip(), created_by=self.request.user, internal=True,
                                       servings=file['servings'], space=self.request.space, waiting_time=file['cook_time'], working_time=file['prep_time'])

        instructions = ''
        if file["info"] != '':
            instructions += file["info"]

        if file["directions"] != '':
            instructions += file["directions"]

        if file["source"] != '':
            instructions += file["source"]

        step = Step.objects.create(instruction=instructions, space=self.request.space,)

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in file['ingredients']:
            f = ingredient_parser.get_food(ingredient['food'])
            u = ingredient_parser.get_unit(ingredient['unit'])
            step.ingredients.add(Ingredient.objects.create(
                food=f, unit=u, amount=ingredient['amount'], space=self.request.space,
            ))
        recipe.steps.add(step)

        return recipe

    def split_recipe_file(self, file):
        recipe_json = json.loads(file.read())
        recipe_dict = {}
        ingredient_group_dict = {}

        for o in recipe_json:
            if o['model'] == 'recipe.recipe':
                recipe_dict[o['pk']] = {
                    'name': o['fields']['title'],
                    'info': o['fields']['info'],
                    'directions': o['fields']['directions'],
                    'source': o['fields']['source'],
                    'prep_time': o['fields']['prep_time'],
                    'cook_time': o['fields']['cook_time'],
                    'servings': o['fields']['servings'],
                    'ingredients': [],
                }
            if o['model'] == 'ingredient.ingredientgroup':
                ingredient_group_dict[o['pk']] = o['fields']['recipe']

        for o in recipe_json:
            if o['model'] == 'ingredient.ingredient':
                ingredient = {
                    'food': o['fields']['title'],
                    'unit': o['fields']['measurement'],
                    'amount': round(o['fields']['numerator'] / o['fields']['denominator'], 2),
                }
                recipe_dict[ingredient_group_dict[o['fields']['ingredient_group']]]['ingredients'].append(ingredient)

        return list(recipe_dict.values())

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
