import io
import os
import tempfile
from datetime import datetime

import requests
import webdav3.client as wc

from cookbook.helper.HelperFunctions import validate_import_url
from cookbook.models import Recipe, RecipeImport, SyncLog
from cookbook.provider.provider import Provider
from requests.auth import HTTPBasicAuth

from recipes.settings import DEBUG


class Nextcloud(Provider):

    @staticmethod
    def get_client(storage):
        options = {
            'webdav_hostname': storage.url,
            'webdav_login': storage.username,
            'webdav_password': storage.password,
            'webdav_root': '/remote.php/dav/files/' + storage.username
        }
        if storage.path != '':
            options['webdav_root'] = storage.path
        return wc.Client(options)

    @staticmethod
    def import_all(monitor):
        client = Nextcloud.get_client(monitor.storage)

        if DEBUG:
            print(f'TANDOOR_PROVIDER_DEBUG checking path  {monitor.path} with client {client}')

        files = client.list(monitor.path)

        if DEBUG:
            print(f'TANDOOR_PROVIDER_DEBUG file list  {files}')

        import_count = 0
        for file in files:
            if DEBUG:
                print(f'TANDOOR_PROVIDER_DEBUG importing file {file}')
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
    def create_share_link(recipe):
        url = recipe.storage.url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json'  # noqa: E501

        headers = {
            "OCS-APIRequest": "true",
            "Content-Type": "application/x-www-form-urlencoded"
        }

        data = {'path': recipe.file_path, 'shareType': 3}

        r = requests.post(url, headers=headers, auth=HTTPBasicAuth(recipe.storage.username, recipe.storage.password), data=data)

        response_json = r.json()

        return response_json['ocs']['data']['url']

    @staticmethod
    def get_share_link(recipe):
        url = recipe.storage.url + '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json&path=' + recipe.file_path  # noqa: E501

        headers = {
            "OCS-APIRequest": "true",
            "Content-Type": "application/json"
        }

        if validate_import_url(url):
            r = requests.get(
                url,
                headers=headers,
                auth=HTTPBasicAuth(
                    recipe.storage.username, recipe.storage.password
                )
            )

            response_json = r.json()
            for element in response_json['ocs']['data']:
                if element['share_type'] == '3':
                    return element['url']

            return Nextcloud.create_share_link(recipe)

    @staticmethod
    def get_file(recipe):
        client = Nextcloud.get_client(recipe.storage)

        tmp_file_path = tempfile.gettempdir() + '/' + recipe.name + '.pdf'

        client.download_file(
            remote_path=recipe.file_path,
            local_path=tmp_file_path
        )

        file = io.BytesIO(open(tmp_file_path, 'rb').read())
        os.remove(tmp_file_path)

        return file

    @staticmethod
    def rename_file(recipe, new_name):
        client = Nextcloud.get_client(recipe.storage)

        client.move(
            recipe.file_path,
            "%s/%s%s" % (
                os.path.dirname(recipe.file_path),
                new_name,
                os.path.splitext(recipe.file_path)[1]
            )
        )

        return True

    @staticmethod
    def delete_file(recipe):
        client = Nextcloud.get_client(recipe.storage)

        client.clean(recipe.file_path)

        return True
