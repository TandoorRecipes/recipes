import re
from io import BytesIO
from zipfile import ZipFile

from bs4 import BeautifulSoup

from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_html_import import get_recipe_from_source
from cookbook.helper.recipe_url_import import iso_duration_to_minutes, parse_servings
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step
from recipes.settings import DEBUG


class CopyMeThat(Integration):

    def import_file_name_filter(self, zip_info_object):
        if DEBUG:
            print("testing", zip_info_object.filename, zip_info_object.filename == 'recipes.html')
        return zip_info_object.filename == 'recipes.html'

    def get_recipe_from_file(self, file):
        # 'file' comes is as a beautifulsoup object
        recipe = Recipe.objects.create(name=file.find("div", {"id": "name"}).text.strip(), created_by=self.request.user, internal=True, space=self.request.space, )

        for category in file.find_all("span", {"class": "recipeCategory"}):
            keyword, created = Keyword.objects.get_or_create(name=category.text, space=self.request.space)
            recipe.keywords.add(keyword)

        try:
            recipe.servings = parse_servings(file.find("a", {"id": "recipeYield"}).text.strip())
            recipe.working_time = iso_duration_to_minutes(file.find("span", {"meta": "prepTime"}).text.strip())
            recipe.waiting_time = iso_duration_to_minutes(file.find("span", {"meta": "cookTime"}).text.strip())
            recipe.save()
        except AttributeError:
            pass

        step = Step.objects.create(instruction='', space=self.request.space, )

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in file.find_all("li", {"class": "recipeIngredient"}):
            if ingredient.text == "":
                continue
            amount, unit, food, note = ingredient_parser.parse(ingredient.text.strip())
            f = ingredient_parser.get_food(food)
            u = ingredient_parser.get_unit(unit)
            step.ingredients.add(Ingredient.objects.create(
                food=f, unit=u, amount=amount, note=note, original_text=ingredient.text.strip(), space=self.request.space,
            ))

        for s in file.find_all("li", {"class": "instruction"}):
            if s.text == "":
                continue
            step.instruction += s.text.strip() + ' \n\n'

        for s in file.find_all("li", {"class": "recipeNote"}):
            if s.text == "":
                continue
            step.instruction += s.text.strip() + ' \n\n'

        try:
            if file.find("a", {"id": "original_link"}).text != '':
                step.instruction += "\n\nImported from: " + file.find("a", {"id": "original_link"}).text
                step.save()
        except AttributeError:
            pass

        recipe.steps.add(step)

        # import the Primary recipe image that is stored in the Zip
        try:
            for f in self.files:
                if '.zip' in f['name']:
                    import_zip = ZipFile(f['file'])
                    self.import_recipe_image(recipe, BytesIO(import_zip.read(file.find("img", class_="recipeImage").get("src"))), filetype='.jpeg')
        except Exception as e:
            print(recipe.name, ': failed to import image ', str(e))

        recipe.save()
        return recipe

    def split_recipe_file(self, file):
        soup = BeautifulSoup(file, "html.parser")
        return soup.find_all("div", {"class": "recipe"})
