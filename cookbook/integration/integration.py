import datetime
import uuid

from io import BytesIO, StringIO
from zipfile import ZipFile, BadZipFile

from django.contrib import messages
from django.core.files import File
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.utils.formats import date_format
from django.utils.translation import gettext as _
from django_scopes import scope

from cookbook.models import Keyword, Recipe


class Integration:
    request = None
    keyword = None
    files = None

    def __init__(self, request):
        """
        Integration for importing and exporting recipes
        :param request: request context of import session (used to link user to created objects)
        """
        self.request = request
        self.keyword = Keyword.objects.create(
            name=f'Import {date_format(datetime.datetime.now(), "DATETIME_FORMAT")}.{datetime.datetime.now().strftime("%S")}',
            description=f'Imported by {request.user.get_user_name()} at {date_format(datetime.datetime.now(), "DATETIME_FORMAT")}',
            icon='📥',
            space=request.space
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
            if r.internal and r.space == self.request.space:
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

    def import_file_name_filter(self, zip_info_object):
        """
        Since zipfile.namelist() returns all files in all subdirectories this function allows filtering of files
        If false is returned the file will be ignored
        By default all files are included
        :param zip_info_object: ZipInfo object
        :return: Boolean if object should be included
        """
        return True

    def do_import(self, files):
        """
        Imports given files
        :param files: List of in memory files
        :return: HttpResponseRedirect to the recipe search showing all imported recipes
        """
        with scope(space=self.request.space):
            ignored_recipes = []
            try:
                self.files = files
                for f in files:
                    if '.zip' in f['name'] or '.paprikarecipes' in f['name']:
                        import_zip = ZipFile(f['file'])
                        for z in import_zip.filelist:
                            if self.import_file_name_filter(z):
                                recipe = self.get_recipe_from_file(BytesIO(import_zip.read(z.filename)))
                                recipe.keywords.add(self.keyword)
                                if duplicate := self.is_duplicate(recipe):
                                    ignored_recipes.append(duplicate)
                        import_zip.close()
                    else:
                        recipe = self.get_recipe_from_file(f['file'])
                        recipe.keywords.add(self.keyword)
                        if duplicate := self.is_duplicate(recipe):
                            ignored_recipes.append(duplicate)
            except BadZipFile:
                messages.add_message(self.request, messages.ERROR, _('Importer expected a .zip file. Did you choose the correct importer type for your data ?'))

            if len(ignored_recipes) > 0:
                messages.add_message(self.request, messages.WARNING, _('The following recipes were ignored because they already existed:') + ' ' + ', '.join(ignored_recipes))
            return HttpResponseRedirect(reverse('view_search') + '?keywords=' + str(self.keyword.pk))

    def is_duplicate(self, recipe):
        """
        Checks if a recipe is already present, if so deletes it
        :param recipe: Recipe object
        """
        if Recipe.objects.filter(space=self.request.space, name=recipe.name).count() > 1:
            recipe.delete()
            return recipe.name
        else:
            return None

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
