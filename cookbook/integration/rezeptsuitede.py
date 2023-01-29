from xml import etree

from lxml import etree

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_time, parse_servings, parse_servings_text
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Recipe, Step


class Rezeptsuitede(Integration):

    def split_recipe_file(self, file):
        xml_file = etree.parse(file).getroot().getchildren()
        recipe_list = xml_file.find('recipe')
        return recipe_list

    def get_recipe_from_file(self, file):
        recipe_xml = file

        recipe = Recipe.objects.create(
            name=recipe_xml.find('title').text.strip(),
            created_by=self.request.user, internal=True, space=self.request.space)

        if recipe_xml.find('servingtype') is not None and recipe_xml.find('servingtype').text is not None:
            recipe.servings = parse_servings(recipe_xml.find('servingtype').text.strip())
            recipe.servings_text = parse_servings_text(recipe_xml.find('servingtype').text.strip())

        if recipe_xml.find('description') is not None:  # description is a list of <li>'s with text
            if len(recipe_xml.find('description')) > 0:
                recipe.description = recipe_xml.find('description')[0].text[:512]

        for step in recipe_xml.find('step'):
            if step.text:
                step = Step.objects.create(
                    instruction=step.text.strip(), space=self.request.space,
                )
                recipe.steps.add(step)

        ingredient_parser = IngredientParser(self.request, True)

        if recipe_xml.find('ingredient'):
            ingredient_step = recipe.steps.first()
            if ingredient_step is None:
                ingredient_step = Step.objects.create(space=self.request.space, instruction='')

            for ingredient in recipe_xml.find('ingredient'):
                f = ingredient_parser.get_food(ingredient.attrib['item'])
                u = ingredient_parser.get_unit(ingredient.attrib['unit'])
                ingredient_step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=ingredient.attrib['qty'], original_text=ingredient.text.strip(), space=self.request.space,
                ))

        recipe.save()

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
