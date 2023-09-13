import json
import traceback
from io import BytesIO, StringIO
from re import match
from zipfile import ZipFile

from rest_framework.renderers import JSONRenderer

from cookbook.helper.image_processing import get_filetype
from cookbook.integration.integration import Integration
from cookbook.serializer import RecipeExportSerializer


class Default(Integration):

    def get_recipe_from_file(self, file):
        recipe_zip = ZipFile(file)

        recipe_string = recipe_zip.read('recipe.json').decode("utf-8")
        recipe = self.decode_recipe(recipe_string)
        images = list(filter(lambda v: match('image.*', v), recipe_zip.namelist()))
        if images:
            try:
                self.import_recipe_image(recipe, BytesIO(recipe_zip.read(images[0])), filetype=get_filetype(images[0]))
            except AttributeError:
                traceback.print_exc()
        return recipe

    def decode_recipe(self, string):
        data = json.loads(string)
        serialized_recipe = RecipeExportSerializer(data=data, context={'request': self.request})
        if serialized_recipe.is_valid():
            recipe = serialized_recipe.save()
            return recipe

        return None

    def get_file_from_recipe(self, recipe):

        export = RecipeExportSerializer(recipe).data

        return 'recipe.json', JSONRenderer().render(export).decode("utf-8")

    def get_files_from_recipes(self, recipes, el, cookie):
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')

        for r in recipes:
            if r.internal and r.space == self.request.space:
                recipe_zip_stream = BytesIO()
                recipe_zip_obj = ZipFile(recipe_zip_stream, 'w')

                recipe_stream = StringIO()
                filename, data = self.get_file_from_recipe(r)
                recipe_stream.write(data)
                recipe_zip_obj.writestr(filename, recipe_stream.getvalue())
                recipe_stream.close()

                try:
                    recipe_zip_obj.writestr(f'image{get_filetype(r.image.file.name)}', r.image.file.read())
                except (ValueError, FileNotFoundError):
                    pass

                recipe_zip_obj.close()

                export_zip_obj.writestr(str(r.pk) + '.zip', recipe_zip_stream.getvalue())

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(r)
            el.save()

        export_zip_obj.close()

        return [[self.get_export_file_name(), export_zip_stream.getvalue()]]
