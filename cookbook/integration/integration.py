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
