import json
import re
from io import BytesIO, StringIO
from zipfile import ZipFile

from PIL import Image

from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import iso_duration_to_minutes
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, NutritionInformation, Recipe, Step


class NextcloudCookbook(Integration):

    def import_file_name_filter(self, zip_info_object):
        return zip_info_object.filename.endswith('.json')

    def get_recipe_from_file(self, file):
        recipe_json = json.loads(file.getvalue().decode("utf-8"))

        description = '' if len(recipe_json['description'].strip()) > 500 else recipe_json['description'].strip()

        recipe = Recipe.objects.create(
            name=recipe_json['name'].strip(), description=description,
            created_by=self.request.user, internal=True,
            servings=recipe_json['recipeYield'], space=self.request.space)

        try:
            recipe.working_time = iso_duration_to_minutes(recipe_json['prepTime'])
            recipe.waiting_time = iso_duration_to_minutes(recipe_json['cookTime'])
        except Exception:
            pass

        if 'url' in recipe_json:
            recipe.source_url = recipe_json['url'].strip()

        if 'recipeCategory' in recipe_json:
            try:
                recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=recipe_json['recipeCategory'])[0])
            except Exception:
                pass

        if 'keywords' in recipe_json:
            try:
                for x in recipe_json['keywords'].split(','):
                    if x.strip() != '':
                        recipe.keywords.add(Keyword.objects.get_or_create(space=self.request.space, name=x)[0])
            except Exception:
                pass

        ingredients_added = False
        for s in recipe_json['recipeInstructions']:
            if 'text' in s:
                step = Step.objects.create(
                    instruction=s['text'], name=s['name'], space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )
            else:
                step = Step.objects.create(
                    instruction=s, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )

            ingredient_parser = IngredientParser(self.request, True)
            if ingredients_added == False:
                for ingredient in recipe_json['recipeIngredient']:
                    ingredients_added = True
                    if ingredient.startswith('##'):
                        subheader = ingredient.replace('##', '', 1)
                        step.ingredients.add(Ingredient.objects.create(note=subheader, is_header=True, no_amount=True, space=self.request.space))
                    else:
                        amount, unit, food, note = ingredient_parser.parse(ingredient)
                        f = ingredient_parser.get_food(food)
                        u = ingredient_parser.get_unit(unit)
                        step.ingredients.add(Ingredient.objects.create(
                            food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,))
            recipe.steps.add(step)

        if 'nutrition' in recipe_json:
            nutrition = {}
            try:
                if 'calories' in recipe_json['nutrition']:
                    nutrition['calories'] = int(re.search(r'\d+', recipe_json['nutrition']['calories']).group())
                if 'proteinContent' in recipe_json['nutrition']:
                    nutrition['proteins'] = int(re.search(r'\d+', recipe_json['nutrition']['proteinContent']).group())
                if 'fatContent' in recipe_json['nutrition']:
                    nutrition['fats'] = int(re.search(r'\d+', recipe_json['nutrition']['fatContent']).group())
                if 'carbohydrateContent' in recipe_json['nutrition']:
                    nutrition['carbohydrates'] = int(re.search(r'\d+', recipe_json['nutrition']['carbohydrateContent']).group())

                if nutrition != {}:
                    recipe.nutrition = NutritionInformation.objects.create(**nutrition, space=self.request.space)
                    recipe.save()
            except Exception:
                pass

        for f in self.files:
            if '.zip' in f['name']:
                import_zip = ZipFile(f['file'])
                for z in import_zip.filelist:
                    if re.match(f'^(.)+{recipe.name}/full.jpg$', z.filename):
                        self.import_recipe_image(recipe, BytesIO(import_zip.read(z.filename)), filetype=get_filetype(z.filename))

        return recipe

    def formatTime(self, min):
        h = min // 60
        m = min % 60
        return f'PT{h}H{m}M0S'

    def get_file_from_recipe(self, recipe):

        export = {}
        export['name'] = recipe.name
        export['description'] = recipe.description
        export['url'] = recipe.source_url
        export['prepTime'] = self.formatTime(recipe.working_time)
        export['cookTime'] = self.formatTime(recipe.waiting_time)
        export['totalTime'] = self.formatTime(recipe.working_time + recipe.waiting_time)
        export['recipeYield'] = recipe.servings
        export['image'] = f'/Recipes/{recipe.name}/full.jpg'
        export['imageUrl'] = f'/Recipes/{recipe.name}/full.jpg'

        recipeKeyword = []
        for k in recipe.keywords.all():
            recipeKeyword.append(k.name)

        export['keywords'] = recipeKeyword

        recipeInstructions = []
        recipeIngredient = []
        for s in recipe.steps.all():
            recipeInstructions.append(s.instruction)

            for i in s.ingredients.all():
                recipeIngredient.append(f'{float(i.amount)} {i.unit} {i.food}')

        export['recipeIngredient'] = recipeIngredient
        export['recipeInstructions'] = recipeInstructions

        return "recipe.json", json.dumps(export)

    def get_files_from_recipes(self, recipes, el, cookie):
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')

        for recipe in recipes:
            if recipe.internal and recipe.space == self.request.space:

                recipe_stream = StringIO()
                filename, data = self.get_file_from_recipe(recipe)
                recipe_stream.write(data)
                export_zip_obj.writestr(f'{recipe.name}/{filename}', recipe_stream.getvalue())
                recipe_stream.close()

                try:
                    imageByte = recipe.image.file.read()
                    export_zip_obj.writestr(f'{recipe.name}/full.jpg', self.getJPEG(imageByte))
                    export_zip_obj.writestr(f'{recipe.name}/thumb.jpg', self.getThumb(171, imageByte))
                    export_zip_obj.writestr(f'{recipe.name}/thumb16.jpg', self.getThumb(16, imageByte))
                except ValueError:
                    pass

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(recipe)
            el.save()

        export_zip_obj.close()

        return [[self.get_export_file_name(), export_zip_stream.getvalue()]]

    def getJPEG(self, imageByte):
        image = Image.open(BytesIO(imageByte))
        image = image.convert('RGB')

        bytes = BytesIO()
        image.save(bytes, "JPEG")
        return bytes.getvalue()

    def getThumb(self, size, imageByte):
        image = Image.open(BytesIO(imageByte))

        w, h = image.size
        m = min(w, h)

        image = image.crop(((w - m) // 2, (h - m) // 2, (w + m) // 2, (h + m) // 2))
        image = image.resize([size, size], Image.Resampling.LANCZOS)
        image = image.convert('RGB')

        bytes = BytesIO()
        image.save(bytes, "JPEG")
        return bytes.getvalue()
