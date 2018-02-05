import requests
import json
from .models import Recipe
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)

    url = "https://api.dropboxapi.com/2/sharing/create_shared_link"

    headers = {
        "Authorization": "Bearer " + settings.DROPBOX_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "path": ""
    }

    r = requests.post(url, headers=headers, data=json.dumps(data))
    return Response(r.content)
