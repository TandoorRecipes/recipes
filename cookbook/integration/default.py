import json
import os
from io import StringIO, BytesIO
from os.path import basename
from zipfile import ZipFile

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

    def get_recipe(self, string):
        data = json.loads(string)

        return RecipeExportSerializer(data=data, context={'request': self.request})

    def get_export(self, recipe):
        export = RecipeExportSerializer(recipe).data

        return JSONRenderer().render(export).decode("utf-8")
