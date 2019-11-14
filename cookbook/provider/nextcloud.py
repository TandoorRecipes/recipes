import os
from datetime import datetime
import json
import webdav3.client as wc
import requests
import xmltodict

from requests.auth import HTTPBasicAuth

from cookbook.models import Recipe, RecipeImport, SyncLog
from cookbook.provider.provider import Provider


class Nextcloud(Provider):

    @staticmethod
    def import_all(monitor):
        options = {
            'webdav_hostname': monitor.storage.url + '/remote.php/dav/files/' + monitor.storage.username,
            'webdav_login': monitor.storage.username,
            'webdav_password': monitor.storage.password
        }
        client = wc.Client(options)

        files = client.list(monitor.path)
        files.pop(0)  # remove first element because its the folder itself

        import_count = 0
        for file in files:
            path = monitor.path + '/' + file
            if not Recipe.objects.filter(file_path=path).exists() and not RecipeImport.objects.filter(file_path=path).exists():
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
    def url_from_ocs_response(response):
        if response['ocs']['data']:
            elements = response['ocs']['data']['element']
            if isinstance(elements, list):
                for element in elements:
                    if element['share_type'] == '3':
                        return element['url']
            else:
                if elements['share_type'] == '3':
                    return elements['url']

        return False

    @staticmethod
    def create_share_link(recipe):
        url = recipe.storage.url + '/ocs/v2.php/apps/files_sharing/api/v1/shares'

        headers = {
            "OCS-APIRequest": "true",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        data = {
            "path": recipe.file_path,
            "shareType ": 3
        }

        r = requests.post(url, headers=headers, auth=HTTPBasicAuth(recipe.storage.username, recipe.storage.password), data=json.dumps(data))

        json_response = xmltodict.parse(r.text)

        return Nextcloud.url_from_ocs_response(json_response)

    @staticmethod
    def get_share_link(recipe):
        url = recipe.storage.url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?path=' + recipe.file_path

        headers = {
            "OCS-APIRequest": "true",
            "Content-Type": "application/xml"
        }

        r = requests.get(url, headers=headers, auth=HTTPBasicAuth(recipe.storage.username, recipe.storage.password))

        json_response = xmltodict.parse(r.text)

        url = Nextcloud.url_from_ocs_response(json_response)
        if url:
            return url

        return Nextcloud.create_share_link(recipe)
