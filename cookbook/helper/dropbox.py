import os
import requests
import json
from django.conf import settings

from cookbook.models import Recipe, Category


def import_all(base_path):
    url = "https://api.dropboxapi.com/2/files/list_folder"

    headers = {
        "Authorization": "Bearer " + settings.DROPBOX_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "path": base_path
    }

    r = requests.post(url, headers=headers, data=json.dumps(data))
    try:
        recipes = r.json()
    except ValueError:
        return r

    for recipe in recipes['entries']:
        name = os.path.splitext(recipe['name'])[0]
        insert = Recipe(name=name, path=recipe['path_lower'], category=Category.objects.get(id=0))
        insert.save()

    return True


def get_share_link(recipe_path):
    url = "https://api.dropboxapi.com/2/sharing/create_shared_link"

    headers = {
        "Authorization": "Bearer " + settings.DROPBOX_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "path": recipe_path
    }

    r = requests.post(url, headers=headers, data=json.dumps(data))
    return r.json()
