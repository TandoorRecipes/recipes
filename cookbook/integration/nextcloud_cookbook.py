import json
import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.ingredient_parser import parse
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient


class NextcloudCookbook(Integration):

    def import_file_name_filter(self, zip_info_object):
        return re.match(r'^Recipes/([A-Za-z\d\s])+/recipe.json$', zip_info_object.filename)

    def get_recipe_from_file(self, file):
        recipe_json = json.loads(file.getvalue().decode("utf-8"))

        recipe = Recipe.objects.create(
            name=recipe_json['name'].strip(), description=recipe_json['description'].strip(),
            created_by=self.request.user, internal=True,
            servings=recipe_json['recipeYield'])

        # TODO parse times (given in PT2H3M )

        ingredients_added = False
        for s in recipe_json['recipeInstructions']:
            step = Step.objects.create(
                instruction=s
            )
            if not ingredients_added:
                ingredients_added = True

                for ingredient in recipe_json['recipeIngredient']:
                    amount, unit, ingredient, note = parse(ingredient)
                    f, created = Food.objects.get_or_create(name=ingredient)
                    u, created = Unit.objects.get_or_create(name=unit)
                    step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=amount, note=note
                    ))
            recipe.steps.add(step)

        for f in self.files:
            if '.zip' in f.name:
                import_zip = ZipFile(f.file)
                for z in import_zip.filelist:
                    if re.match(f'^Recipes/{recipe.name}/full.jpg$', z.filename):
                        self.import_recipe_image(recipe, BytesIO(import_zip.read(z.filename)))

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
