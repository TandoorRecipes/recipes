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
        """
        Integration for importing and exporting recipes
        :param request: request context of import session (used to link user to created objects)
        """
        self.request = request
        self.keyword = Keyword.objects.create(
            name=f'Import {datetime.datetime.now()}',
            description=f'Imported by {request.user.get_user_name()} on {datetime.datetime.now()}',
            icon='📥'
        )

    def do_export(self, recipes):
        """
        Perform the export based on a list of recipes
        :param recipes: list of recipe objects
        :return: HttpResponse with a ZIP file that is directly downloaded
        """
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
        """
        Imports given files
        :param files: List of in memory files
        :return: HttpResponseRedirect to the recipe search showing all imported recipes
        """
        for f in files:
            import_zip = ZipFile(f.file)
            for z in import_zip.namelist():
                recipe = self.get_recipe_from_file(BytesIO(import_zip.read(z)))
                recipe.keywords.add(self.keyword)

        return HttpResponseRedirect(reverse('view_search') + '?keywords=' + str(self.keyword.pk))

    @staticmethod
    def import_recipe_image(recipe, image_file):
        """
        Adds an image to a recipe naming it correctly
        :param recipe: Recipe object
        :param image_file: ByteIO stream containing the image
        """
        recipe.image = File(image_file, name=f'{uuid.uuid4()}_{recipe.pk}.png')
        recipe.save()

    def get_recipe_from_file(self, file):
        """
        Takes any file like object and converts it into a recipe
        :param file: ByteIO or any file like object, depends on provider
        :return: Recipe object
        """
        raise NotImplementedError('Method not implemented in storage integration')

    def get_file_from_recipe(self, recipe):
        """
        Takes a recipe object and converts it to a string (depending on the format)
        returns both the filename of the exported file and the file contents
        :param recipe: Recipe object that should be converted
        :returns:
            - name - file name in export
            - data - string content for file to get created in export zip
        """
        raise NotImplementedError('Method not implemented in storage integration')
