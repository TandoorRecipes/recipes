import io
import os
from django.conf import settings
from django.utils import timezone
from os import listdir
from os.path import isfile, join

from cookbook.models import Recipe, RecipeImport, SyncLog
from cookbook.provider.provider import Provider


class Local(Provider):

    @staticmethod
    def import_all(monitor):
        if not Local.is_path_allowed(monitor.path):
            return False

        files = [f for f in listdir(monitor.path) if isfile(join(monitor.path, f))]

        import_count = 0
        for file in files:
            if file.endswith('.pdf') or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.jpeg') or file.endswith('.gif'):
                path = monitor.path + '/' + file
                if not Recipe.objects.filter(file_path__iexact=path, space=monitor.space).exists() and not RecipeImport.objects.filter(file_path=path, space=monitor.space).exists():
                    name = os.path.splitext(file)[0]
                    new_recipe = RecipeImport(
                        name=name,
                        file_path=path,
                        storage=monitor.storage,
                        space=monitor.space,
                    )
                    new_recipe.save()
                    import_count += 1

        log_entry = SyncLog(
            status='SUCCESS',
            msg='Imported ' + str(import_count) + ' recipes',
            sync=monitor,
        )
        log_entry.save()

        monitor.last_checked = timezone.now()
        monitor.save()

        return log_entry

    @staticmethod
    def get_file(recipe):
        if not Local.is_path_allowed(recipe.file_path):
            raise Exception('Path not allowed')

        file = io.BytesIO(open(recipe.file_path, 'rb').read())

        return file

    @staticmethod
    def is_path_allowed(path):
        normalized_path = os.path.normpath(os.path.abspath(path))
        for allowed_path in settings.LOCAL_STORAGE_PATHS:
            normalized_allowed_path = os.path.normpath(os.path.abspath(allowed_path))
            if normalized_path.startswith(normalized_allowed_path + os.sep) or normalized_path == normalized_allowed_path:
                return True
        return False

    @staticmethod
    def rename_file(recipe, new_name):
        if not Local.is_path_allowed(recipe.file_path):
            raise Exception('Path not allowed')
        os.rename(recipe.file_path, os.path.join(os.path.dirname(recipe.file_path), (new_name + os.path.splitext(recipe.file_path)[1])))

        return True

    @staticmethod
    def delete_file(recipe):
        if not Local.is_path_allowed(recipe.file_path):
            raise Exception('Path not allowed')
        os.remove(recipe.file_path)
        return True
