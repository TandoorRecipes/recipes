import json
import re
from io import BytesIO
from zipfile import ZipFile

import microdata
from bs4 import BeautifulSoup

from cookbook.helper.recipe_url_import import find_recipe_json
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Ingredient, Unit


class Paprika(Integration):

    def import_file_name_filter(self, zip_info_object):
        print("testing", zip_info_object.filename)
        return re.match(r'^Recipes/([A-Za-z\s])+.html$', zip_info_object.filename)

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')

    def get_recipe_from_file(self, file):
        html_text = file.getvalue().decode("utf-8")

        items = microdata.get_items(html_text)
        for i in items:
            md_json = json.loads(i.json())
            if 'schema.org/Recipe' in str(md_json['type']):
                recipe_json = find_recipe_json(md_json['properties'], '', space=self.request.space)
                recipe = Recipe.objects.create(name=recipe_json['name'].strip(), created_by=self.request.user, internal=True, space=self.request.space)
                step = Step.objects.create(
                    instruction=recipe_json['recipeInstructions']
                )

                for ingredient in recipe_json['recipeIngredient']:
                    f, created = Food.objects.get_or_create(name=ingredient['ingredient']['text'], space=self.request.space)
                    u, created = Unit.objects.get_or_create(name=ingredient['unit']['text'], space=self.request.space)
                    step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=ingredient['amount'], note=ingredient['note']
                    ))

                recipe.steps.add(step)

                soup = BeautifulSoup(html_text, "html.parser")
                image = soup.find('img')
                image_name = image.attrs['src'].strip().replace('Images/', '')

                for f in self.files:
                    if '.zip' in f.name:
                        import_zip = ZipFile(f.file)
                        for z in import_zip.filelist:
                            if re.match(f'^Recipes/Images/{image_name}$', z.filename):
                                self.import_recipe_image(recipe, BytesIO(import_zip.read(z.filename)))

                return recipe
