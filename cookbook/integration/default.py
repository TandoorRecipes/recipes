import json
from io import BytesIO
from zipfile import ZipFile

from rest_framework.renderers import JSONRenderer

from cookbook.integration.integration import Integration
from cookbook.serializer import RecipeExportSerializer


class Default(Integration):

    def get_recipe_from_file(self, file):
        recipe_zip = ZipFile(file)

        recipe_string = recipe_zip.read('recipe.json').decode("utf-8")
        recipe = self.decode_recipe(recipe_string)
        if 'image.png' in recipe_zip.namelist():
            self.import_recipe_image(recipe, BytesIO(recipe_zip.read('image.png')))
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
