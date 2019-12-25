import os
from datetime import datetime
import webdav3.client as wc
import requests

from requests.auth import HTTPBasicAuth

from cookbook.models import Recipe, RecipeImport, SyncLog
from cookbook.provider.provider import Provider


class Nextcloud(Provider):

    @staticmethod
    def get_client(storage):
        options = {
            'webdav_hostname': storage.url + '/remote.php/dav/files/' + storage.username,
            'webdav_login': storage.username,
            'webdav_password': storage.password
        }
        return wc.Client(options)

    @staticmethod
    def import_all(monitor):
        client = Nextcloud.get_client(monitor.storage)

        files = client.list(monitor.path)
        files.pop(0)  # remove first element because its the folder itself

        import_count = 0
        for file in files:
            path = monitor.path + '/' + file
            if not Recipe.objects.filter(file_path=path).exists() and not RecipeImport.objects.filter(
                    file_path=path).exists():
                name = os.path.splitext(file)[0]
                new_recipe = RecipeImport(name=name, file_path=path, storage=monitor.storage)
                new_recipe.save()
                import_count += 1

        log_entry = SyncLog(status='SUCCESS', msg='Imported ' + str(import_count) + ' recipes', sync=monitor)
        log_entry.save()

        monitor.last_checked = datetime.now()
        monitor.save()

        return True

    @staticmethod
    def create_share_link(recipe):
        url = recipe.storage.url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'

        headers = {
            "OCS-APIRequest": "true",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        data = {'path': recipe.file_path, 'shareType': 3}

        r = requests.post(url, headers=headers, auth=HTTPBasicAuth(recipe.storage.username, recipe.storage.password),
                          data=data)

        response_json = r.json()

        return response_json['ocs']['data']['url']

    @staticmethod
    def get_share_link(recipe):
        url = recipe.storage.url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json&path=' + recipe.file_path

        headers = {
            "OCS-APIRequest": "true",
            "Content-Type": "application/json"
        }

        r = requests.get(url, headers=headers, auth=HTTPBasicAuth(recipe.storage.username, recipe.storage.password))

        response_json = r.json()
        for element in response_json['ocs']['data']:
            if element['share_type'] == '3':
                return element['url']

        return Nextcloud.create_share_link(recipe)

    @staticmethod
    def rename_file(recipe, new_name):
        client = Nextcloud.get_client(recipe.storage)

        client.move(recipe.file_path,
                    os.path.dirname(recipe.file_path) + '/' + new_name + os.path.splitext(recipe.file_path)[1])

        return True

    @staticmethod
    def delete_file(recipe):
        client = Nextcloud.get_client(recipe.storage)

        client.clean(recipe.file_path)

        return True
