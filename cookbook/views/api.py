from django.contrib import messages
from django.http import HttpResponse, FileResponse
from django.urls import reverse
from django.utils.translation import gettext as _
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from cookbook.helper.permission_helper import group_required
from cookbook.models import Recipe, Sync, Storage
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


def get_recipe_provider(recipe):
    if recipe.storage.method == Storage.DROPBOX:
        return Dropbox
    elif recipe.storage.method == Storage.NEXTCLOUD:
        return Nextcloud
    else:
        raise Exception('Provider not implemented')


def update_recipe_links(recipe):
    if not recipe.link:
        recipe.link = get_recipe_provider(recipe).get_share_link(recipe)  # TODO response validation in apis

    recipe.save()


@group_required('user')
def get_external_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if not recipe.link:
        update_recipe_links(recipe)

    return HttpResponse(recipe.link)


@group_required('user')
def get_recipe_file(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)
    if not recipe.cors_link:
        update_recipe_links(recipe)

    return HttpResponse(get_recipe_provider(recipe).get_base64_file(recipe))


@group_required('user')
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
        return redirect('list_recipe_import')
    else:
        messages.add_message(request, messages.ERROR, _('Error synchronizing with Storage'))
        return redirect('list_recipe_import')
