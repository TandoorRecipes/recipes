import os
from datetime import datetime

import requests
import json
from django.conf import settings

from cookbook.models import Recipe, Monitor, NewRecipe, ImportLog


def sync_all():
    monitors = Monitor.objects.all()

    for monitor in monitors:
        ret = import_all(monitor)
        if not ret:
            return ret

    return True


def import_all(monitor):
    url = "https://api.dropboxapi.com/2/files/list_folder"

    headers = {
        "Authorization": "Bearer " + settings.DROPBOX_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "path": monitor.path
    }

    r = requests.post(url, headers=headers, data=json.dumps(data))
    try:
        recipes = r.json()
    except ValueError:
        log_entry = ImportLog(status='ERROR', msg=str(r), monitor=monitor)
        log_entry.save()
        return r

    import_count = 0
    for recipe in recipes['entries']:
        path = recipe['path_lower']
        if not Recipe.objects.filter(path=path).exists() and not NewRecipe.objects.filter(path=path).exists():
            name = os.path.splitext(recipe['name'])[0]
            new_recipe = NewRecipe(name=name, path=path)
            new_recipe.save()
            import_count += 1

    log_entry = ImportLog(status='SUCCESS', msg='Imported ' + str(import_count) + ' recipes', monitor=monitor)
    log_entry.save()

    monitor.last_checked = datetime.now()
    monitor.save()

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
