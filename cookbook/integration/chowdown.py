import json
import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Food, Unit, Ingredient, Keyword


class Chowdown(Integration):

    def import_file_name_filter(self, zip_info_object):
        print("testing", zip_info_object.filename)
        return re.match(r'^(_)*recipes/([A-Za-z\d\s-])+.md$', zip_info_object.filename)

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False
        description_mode = False

        ingredients = []
        directions = []
        descriptions = []
        for fl in file.readlines():
            line = fl.decode("utf-8")
            if 'title:' in line:
                title = line.replace('title:', '').replace('"', '').strip()
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

        for k in tags.split(','):
            keyword, created = Keyword.get_or_create(name=k.strip(), space=self.request.space)
            recipe.keywords.add(keyword)

        step = Step.objects.create(
            instruction='\n'.join(directions) + '\n\n' + '\n'.join(descriptions), space=self.request.space,
        )

        for ingredient in ingredients:
            amount, unit, ingredient, note = parse(ingredient)
            f = get_food(ingredient, self.request.space)
            u = get_unit(unit, self.request.space)
            step.ingredients.add(Ingredient.objects.create(
                food=f, unit=u, amount=amount, note=note, space=self.request.space,
            ))
        recipe.steps.add(step)

        for f in self.files:
            if '.zip' in f['name']:
                import_zip = ZipFile(f['file'])
                for z in import_zip.filelist:
                    if re.match(f'^images/{image}$', z.filename):
                        self.import_recipe_image(recipe, BytesIO(import_zip.read(z.filename)), filetype=get_filetype(z.filename))

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
