from django.http import HttpResponse

from cookbook.models import Recipe
from cookbook.helper import dropbox


def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if recipe.link == "":
        response = dropbox.get_share_link(recipe.path)  # TODO response validation
        recipe.link = response['url']
        recipe.save()

    return HttpResponse(recipe.link)
