import json
import os
from zipfile import ZipFile

from rest_framework.renderers import JSONRenderer

from cookbook.integration.integration import Integration
from cookbook.serializer import RecipeExportSerializer


class Default(Integration):

    def do_export(self, recipes):
        path = self.get_tmp_dir_path()
        export_zip_obj = ZipFile(os.path.join(path, 'export.zip'), 'w')

        for r in recipes:
            if r.internal:
                base_path = os.path.join(path, str(r.pk))
                os.makedirs(base_path, exist_ok=True)
                recipe_zip_obj = ZipFile(base_path + '.zip', 'w')

                f = open(os.path.join(path, str(r.pk), 'recipe.json'), "w", encoding="utf-8")
                f.write(self.get_export(r))
                recipe_zip_obj.write(f.name)
                recipe_zip_obj.write(r.image.path)
                f.close()

                recipe_zip_obj.close()
                export_zip_obj.write(recipe_zip_obj.filename)

        export_zip_obj.close()
        return export_zip_obj.filename

    def get_recipe(self, string):
        data = json.loads(string)

        return RecipeExportSerializer(data=data, context={'request': self.request})

    def get_export(self, recipe):
        export = RecipeExportSerializer(recipe).data

        return JSONRenderer().render(export).decode("utf-8")
