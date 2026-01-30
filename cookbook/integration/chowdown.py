import re
import unicodedata
from io import BytesIO, StringIO
from zipfile import ZipFile

from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.helper.recipe_url_import import parse_servings, parse_servings_text, parse_time
from cookbook.integration.integration import Integration
from cookbook.models import Ingredient, Keyword, Recipe, Step


class Chowdown(Integration):

    def import_file_name_filter(self, zip_info_object):
        return re.match(r'^(_)*recipes/([A-Za-z\d\s\-_()\[\]\u00C0-\u017F])+.md$', zip_info_object.filename)

    def normalize_name(self, name):
        name = unicodedata.normalize("NFKD", name)
        name = "".join(c for c in name if not unicodedata.combining(c))
        name = re.sub(r"[^A-Za-z0-9\s']", "", name)
        name = re.sub(r"[\s']+", "-", name)
        return name.strip("-")

    def get_recipe_from_file(self, file):
        ingredient_mode = False
        direction_mode = False
        description_mode = False

        title = "???"
        descriptions = []
        prep_time = None ## non-standard
        waiting_time = None ## non-standard
        serving = None
        image = None
        tags = None
        source_url = None ## non-standard
        ingredients = []
        directions = []

        for fl in file.readlines():
            line = fl.decode("utf-8")
            if 'title:' in line:
                title = line.replace('title:', '').replace('"', '').strip()
            if 'description:' in line:
                descriptions.append(line.replace('description:', '').replace('"', '').strip())
            if 'prep_time:' in line:
                prep_time = line.replace('prep_time:', '').replace('"', '').strip()
            if 'waiting_time:' in line:
                waiting_time = line.replace('waiting_time:', '').replace('"', '').strip()
            if 'yield:' in line:
                serving = line.replace('yield:', '').replace('"', '').strip()
            if 'image:' in line:
                image = line.replace('image:', '').strip()
            if 'tags:' in line:
                tags = line.replace('tags:', '').strip()
            if 'url:' in line:
                source_url = line.replace('url:', '').strip()
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
            if description_mode and not line.startswith('---'):
                descriptions.append(line.rstrip())

        name_max_length = Recipe._meta.get_field('name').max_length
        if len(title) > name_max_length:
            title = title[:name_max_length]

        recipe = Recipe.objects.create(name=title, created_by=self.request.user, internal=True, space=self.request.space)
        if descriptions:
            description_max_length = Recipe._meta.get_field('description').max_length
            description_text = '\n'.join(descriptions)
            if len(description_text) <= description_max_length:
                recipe.description = description_text
            else:
                step = Step.objects.create(name="Notes",
                    instruction=description_text, space=self.request.space,
                )
                recipe.steps.add(step)

        if prep_time:
            recipe.working_time = parse_time(prep_time)

        if waiting_time:
            recipe.waiting_time = parse_time(waiting_time)

        if serving:
            recipe.servings = parse_servings(serving)
            recipe.servings_text = parse_servings_text(serving)

        if tags:
            keyword_max_length = Keyword._meta.get_field('name').max_length
            for k in tags.split(','):
                key = k.strip()
                if len(key) > keyword_max_length:
                    key = key[:keyword_max_length]
                keyword, created = Keyword.objects.get_or_create(name=key, space=self.request.space)
                recipe.keywords.add(keyword)

        if source_url:
            source_url_max_length = Recipe._meta.get_field('source_url').max_length
            if len(source_url) > source_url_max_length:
                source_url = source_url[:source_url_max_length]
            recipe.source_url = source_url

        first_step = None
        for direction in directions:
            if len(direction.strip()) > 0:
                step = Step.objects.create(
                    instruction=direction, name='', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )
            else:
                step = Step.objects.create(
                    instruction=direction, space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
                )

            if first_step is None:
                first_step = step

            recipe.steps.add(step)

        # if no direction given, add empty dummy step for ingredients
        if first_step is None:
            first_step = Step.objects.create(
                instruction='', space=self.request.space, show_ingredients_table=self.request.user.userpreference.show_step_ingredients,
            )
            recipe.steps.add(first_step)

        ingredient_parser = IngredientParser(self.request, True)
        for ingredient in ingredients:
            commentIdx = ingredient.find("##")
            if commentIdx >= 0:
              ingredient = ingredient[:commentIdx].strip()
            if len(ingredient.strip()) > 0:
                if ingredient.strip().endswith(":"):
                    first_step.ingredients.add(Ingredient.objects.create(
                        note=ingredient, is_header=True, no_amount=True, original_text=ingredient, space=self.request.space
                    ))
                else:
                    amount, unit, food, note = ingredient_parser.parse(ingredient)
                    f = ingredient_parser.get_food(food)
                    u = ingredient_parser.get_unit(unit)
                    first_step.ingredients.add(Ingredient.objects.create(
                        food=f, unit=u, amount=amount, note=note, original_text=ingredient, space=self.request.space,
                    ))

        if image:
            for f in self.files:
                if '.zip' in f['name']:
                    import_zip = ZipFile(f['file'])
                    for z in import_zip.filelist:
                        if re.match(f'^images/{image}$', z.filename):
                            self.import_recipe_image(recipe, BytesIO(import_zip.read(z.filename)), filetype=get_filetype(z.filename))

        recipe.save()
        return recipe

    def formatTime(self, min):
        h = min // 60
        m = min % 60
        return f'{h}:{m:02d}:00'

    def get_file_from_recipe(self, recipe):
        data = "---\n\n"
        data += "layout: recipe\n"
        data += "title: " + (recipe.name if recipe.name else "") + "\n"
        if recipe.image:
            data += f"image: {self.normalize_name(recipe.name)}{get_filetype(recipe.image.file.name)}\n"

        if recipe.source_url:
            data += f"url: {recipe.source_url}\n"

        if recipe.working_time:
            data += f"prep_time: {self.formatTime(recipe.working_time)}\n"

        if recipe.waiting_time:
            data += f"waiting_time: {self.formatTime(recipe.waiting_time)}\n"

        if recipe.servings:
            servings = f"{recipe.servings:g}"
            if recipe.servings_text:
                servings += f" {recipe.servings_text}"
            data += f"yield: {servings}\n"

        if recipe.keywords:
            data += "\ntags:\n"
            for k in recipe.keywords.all():
                data += f"- {k.name}\n"
            data += "\n"

        recipeInstructions = []
        recipeIngredient = []
        detailedDescription = ""
        for i,s in enumerate(recipe.steps.all()):
            if i==0 and s.name == "Notes":
                detailedDescription = s.instruction.strip()
            else:
                recipeInstructions.append(s.instruction.strip())

            for i in s.ingredients.all():
                ingLine = ""
                if i.is_header:
                    ingLine = f"{i.note}"
                else:
                    if i.amount:
                        ingLine += f"{float(i.amount):g} "
                    if i.unit:
                        ingLine += f"{i.unit} "
                    ingLine += str(i.food)
                    if i.note:
                        ingLine += f", {i.note}"
                recipeIngredient.append(ingLine)

        data += "ingredients: \n"
        for ingredient in recipeIngredient:
            data += f"-  {ingredient}\n"

        data += "\n"

        data += "directions: \n"
        for instruction in recipeInstructions:
            data += f"-  {instruction}\n"

        data += "\n---\n\n"

        if recipe.description:
            data += recipe.description
        if detailedDescription:
            data += detailedDescription

        return self.normalize_name(recipe.name) + '.md', data

    def get_files_from_recipes(self, recipes, el, cookie):
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')
        recpath = "_recipes"
        imgpath = "images"
        export_zip_obj.mkdir(recpath)
        export_zip_obj.mkdir(imgpath)

        for r in recipes:
            if r.internal and r.space == self.request.space:
                recipe_stream = StringIO()
                filename, data = self.get_file_from_recipe(r)
                recipe_stream.write(data)
                export_zip_obj.writestr(f"{recpath}/{filename}", recipe_stream.getvalue())
                recipe_stream.close()

                try:
                    export_zip_obj.writestr(f"{imgpath}/{self.normalize_name(r.name)}{get_filetype(r.image.file.name)}", r.image.file.read())
                except (ValueError, FileNotFoundError):
                    pass

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(r)
            el.save()

        export_zip_obj.close()

        return [[self.get_export_file_name(), export_zip_stream.getvalue()]]
