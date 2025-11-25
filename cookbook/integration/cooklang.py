import os
import re
from io import BytesIO, StringIO
from typing import Mapping
from zipfile import ZipFile

from cookbook.helper.cooklang_parser import Recipe as CooklangRecipe
from cookbook.integration.integration import Integration
from cookbook.models import Recipe


class Cooklang(Integration):
    # ----------------------------------------------------Helper Functions----------------------------------------------------
    # todo cover Keywords (tags), working time, waiting time, nutrition
    def apply_metadata_cooklang_to_tandoor(self, cooklang_metadata: Mapping, tandoor_recipe: Recipe) -> Recipe:
        if "description" in cooklang_metadata.keys():
            tandoor_recipe.description = cooklang_metadata["description"]

        # Seperates serving numbers from other servings information
        # todo incorporate fuzzy matching
        serving_metadata = ""
        if "serves" in cooklang_metadata.keys():
            serving_metadata = cooklang_metadata["serves"]
        elif "servings" in cooklang_metadata.keys():
            serving_metadata = cooklang_metadata["servings"]
        if serving_numerals := re.match(r"^\d+", serving_metadata):
            tandoor_recipe.servings = serving_numerals.group(0)
        tandoor_recipe.servings_text = serving_metadata.replace(tandoor_recipe.servings, "")

        # will set source url to any metadata key, with the term "source", "url" or "link" with a prefference to "source"
        def link_preference(key):
            preference_list = {'source': 0, 'url': 1, 'link': 2}
            for item in preference_list.keys():
                if item in key:
                    return preference_list[item]
            return 999

        possible_links = [key for key in cooklang_metadata.keys() if "source" in key.lower() or "url" in key.lower() or "link" in key.lower()]
        tandoor_recipe.source_url = cooklang_metadata[sorted(possible_links, key=link_preference)[0]]

        return tandoor_recipe

    # ----------------------------------------------------Integration Method Override Functions----------------------------------------------------
    def import_file_name_filter(self, file) -> bool:
        # check file extension, return True if extension is correct
        pass

    def get_recipe_from_file(self, file) -> Recipe:
        # Import Recipe Logic - convert information from file into Recipe() object
        file_text = file.read()
        cooklang_object = CooklangRecipe.parse(file_text)

        recipe = Recipe.objects.create(
            name=os.path.basename(file.name).split('.')[0], description="", created_by=self.request.user, internal=True, servings=0, space=self.request.space
        )
        self.apply_metadata_cooklang_to_tandoor(cooklang_object.metadata, recipe)

        return recipe

    def get_file_from_recipe(self, recipe) -> tuple[str, str]:
        # Export Recipe Logic - convert from Recipe() object to a writable string in your integration's format
        # return 'Filename.extension', 'file string'
        pass

    def get_files_from_recipes(self, recipes, el, cookie) -> list[list[str, bytes]]:
        # 'el' and 'cookie' are passed through by the calling function 'do_export'
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')

        for recipe in recipes:
            if True:  # add any verification logic
                # get string data and filename from get_file_from_recipe() method and save it to a zip stream
                recipe_stream = StringIO()
                filename, data = self.get_file_from_recipe(recipe)
                recipe_stream.write(data)
                export_zip_obj.writestr(f'{recipe.name}/{filename}', recipe_stream.getvalue())
                recipe_stream.close()

            el.exported_recipes += 1
            el.msg += self.get_recipe_processed_msg(recipe)
            el.save()

        export_zip_obj.close()

        # returns a [[file name, zip stream data]]
        # self.get_export_file_name is an inherited from the Integration class and doesn't require definition
        return [[self.get_export_file_name(), export_zip_stream.getvalue()]]
