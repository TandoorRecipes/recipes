from io import BytesIO

import requests

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class Cookmate(Integration):

    def import_file_name_filter(self, zip_info_object):
        return zip_info_object.filename.endswith('.xml')

    def get_files_from_recipes(self, recipes, el, cookie):
        raise NotImplementedError('Method not implemented in storage integration')

    def get_recipe_from_file(self, file):
        recipe_xml = file

        recipe = Recipe.objects.create(
            name=recipe_xml.find('title').text.strip(),
            created_by=self.request.user, internal=True, space=self.request.space)

        if recipe_xml.find('preptime') is not None and recipe_xml.find('preptime').text is not None:
            recipe.working_time = parse_time(recipe_xml.find('preptime').text.strip())

        if recipe_xml.find('cooktime') is not None and recipe_xml.find('cooktime').text is not None:
            recipe.waiting_time = parse_time(recipe_xml.find('cooktime').text.strip())

        if recipe_xml.find('quantity') is not None and recipe_xml.find('quantity').text is not None:
            recipe.servings = parse_servings(recipe_xml.find('quantity').text.strip())
            recipe.servings_text = parse_servings_text(recipe_xml.find('quantity').text.strip())

        if recipe_xml.find('url') is not None and recipe_xml.find('url').text is not None:
            recipe.source_url = recipe_xml.find('url').text.strip()

        if recipe_xml.find('description') is not None:  # description is a list of <li>'s with text
            if len(recipe_xml.find('description')) > 0:
                recipe.description = recipe_xml.find('description')[0].text[:512]

        if recipe_text := recipe_xml.find('recipetext'):
            for step in recipe_text.getchildren():
                if step.text:
                    step = Step.objects.create(
                        instruction=step.text.strip(), space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                    )
                    recipe.steps.add(step)

        ingredient_parser = IngredientParser(self.request, True)

        if recipe_ingredients := recipe_xml.find('ingredient'):
            ingredient_step = recipe.steps.first()
            if ingredient_step is None:
                ingredient_step = Step.objects.create(space=self.request.space, instruction='')

            for ingredient in recipe_ingredients.getchildren():
                if ingredient.text:
                    if ingredient.text.strip() != '':
                        amount, unit, food, note = ingredient_parser.parse(ingredient.text.strip())
                        f = ingredient_parser.get_food(food)
                        u = ingredient_parser.get_unit(unit)
                        ingredient_step.ingredients.add(Ingredient.objects.create(
                            food=f, unit=u, amount=amount, note=note, original_text=ingredient.text.strip(), space=self.request.space,
                        ))

        if recipe_xml.find('imageurl') is not None:
            try:
                url = recipe_xml.find('imageurl').text.strip()
                if validate_import_url(url):
                    response = requests.get(url)
                self.import_recipe_image(recipe, BytesIO(response.content))
            except Exception as e:
                print('failed to import image ', str(e))

        recipe.save()

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
