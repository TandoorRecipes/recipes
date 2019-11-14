from django.contrib import messages
from django.http import HttpResponse
from django.urls import reverse
from django.utils.translation import gettext as _
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from cookbook.models import Recipe, Sync, Storage
from cookbook.provider import dropbox
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


@login_required
def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)

    if recipe.instructions:
        return HttpResponse(reverse('view_recipe', args=[recipe_id]))
    if recipe.storage.method == Storage.DROPBOX:
        if recipe.link == "":
            recipe.link = Dropbox.get_share_link(recipe)  # TODO response validation
            recipe.save()
    if recipe.storage.method == Storage.NEXTCLOUD:
        if recipe.link == "":
            recipe.link = Nextcloud.get_share_link(recipe)  # TODO response validation
            recipe.save()

    return HttpResponse(recipe.link)


@login_required
def sync_all(request):
    monitors = Sync.objects.filter(active=True)

    error = False
    for monitor in monitors:
        if monitor.storage.method == Storage.DROPBOX:
            ret = Dropbox.import_all(monitor)
            if not ret:
                error = True
        if monitor.storage.method == Storage.NEXTCLOUD:
            ret = Nextcloud.import_all(monitor)
            if not ret:
                error = True

    if not error:
        messages.add_message(request, messages.SUCCESS, _('Sync successful!'))
        return redirect('list_import')
    else:
        messages.add_message(request, messages.ERROR, _('Error synchronizing with Storage'))
        return redirect('list_import')
