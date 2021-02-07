import os
import tempfile


class Integration:
    request = None

    def __init__(self, request):
        self.request = request

    def do_export(self, recipes):
        raise Exception('Method not implemented in storage integration')

    def do_import(self):
        raise Exception('Method not implemented in storage integration')

    def get_recipe(self, string):
        raise Exception('Method not implemented in storage integration')

    def get_export(self, recipe):
        raise Exception('Method not implemented in storage integration')

    def get_export_file(self, recipe):
        try:
            with open(recipe.image.path, 'rb') as img_f:
                return img_f
        except:
            return None

    def get_tmp_dir_path(self):
        path = os.path.join(tempfile.gettempdir(), 'recipe_io', str(self.request.user.pk))
        os.makedirs(path, exist_ok=True)
        return path

    def delete_temp_dir_path(self):
        os.remove(self.get_tmp_dir_path())
