import json
from io import BytesIO, StringIO
from re import match
from zipfile import ZipFile
from django.utils.text import get_valid_filename

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
            self.import_recipe_image(recipe, BytesIO(recipe_zip.read(images[0])), filetype=get_filetype(images[0]))
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

    def get_files_from_recipes(self, recipes, cookie):
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
                except ValueError:
                    pass

                recipe_zip_obj.close()

                export_zip_obj.writestr(get_valid_filename(r.name) + '.zip', recipe_zip_stream.getvalue())
        export_zip_obj.close()

        return [[ 'export.zip', export_zip_stream.getvalue() ]]