from django.contrib import messages
from django.http import HttpResponse
from django.utils.translation import gettext as _
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from cookbook.models import Recipe
from cookbook.helper import dropbox


@login_required
def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if recipe.link == "":
        response = dropbox.get_share_link(recipe.path)  # TODO response validation
        recipe.link = response['url']
        recipe.save()

    return HttpResponse(recipe.link)


@login_required
def dropbox_sync(request):
    ret = dropbox.sync_all()
    if ret:
        messages.add_message(request, messages.SUCCESS, _('Sync successful!'))
        return redirect('batch_import')
    else:
        messages.add_message(request, messages.ERROR, _('Error synchronizing with Storage'))
        return redirect('batch_monitor')
