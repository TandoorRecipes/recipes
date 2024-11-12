import datetime
import traceback
import uuid
from io import BytesIO
from zipfile import BadZipFile, ZipFile

from bs4 import Tag
from django.core.cache import cache
from django.core.exceptions import ObjectDoesNotExist
from django.core.files import File
from django.db import IntegrityError
from django.http import HttpResponse
from django.utils.formats import date_format
from django.utils.translation import gettext as _
from django_scopes import scope
from lxml import etree

from cookbook.helper.image_processing import handle_image
from cookbook.models import Keyword, Recipe
from recipes.settings import DEBUG, EXPORT_FILE_CACHE_DURATION


class Integration:
    request = None
    keyword = None
    files = None
    export_type = None
    ignored_recipes = []

    def __init__(self, request, export_type):
        """
        Integration for importing and exporting recipes
        :param request: request context of import session (used to link user to created objects)
        """
        self.request = request
        self.export_type = export_type
        self.ignored_recipes = []

        description = f'Imported by {request.user.get_user_display_name()} at {date_format(datetime.datetime.now(), "DATETIME_FORMAT")}. Type: {export_type}'

        try:
            last_kw = Keyword.objects.filter(name__regex=r'^(Import [0-9]+)', space=request.space).latest('created_at')
            name = f'Import {int(last_kw.name.replace("Import ", "")) + 1}'
        except (ObjectDoesNotExist, ValueError):
            name = 'Import 1'

        parent, created = Keyword.objects.get_or_create(name='Import', space=request.space)
        try:
            self.keyword = parent.add_child(
                name=name,
                description=description,
                space=request.space
            )
        except (IntegrityError, ValueError):  # in case, for whatever reason, the name does exist append UUID to it. Not nice but works for now.
            self.keyword = parent.add_child(
                name=f'{name} {str(uuid.uuid4())[0:8]}',
                description=description,
                space=request.space
            )

    def do_export(self, recipes, el):

        with scope(space=self.request.space):
            el.total_recipes = len(recipes)
            el.cache_duration = EXPORT_FILE_CACHE_DURATION
            el.save()

            files = self.get_files_from_recipes(recipes, el, self.request.COOKIES)

            if len(files) == 1:
                filename, file = files[0]
                export_filename = filename
                export_file = file

            else:
                # zip the files if there is more then one file
                export_filename = self.get_export_file_name()
                export_stream = BytesIO()
                export_obj = ZipFile(export_stream, 'w')

                for filename, file in files:
                    export_obj.writestr(filename, file)

                export_obj.close()
                export_file = export_stream.getvalue()

            cache.set('export_file_' + str(el.pk), {'filename': export_filename, 'file': export_file}, EXPORT_FILE_CACHE_DURATION)
            el.running = False
            el.save()

        response = HttpResponse(export_file, content_type='application/force-download')
        response['Content-Disposition'] = 'attachment; filename="' + export_filename + '"'
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

    def do_import(self, files, il, import_duplicates):
        """
        Imports given files
        :param import_duplicates: if true duplicates are imported as well
        :param files: List of in memory files
        :param il: Import Log object to refresh while running
        :return: HttpResponseRedirect to the recipe search showing all imported recipes
        """
        with scope(space=self.request.space):

            try:
                self.files = files
                for f in files:
                    if 'RecipeKeeper' in f['name']:
                        import_zip = ZipFile(f['file'])
                        file_list = []
                        for z in import_zip.filelist:
                            if self.import_file_name_filter(z):
                                file_list.append(z)
                        il.total_recipes += len(file_list)

                        for z in file_list:
                            data_list = self.split_recipe_file(import_zip.read(z.filename).decode('utf-8'))
                            for d in data_list:
                                recipe = self.get_recipe_from_file(d)
                                recipe.keywords.add(self.keyword)
                                il.msg += self.get_recipe_processed_msg(recipe)
                                self.handle_duplicates(recipe, import_duplicates)
                                il.imported_recipes += 1
                                il.save()
                        import_zip.close()
                    elif '.zip' in f['name'] or '.paprikarecipes' in f['name'] or '.mcb' in f['name']:
                        import_zip = ZipFile(f['file'])
                        file_list = []
                        for z in import_zip.filelist:
                            if self.import_file_name_filter(z):
                                file_list.append(z)
                        il.total_recipes += len(file_list)

                        import cookbook
                        if isinstance(self, cookbook.integration.copymethat.CopyMeThat):
                            file_list = self.split_recipe_file(BytesIO(import_zip.read('recipes.html')))
                            il.total_recipes += len(file_list)

                        if isinstance(self, cookbook.integration.cookmate.Cookmate):
                            new_file_list = []
                            for file in file_list:
                                new_file_list += etree.parse(BytesIO(import_zip.read(file.filename))).getroot().getchildren()
                            il.total_recipes = len(new_file_list)
                            file_list = new_file_list

                        if isinstance(self, cookbook.integration.gourmet.Gourmet):
                            self.import_zip = import_zip
                            new_file_list = []
                            for file in file_list:
                                if file.file_size == 0:
                                    next
                                if file.filename.startswith("index.htm"):
                                    next
                                if file.filename.endswith(".htm"):
                                    new_file_list += self.split_recipe_file(BytesIO(import_zip.read(file.filename)))
                            il.total_recipes = len(new_file_list)
                            file_list = new_file_list

                        for z in file_list:
                            try:
                                if not hasattr(z, 'filename') or isinstance(z, Tag):
                                    recipe = self.get_recipe_from_file(z)
                                else:
                                    recipe = self.get_recipe_from_file(BytesIO(import_zip.read(z.filename)))
                                recipe.keywords.add(self.keyword)
                                il.msg += self.get_recipe_processed_msg(recipe)
                                self.handle_duplicates(recipe, import_duplicates)
                                il.imported_recipes += 1
                                il.save()
                            except Exception as e:
                                traceback.print_exc()
                                self.handle_exception(e, log=il, message=f'-------------------- \nERROR \n{e}\n--------------------\n')
                        import_zip.close()
                    elif '.json' in f['name'] or '.xml' in f['name'] or '.txt' in f['name'] or '.mmf' in f['name'] or '.rk' in f['name'] or '.melarecipe' in f['name']:
                        data_list = self.split_recipe_file(f['file'])
                        il.total_recipes += len(data_list)
                        for d in data_list:
                            try:
                                recipe = self.get_recipe_from_file(d)
                                recipe.keywords.add(self.keyword)
                                il.msg += self.get_recipe_processed_msg(recipe)
                                self.handle_duplicates(recipe, import_duplicates)
                                il.imported_recipes += 1
                                il.save()
                            except Exception as e:
                                self.handle_exception(e, log=il, message=f'-------------------- \nERROR \n{e}\n--------------------\n')
                    elif '.rtk' in f['name']:
                        import_zip = ZipFile(f['file'])
                        for z in import_zip.filelist:
                            if self.import_file_name_filter(z):
                                data_list = self.split_recipe_file(import_zip.read(z.filename).decode('utf-8'))
                                il.total_recipes += len(data_list)

                                for d in data_list:
                                    try:
                                        recipe = self.get_recipe_from_file(d)
                                        recipe.keywords.add(self.keyword)
                                        il.msg += self.get_recipe_processed_msg(recipe)
                                        self.handle_duplicates(recipe, import_duplicates)
                                        il.imported_recipes += 1
                                        il.save()
                                    except Exception as e:
                                        self.handle_exception(e, log=il, message=f'-------------------- \nERROR \n{e}\n--------------------\n')
                        import_zip.close()
                    else:
                        recipe = self.get_recipe_from_file(f['file'])
                        recipe.keywords.add(self.keyword)
                        il.msg += self.get_recipe_processed_msg(recipe)
                        self.handle_duplicates(recipe, import_duplicates)
            except BadZipFile:
                il.msg += 'ERROR ' + _(
                    'Importer expected a .zip file. Did you choose the correct importer type for your data ?') + '\n'
            except Exception as e:
                msg = 'ERROR ' + _(
                    'An unexpected error occurred during the import. Please make sure you have uploaded a valid file.') + '\n'
                self.handle_exception(e, log=il, message=msg)

            if len(self.ignored_recipes) > 0:
                il.msg += '\n' + _(
                    'The following recipes were ignored because they already existed:') + ' ' + ', '.join(
                    self.ignored_recipes) + '\n\n'

            il.keyword = self.keyword
            il.msg += (_('Imported %s recipes.') % Recipe.objects.filter(keywords=self.keyword).count()) + '\n'
            il.running = False
            il.save()

    def handle_duplicates(self, recipe, import_duplicates):
        """
        Checks if a recipe is already present, if so deletes it
        :param recipe: Recipe object
        :param import_duplicates: if duplicates should be imported
        """
        if Recipe.objects.filter(space=self.request.space, name=recipe.name).count() > 1 and not import_duplicates:
            self.ignored_recipes.append(recipe.name)
            recipe.delete()

    def import_recipe_image(self, recipe, image_file, filetype='.jpeg'):
        """
        Adds an image to a recipe naming it correctly
        :param recipe: Recipe object
        :param image_file: ByteIO stream containing the image
        :param filetype: type of file to write bytes to, default to .jpeg if unknown
        """
        recipe.image = File(handle_image(self.request, File(image_file, name='image'), filetype=filetype), name=f'{uuid.uuid4()}_{recipe.pk}{filetype}')
        recipe.save()

    def get_recipe_from_file(self, file):
        """
        Takes any file like object and converts it into a recipe
        :param file: ByteIO or any file like object, depends on provider
        :return: Recipe object
        """
        raise NotImplementedError('Method not implemented in integration')

    def split_recipe_file(self, file):
        """
        Takes a file that contains multiple recipes and splits it into a list of strings of various formats (e.g. json, text, ..)
        :param file: ByteIO or any file like object, depends on provider
        :return: list of strings
        """
        raise NotImplementedError('Method not implemented in integration')

    def get_file_from_recipe(self, recipe):
        """
        Takes a recipe object and converts it to a string (depending on the format)
        returns both the filename of the exported file and the file contents
        :param recipe: Recipe object that should be converted
        :returns:
            - name - file name in export
            - data - string content for file to get created in export zip
        """
        raise NotImplementedError('Method not implemented in integration')

    def get_files_from_recipes(self, recipes, el, cookie):
        """
        Takes a list of recipe object and converts it to a array containing each file.
        Each file is represented as an array [filename, data] where data is a string of the content of the file.
        :param recipe: Recipe object that should be converted
        :returns:
            [[filename, data], ...]
        """
        raise NotImplementedError('Method not implemented in integration')

    @staticmethod
    def handle_exception(exception, log=None, message=''):
        if log:
            if message:
                log.msg += message
            else:
                log.msg += exception.msg
        if DEBUG:
            traceback.print_exc()

    def get_export_file_name(self, format='zip'):
        return "export_{}.{}".format(datetime.datetime.now().strftime("%Y-%m-%d"), format)

    def get_recipe_processed_msg(self, recipe):
        return f'{recipe.pk} - {recipe.name} \n'
