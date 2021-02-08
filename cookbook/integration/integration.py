import datetime

from cookbook.models import Keyword


class Integration:
    request = None
    keyword = None

    def __init__(self, request):
        self.request = request
        self.keyword = Keyword.objects.create(
            name=f'Import {datetime.datetime.now()}',
            description=f'Imported by {request.user.get_user_name()} on {datetime.datetime.now()}',
            icon='📥'
        )

    def do_export(self, recipes):
        raise Exception('Method not implemented in storage integration')

    def do_import(self, files):
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
