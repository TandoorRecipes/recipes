import base64
from io import BytesIO
from lxml import etree

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class Rezeptsuitede(Integration):

    def split_recipe_file(self, file):
        return etree.parse(file).getroot().getchildren()

    def get_recipe_from_file(self, file):
        recipe_xml = file

        recipe = Recipe.objects.create(
            name=recipe_xml.find('head').attrib['title'].strip(),
            created_by=self.request.user, internal=True, space=self.request.space)

        try:
            if recipe_xml.find('head').attrib['servingtype']:
                recipe.servings = parse_servings(recipe_xml.find('head').attrib['servingtype'].strip())
                recipe.servings_text = parse_servings_text(recipe_xml.find('head').attrib['servingtype'].strip())
        except KeyError:
            pass

        if recipe_xml.find('remark') is not None:  # description is a list of <li>'s with text
            if recipe_xml.find('remark').find('line') is not None:
                recipe.description = recipe_xml.find('remark').find('line').text[:512]

        for prep in recipe_xml.findall('preparation'):
            try:
                if prep.find('step').text:
                    step = Step.objects.create(
                        instruction=prep.find('step').text.strip(), space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                    )
                    recipe.steps.add(step)
            except Exception:
                pass

        ingredient_parser = IngredientParser(self.request, True)

        if recipe_xml.find('part').find('ingredient') is not None:
            ingredient_step = recipe.steps.first()
            if ingredient_step is None:
                ingredient_step = Step.objects.create(space=self.request.space, instruction='')

            for ingredient in recipe_xml.find('part').findall('ingredient'):
                f = ingredient_parser.get_food(ingredient.attrib['item'])
                u = ingredient_parser.get_unit(ingredient.attrib['unit'])
                amount = 0
                if ingredient.attrib['qty'].strip() != '':
                    try:
                        amount, unit, note = ingredient_parser.parse_amount(ingredient.attrib['qty'])
                    except ValueError:  # sometimes quantities contain words which cant be parsed
                        pass
                ingredient_step.ingredients.add(Ingredient.objects.create(food=f, unit=u, amount=amount, space=self.request.space, ))

        try:
            k, created = Keyword.objects.get_or_create(name=recipe_xml.find('head').find('cat').text.strip(), space=self.request.space)
            recipe.keywords.add(k)
        except Exception:
            pass

        recipe.save()

        try:
            self.import_recipe_image(recipe, BytesIO(base64.b64decode(recipe_xml.find('head').find('picbin').text)), filetype='.jpeg')
        except BaseException:
            pass

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
