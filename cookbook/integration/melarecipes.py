import base64
import json
from io import BytesIO

from gettext import gettext as _
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class MelaRecipes(Integration):

    def split_recipe_file(self, file):
        return [json.loads(file.getvalue().decode("utf-8"))]

    def get_files_from_recipes(self, recipes, el, cookie):
        raise NotImplementedError('Method not implemented in storage integration')

    def get_recipe_from_file(self, file):
        recipe_json = file

        recipe = Recipe.objects.create(
            name=recipe_json['title'].strip(),
            created_by=self.request.user, internal=True, space=self.request.space)

        if 'yield' in recipe_json:
            recipe.servings = parse_servings(recipe_json['yield'])

        if 'cookTime' in recipe_json:
            recipe.waiting_time = parse_time(recipe_json['cookTime'])

        if 'prepTime' in recipe_json:
            recipe.working_time = parse_time(recipe_json['prepTime'])

        if 'favorite' in recipe_json and recipe_json['favorite']:
            recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=_('Favorite'))[0])

        if 'categories' in recipe_json:
            try:
                for x in recipe_json['categories']:
                    recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=x)[0])
            except Exception:
                pass

        instruction = ''
        if 'text' in recipe_json:
            instruction += f'*{recipe_json["text"].strip()}*  \n'

        if 'instructions' in recipe_json:
            instruction += recipe_json["instructions"].strip() + '  \n'

        if 'notes' in recipe_json:
            instruction += recipe_json["notes"].strip() + '  \n'

        if 'link' in recipe_json:
            recipe.source_url = recipe_json['link']

        step = Step.objects.create(
            instruction=instruction, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients
        )

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in recipe_json['ingredients'].split('\n'):
            if ingredient.strip() != '':
                amount, unit, food, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(food)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                ))
        recipe.steps.add(step)

        if recipe_json.get("images", None):
            try:
                self.import_recipe_image(recipe, BytesIO(base64.b64decode(recipe_json['images'][0])), filetype='.jpeg')
            except Exception:
                pass

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
