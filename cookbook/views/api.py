from django.http import HttpResponse
import json

from cookbook.models import Recipe
from cookbook.helper import dropbox


def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    response = dropbox.get_share_link(recipe.path)
    return HttpResponse(response['url'])
