from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext as _
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect

from cookbook.models import Recipe, Sync, Storage
from cookbook.helper import dropbox


@login_required
def get_file_link(request, recipe_id):
    recipe = Recipe.objects.get(id=recipe_id)

    if recipe.instructions:
        return HttpResponse(reverse('view_recipe', args=[recipe_id]))
    if recipe.storage.method == Storage.DROPBOX:
        if recipe.link == "":
            recipe.link = dropbox.get_share_link(recipe)  # TODO response validation
            recipe.save()

    return HttpResponse(recipe.link)


@login_required
def sync_all(request):
    monitors = Sync.objects.all()

    error = False
    for monitor in monitors:
        if monitor.storage.method == Storage.DROPBOX:
            ret = dropbox.import_all(monitor)
            if not ret:
                error = True

    if not error:
        messages.add_message(request, messages.SUCCESS, _('Sync successful!'))
        return redirect('list_import')
    else:
        messages.add_message(request, messages.ERROR, _('Error synchronizing with Storage'))
        return redirect('list_import')
