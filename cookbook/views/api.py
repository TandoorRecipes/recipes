
from cookbook.models import Recipe
from cookbook.helper import dropbox
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    response = dropbox.get_share_link(recipe.path)

    return Response(response)