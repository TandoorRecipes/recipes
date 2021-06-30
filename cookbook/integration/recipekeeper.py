import re
from bs4 import BeautifulSoup
from io import BytesIO
from zipfile import ZipFile

from django.utils.translation import gettext as _

from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.helper.recipe_url_import import parse_servings, iso_duration_to_minutes
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient, Keyword


class RecipeKeeper(Integration):

    def import_file_name_filter(self, zip_info_object):
        return re.match(r'^recipes.html$', zip_info_object.filename)

    def split_recipe_file(self, file):
        recipe_html = BeautifulSoup(file, 'html.parser')
        return recipe_html.find_all('div', class_='recipe-details')

    def get_recipe_from_file(self, file):
        # 'file' comes is as a beautifulsoup object
        recipe = Recipe.objects.create(name=file.find("h2", {"itemprop": "name"}).text.strip(), created_by=self.request.user, internal=True, space=self.request.space, )

        # add 'Courses' and 'Categories' as keywords
        for course in file.find_all("span", {"itemprop": "recipeCourse"}):
            keyword, created = Keyword.objects.get_or_create(name=course.text, space=self.request.space)
            recipe.keywords.add(keyword)

        for category in file.find_all("meta", {"itemprop": "recipeCategory"}):
            keyword, created = Keyword.objects.get_or_create(name=category.get("content"), space=self.request.space)
            recipe.keywords.add(keyword)

        try:
            recipe.servings = parse_servings(file.find("span", {"itemprop": "recipeYield"}).text.strip())
            recipe.working_time = iso_duration_to_minutes(file.find("span", {"meta": "prepTime"}).text.strip())
            recipe.waiting_time = iso_duration_to_minutes(file.find("span", {"meta": "cookTime"}).text.strip())
            recipe.save()
        except AttributeError:
            pass

        step = Step.objects.create(instruction='', space=self.request.space,)

        for ingredient in file.find("div", {"itemprop": "recipeIngredients"}).findChildren("p"):
            if ingredient.text == "":
                continue
            amount, unit, ingredient, note = parse(ingredient.text.strip())
            f = get_food(ingredient, self.request.space)
            u = get_unit(unit, self.request.space)
            step.ingredients.add(Ingredient.objects.create(
                food=f, unit=u, amount=amount, note=note, space=self.request.space,
            ))

        for s in file.find("div", {"itemprop": "recipeDirections"}).find_all("p"):
            if s.text == "":
                continue
            step.instruction += s.text + ' \n'

        if file.find("span", {"itemprop": "recipeSource"}).text != '':
            step.instruction += "\n\nImported from: " + file.find("span", {"itemprop": "recipeSource"}).text
            step.save()
            source_url_added = True

        recipe.steps.add(step)

        # import the Primary recipe image that is stored in the Zip
        try:
            for f in self.files:
                if '.zip' in f['name']:
                    import_zip = ZipFile(f['file'])
                    self.import_recipe_image(recipe, BytesIO(import_zip.read(file.find("img", class_="recipe-photo").get("src"))), filetype='.jpeg')
        except Exception as e:
            pass

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
