import datetime
import uuid

from io import BytesIO, StringIO
from zipfile import ZipFile

from django.core.files import File
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse

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
        export_zip_stream = BytesIO()
        export_zip_obj = ZipFile(export_zip_stream, 'w')

        for r in recipes:
            if r.internal:
                recipe_zip_stream = BytesIO()
                recipe_zip_obj = ZipFile(recipe_zip_stream, 'w')

                recipe_stream = StringIO()
                filename, data = self.get_file_from_recipe(r)
                recipe_stream.write(data)
                recipe_zip_obj.writestr(filename, recipe_stream.getvalue())
                recipe_stream.close()

                try:
                    recipe_zip_obj.write(r.image.path, 'image.png')
                except ValueError:
                    pass

                recipe_zip_obj.close()
                export_zip_obj.writestr(str(r.pk) + '.zip', recipe_zip_stream.getvalue())

        export_zip_obj.close()

        response = HttpResponse(export_zip_stream.getvalue(), content_type='application/force-download')
        response['Content-Disposition'] = 'attachment; filename="export.zip"'
        return response

    def do_import(self, files):
        for f in files:
            import_zip = ZipFile(f.file)
            for z in import_zip.namelist():
                recipe = self.get_recipe_from_file(BytesIO(import_zip.read(z)))
                recipe.keywords.add(self.keyword)

        return HttpResponseRedirect(reverse('view_search') + '?keywords=' + str(self.keyword.pk))

    @staticmethod
    def import_recipe_image(recipe, image_file):
        recipe.image = File(image_file, name=f'{uuid.uuid4()}_{recipe.pk}.png')
        recipe.save()

    def get_recipe_from_file(self, file):
        raise Exception('Method not implemented in storage integration')

    def get_file_from_recipe(self, recipe):
        raise Exception('Method not implemented in storage integration')
