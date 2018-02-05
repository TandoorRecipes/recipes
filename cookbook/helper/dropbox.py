import requests
import json
from django.conf import settings

def import_all(base_path):
    print("test")


def get_share_link(recipe_path):
    url = "https://api.dropboxapi.com/2/sharing/create_shared_link"

    headers = {
        "Authorization": "Bearer " + settings.DROPBOX_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "path": recipe.path
    }

    r = requests.post(url, headers=headers, data=json.dumps(data))
    return r.content