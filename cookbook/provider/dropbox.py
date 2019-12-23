import os
from datetime import datetime

import requests
import json

from cookbook.models import Recipe, RecipeImport, SyncLog
from cookbook.provider.provider import Provider


class Dropbox(Provider):

    @staticmethod
    def import_all(monitor):
        url = "https://api.dropboxapi.com/2/files/list_folder"

        headers = {
            "Authorization": "Bearer " + monitor.storage.token,
            "Content-Type": "application/json"
        }

        data = {
            "path": monitor.path
        }

        r = requests.post(url, headers=headers, data=json.dumps(data))
        try:
            recipes = r.json()
        except ValueError:
            log_entry = SyncLog(status='ERROR', msg=str(r), monitor=monitor)
            log_entry.save()
            return r

        import_count = 0
        for recipe in recipes['entries']:  # TODO check if has_more is set and import that as well
            path = recipe['path_lower']
            if not Recipe.objects.filter(file_path=path).exists() and not RecipeImport.objects.filter(
                    file_path=path).exists():
                name = os.path.splitext(recipe['name'])[0]
                new_recipe = RecipeImport(name=name, file_path=path, storage=monitor.storage, file_uid=recipe['id'])
                new_recipe.save()
                import_count += 1

        log_entry = SyncLog(status='SUCCESS', msg='Imported ' + str(import_count) + ' recipes', sync=monitor)
        log_entry.save()

        monitor.last_checked = datetime.now()
        monitor.save()

        return True

    @staticmethod
    def create_share_link(recipe):
        url = "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings"

        headers = {
            "Authorization": "Bearer " + recipe.storage.token,
            "Content-Type": "application/json"
        }

        data = {
            "path": recipe.file_uid
        }

        r = requests.post(url, headers=headers, data=json.dumps(data))

        return r.json()

    @staticmethod
    def get_share_link(recipe):
        url = "https://api.dropboxapi.com/2/sharing/list_shared_links"

        headers = {
            "Authorization": "Bearer " + recipe.storage.token,
            "Content-Type": "application/json"
        }

        data = {
            "path": recipe.file_path,
        }

        r = requests.post(url, headers=headers, data=json.dumps(data))
        p = r.json()

        for l in p['links']:
            return l['url']

        response = Dropbox.create_share_link(recipe)
        return response['url']

    @staticmethod
    def rename_file(recipe, new_name):
        url = "https://api.dropboxapi.com/2/files/move_v2"

        headers = {
            "Authorization": "Bearer " + recipe.storage.token,
            "Content-Type": "application/json"
        }

        data = {
            "from_path": recipe.file_path,
            "to_path": os.path.dirname(recipe.file_path) + '/' + new_name + os.path.splitext(recipe.file_path)[1]
        }

        r = requests.post(url, headers=headers, data=json.dumps(data))

        return r.json()
