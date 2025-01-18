import io
import os
from datetime import datetime
from os import listdir
from os.path import isfile, join

from cookbook.models import Recipe, RecipeImport, SyncLog
from cookbook.provider.provider import Provider


class Local(Provider):

    @staticmethod
    def import_all(monitor):
        if '/etc/' in monitor.path or '/root/' in monitor.path or '/mediafiles/' in monitor.path or '/usr/' in monitor.path:
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

        monitor.last_checked = datetime.now()
        monitor.save()

        return True

    @staticmethod
    def get_file(recipe):
        file = io.BytesIO(open(recipe.file_path, 'rb').read())

        return file

    @staticmethod
    def rename_file(recipe, new_name):
        os.rename(recipe.file_path, os.path.join(os.path.dirname(recipe.file_path), (new_name + os.path.splitext(recipe.file_path)[1])))

        return True

    @staticmethod
    def delete_file(recipe):
        os.remove(recipe.file_path)
        return True
