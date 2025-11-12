from io import BytesIO, StringIO
from zipfile import ZipFile

from cookbook.integration.integration import Integration
from cookbook.models import Recipe


class Cooklang(Integration):

    def import_file_name_filter(self, file) -> bool:
        # check file extension, return True if extension is correct
        pass

    def get_recipe_from_file(self, file) -> Recipe:
        # Import Recipe Logic - convert information from file into Recipe() object
        pass

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
