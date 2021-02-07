import json
import os
import uuid
from io import StringIO, BytesIO
from os.path import basename
from zipfile import ZipFile

from PIL import Image
from django.core.files import File
from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer

from cookbook.integration.integration import Integration
from cookbook.serializer import RecipeExportSerializer


class Default(Integration):

    def do_export(self, recipes):
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')

        for r in recipes:
            if r.internal:
                recipe_zip_stream = BytesIO()
                recipe_zip_obj = ZipFile(recipe_zip_stream, 'w')

                recipe_json_stream = StringIO()
                recipe_json_stream.write(self.get_export(r))
                recipe_zip_obj.writestr('recipe.json', recipe_json_stream.getvalue())
                recipe_json_stream.close()

                recipe_zip_obj.write(r.image.path, basename(r.image.path))

                recipe_zip_obj.close()
                export_zip_obj.writestr(str(r.pk) + '.zip', recipe_zip_stream.getvalue())

        export_zip_obj.close()

        response = HttpResponse(export_zip_stream.getvalue(), content_type='application/force-download')
        response['Content-Disposition'] = 'attachment; filename="export.zip"'
        return response

    def do_import(self, files):
        for f in files:
            zip = ZipFile(f.file)
            for z in zip.namelist():
                self.get_recipe_from_zip(ZipFile(BytesIO(zip.read(z))))

    def get_recipe_from_zip(self, recipe_zip):
        recipe_string = recipe_zip.read('recipe.json').decode("utf-8")
        recipe = self.get_recipe(recipe_string)
        for f in recipe_zip.namelist():
            if '.png' in f:
                recipe.image = File(BytesIO(recipe_zip.read(f)), name=f'{uuid.uuid4()}_{recipe.pk}.png')
                recipe.save()

    def get_recipe(self, string):
        data = json.loads(string)
        serialized_recipe = RecipeExportSerializer(data=data, context={'request': self.request})
        if serialized_recipe.is_valid():
            recipe = serialized_recipe.save()
            return recipe

        return None

    def get_export(self, recipe):
        export = RecipeExportSerializer(recipe).data

        return JSONRenderer().render(export).decode("utf-8")
