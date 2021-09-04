import json
import re
from io import BytesIO
from zipfile import ZipFile

from cookbook.helper.image_processing import get_filetype
from cookbook.helper.ingredient_parser import parse, get_food, get_unit
from cookbook.integration.integration import Integration
from cookbook.models import Recipe, Step, Ingredient


class Mealie(Integration):

    def import_file_name_filter(self, zip_info_object):
        return re.match(r'^recipes/([A-Za-z\d-])+/([A-Za-z\d-])+.json$', zip_info_object.filename)

    def get_recipe_from_file(self, file):
        recipe_json = json.loads(file.getvalue().decode("utf-8"))

        description = '' if len(recipe_json['description'].strip()) > 500 else recipe_json['description'].strip()

        recipe = Recipe.objects.create(
            name=recipe_json['name'].strip(), description=description,
            created_by=self.request.user, internal=True, space=self.request.space)

        # TODO parse times (given in PT2H3M )
        # @vabene check recipe_url_import.iso_duration_to_minutes  I think it does what you are looking for

        ingredients_added = False
        for s in recipe_json['recipe_instructions']:
            step = Step.objects.create(
                instruction=s['text'], space=self.request.space,
            )
            if not ingredients_added:
                ingredients_added = True

                if len(recipe_json['description'].strip()) > 500:
                    step.instruction = recipe_json['description'].strip() + '\n\n' + step.instruction

                for ingredient in recipe_json['recipe_ingredient']:
                    try:
                        if ingredient['food']:
                            f = get_food(ingredient['food'], self.request.space)
                            u = get_unit(ingredient['unit'], self.request.space)
                            amount = ingredient['quantity']
                            note = ingredient['note']
                        else:
                            amount, unit, ingredient, note = parse(ingredient['note'])
                            f = get_food(ingredient, self.request.space)
                            u = get_unit(unit, self.request.space)
                        step.ingredients.add(Ingredient.objects.create(
                            food=f, unit=u, amount=amount, note=note, space=self.request.space,
                        ))
                    except Exception:
                        pass
            recipe.steps.add(step)

        for f in self.files:
            if '.zip' in f['name']:
                import_zip = ZipFile(f['file'])
                try:
                    self.import_recipe_image(recipe, BytesIO(import_zip.read(f'recipes/{recipe_json["slug"]}/images/min-original.webp')), filetype=get_filetype(f'recipes/{recipe_json["slug"]}/images/original'))
                except Exception:
                    pass

        return recipe

    def get_file_from_recipe(self, recipe):
        raise NotImplementedError('Method not implemented in storage integration')
