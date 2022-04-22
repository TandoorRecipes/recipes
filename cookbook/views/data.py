from datetime import datetime

from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.translation import gettext as _
from django.utils.translation import ngettext
from django_tables2 import RequestConfig
from rest_framework.authtoken.models import Token

from cookbook.forms import BatchEditForm, SyncForm
from cookbook.helper.permission_helper import group_required, has_group_permission, above_space_limit
from cookbook.models import (Comment, Food, Keyword, Recipe, RecipeImport, Sync,
                             Unit, UserPreference, BookmarkletImport)
from cookbook.tables import SyncTable
from recipes import settings


@group_required('user')
def sync(request):
    limit, msg = above_space_limit(request.space)
    if limit:
        messages.add_message(request, messages.WARNING, msg)
        return HttpResponseRedirect(reverse('index'))

    if request.space.demo or settings.HOSTED:
        messages.add_message(request, messages.ERROR, _('This feature is not yet available in the hosted version of tandoor!'))
        return redirect('index')

    if request.method == "POST":
        if not has_group_permission(request.user, ['admin']):
            messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('data_sync'))
        form = SyncForm(request.POST, space=request.space)
        if form.is_valid():
            new_path = Sync()
            new_path.path = form.cleaned_data['path']
            new_path.storage = form.cleaned_data['storage']
            new_path.last_checked = datetime.now()
            new_path.space = request.space
            new_path.save()
            return redirect('data_sync')
    else:
        form = SyncForm(space=request.space)

    monitored_paths = SyncTable(Sync.objects.filter(space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@group_required('user')
def sync_wait(request):
    return render(request, 'batch/waiting.html')


@group_required('user')
def batch_import(request):
    imports = RecipeImport.objects.filter(space=request.space).all()
    for new_recipe in imports:
        recipe = Recipe(
            name=new_recipe.name,
            file_path=new_recipe.file_path,
            storage=new_recipe.storage,
            file_uid=new_recipe.file_uid,
            created_by=request.user,
            space=request.space
        )
        recipe.save()
        new_recipe.delete()

    return redirect('list_recipe_import')


@group_required('user')
def batch_edit(request):
    if request.method == "POST":
        form = BatchEditForm(request.POST, space=request.space)
        if form.is_valid():
            word = form.cleaned_data['search']
            keywords = form.cleaned_data['keywords']

            recipes = Recipe.objects.filter(name__icontains=word, space=request.space)
            count = 0
            for recipe in recipes:
                edit = False
                if keywords.__sizeof__() > 0:
                    recipe.keywords.add(*list(keywords))
                    edit = True
                if edit:
                    count = count + 1

                recipe.save()

            msg = ngettext(
                'Batch edit done. %(count)d recipe was updated.',
                'Batch edit done. %(count)d Recipes where updated.',
                count) % {
                'count': count,
            }
            messages.add_message(request, messages.SUCCESS, msg)

            return redirect('data_batch_edit')
    else:
        form = BatchEditForm(space=request.space)

    return render(request, 'batch/edit.html', {'form': form})


@group_required('user')
def import_url(request):
    limit, msg = above_space_limit(request.space)
    if limit:
        messages.add_message(request, messages.WARNING, msg)
        return HttpResponseRedirect(reverse('index'))

    if (api_token := Token.objects.filter(user=request.user).first()) is None:
        api_token = Token.objects.create(user=request.user)

    bookmarklet_import_id = -1
    if 'id' in request.GET:
        if bookmarklet_import := BookmarkletImport.objects.filter(id=request.GET['id']).first():
            bookmarklet_import_id = bookmarklet_import.pk

    return render(request, 'url_import.html', {'api_token': api_token, 'bookmarklet_import_id': bookmarklet_import_id})


class Object(object):
    pass


@group_required('user')
def statistics(request):
    counts = Object()
    counts.recipes = Recipe.objects.filter(space=request.space).count()
    counts.keywords = Keyword.objects.filter(space=request.space).count()
    counts.recipe_import = RecipeImport.objects.filter(space=request.space).count()
    counts.units = Unit.objects.filter(space=request.space).count()
    counts.ingredients = Food.objects.filter(space=request.space).count()
    counts.comments = Comment.objects.filter(recipe__space=request.space).count()

    counts.recipes_internal = Recipe.objects.filter(internal=True, space=request.space).count()
    counts.recipes_external = counts.recipes - counts.recipes_internal

    counts.recipes_no_keyword = Recipe.objects.filter(keywords=None, space=request.space).count()

    return render(request, 'stats.html', {'counts': counts})
