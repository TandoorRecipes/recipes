import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class Chowdown(Integration):

    def import_file_name_filter(self, zip_info_object):
        print("testing", zip_info_object.filename)
        return re.match(r'^(_)*recipes/([A-Za-z\d\s\-_()\[\]\u00C0-\u017F])+.md$', zip_info_object.filename)

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False
        description_mode = False

        description = None
        prep_time = None
        serving = None

        ingredients = []
        directions = []
        descriptions = []
        for fl in file.readlines():
            line = fl.decode("utf-8")
            if 'title:' in line:
                title = line.replace('title:', '').replace('"', '').strip()
            if 'description:' in line:
                description = line.replace('description:', '').replace('"', '').strip()
            if 'prep_time:' in line:
                prep_time = line.replace('prep_time:', '').replace('"', '').strip()
            if 'yield:' in line:
                serving = line.replace('yield:', '').replace('"', '').strip()
            if 'image:' in line:
                image = line.replace('image:', '').strip()
            if 'tags:' in line:
                tags = line.replace('tags:', '').strip()
            if ingredient_mode:
                if len(line) > 2 and 'directions:' not in line:
                    ingredients.append(line[2:])
            if '---' in line and direction_mode:
                direction_mode = False
                description_mode = True
            if direction_mode:
                if len(line) > 2:
                    directions.append(line[2:])
            if 'ingredients:' in line:
                ingredient_mode = True
            if 'directions:' in line:
                ingredient_mode = False
                direction_mode = True
            if description_mode and len(line) > 3 and '---' not in line:
                descriptions.append(line)

        recipe = Recipe.objects.create(name=title, created_by=self.request.user, internal=True, space=self.request.space)
        if description:
            recipe.description = description

        for k in tags.split(','):
            keyword, created = Keyword.objects.get_or_create(name=k.strip(), space=self.request.space)
            recipe.keywords.add(keyword)

        ingredients_added = False
        for direction in directions:
            if len(direction.strip()) > 0:
                step = Step.objects.create(
                    instruction=direction, name='', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )
            else:
                step = Step.objects.create(
                    instruction=direction, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )
            if not ingredients_added:
                ingredients_added = True

                ingredient_parser = IngredientParser(self.request, True)
                for ingredient in ingredients:
                    if len(ingredient.strip()) > 0:
                        amount, unit, food, note = ingredient_parser.parse(ingredient)
                        f = ingredient_parser.get_food(food)
                        u = ingredient_parser.get_unit(unit)
                        step.ingredients.add(Ingredient.objects.create(
                            food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                        ))
            recipe.steps.add(step)

        if serving:
            recipe.servings = parse_servings(serving)
            recipe.servings_text = 'servings'

        if prep_time:
            recipe.working_time = parse_time(prep_time)

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in ingredients:
            if len(ingredient.strip()) > 0:
                amount, unit, food, note = ingredient_parser.parse(ingredient)
                f = ingredient_parser.get_food(food)
                u = ingredient_parser.get_unit(unit)
                step.ingredients.add(Ingredient.objects.create(
                    food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                ))
        recipe.steps.add(step)

        for f in self.files:
            if '.zip' in f['name']:
                import_zip = ZipFile(f['file'])
                for z in import_zip.filelist:
                    if re.match(f'^images/{image}$', z.filename):
                        self.import_recipe_image(recipe, BytesIO(import_zip.read(z.filename)), filetype=get_filetype(z.filename))

        recipe.save()
        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
