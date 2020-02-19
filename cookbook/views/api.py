from django.contrib import messages
from django.http import HttpResponse
from django.urls import reverse
from django.utils.translation import gettext as _
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from cookbook.models import Recipe, Sync, Storage
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


def update_recipe_links(recipe):
    if recipe.storage.method == Storage.DROPBOX:
        provider = Dropbox
    elif recipe.storage.method == Storage.NEXTCLOUD:
        provider = Nextcloud
    else:
        raise Exception('Provider not implemented')

    if not recipe.link:
        recipe.link = provider.get_share_link(recipe)  # TODO response validation in apis
    if not recipe.cors_link:
        try:
            recipe.cors_link = provider.get_cors_link(recipe)
        except Exception:
            pass

    recipe.save()


@login_required
def get_external_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if not recipe.link:
        update_recipe_links(recipe)

    return HttpResponse(recipe.link)


@login_required
def get_cors_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if not recipe.cors_link:
        update_recipe_links(recipe)

    return HttpResponse(recipe.cors_link)


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
