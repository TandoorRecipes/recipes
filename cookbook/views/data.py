from datetime import datetime

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils.translation import ngettext
from django_tables2 import RequestConfig

from cookbook.forms import SyncForm, BatchEditForm
from cookbook.helper.permission_helper import group_required
from cookbook.models import *
from cookbook.tables import SyncTable


@group_required('user')
def sync(request):
    if request.method == "POST":
        form = SyncForm(request.POST)
        if form.is_valid():
            new_path = Sync()
            new_path.path = form.cleaned_data['path']
            new_path.storage = form.cleaned_data['storage']
            new_path.last_checked = datetime.now()
            new_path.save()
            return redirect('data_sync')
    else:
        form = SyncForm()

    monitored_paths = SyncTable(Sync.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@group_required('user')
def sync_wait(request):
    return render(request, 'batch/waiting.html')


@group_required('user')
def batch_import(request):
    imports = RecipeImport.objects.all()
    for new_recipe in imports:
        recipe = Recipe(name=new_recipe.name, file_path=new_recipe.file_path, storage=new_recipe.storage, file_uid=new_recipe.file_uid, created_by=request.user)
        recipe.save()
        new_recipe.delete()

    return redirect('list_recipe_import')


@group_required('user')
def batch_edit(request):
    if request.method == "POST":
        form = BatchEditForm(request.POST)
        if form.is_valid():
            word = form.cleaned_data['search']
            keywords = form.cleaned_data['keywords']

            recipes = Recipe.objects.filter(name__icontains=word)
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
        form = BatchEditForm()

    return render(request, 'batch/edit.html', {'form': form})


class Object(object):
    pass


@group_required('user')
def statistics(request):
    counts = Object()
    counts.recipes = Recipe.objects.count()
    counts.keywords = Keyword.objects.count()
    counts.recipe_import = RecipeImport.objects.count()
    counts.units = Unit.objects.count()
    counts.ingredients = Ingredient.objects.count()
    counts.comments = Comment.objects.count()

    counts.recipes_internal = Recipe.objects.filter(internal=True).count()
    counts.recipes_external = counts.recipes - counts.recipes_internal

    counts.recipes_no_keyword = Recipe.objects.filter(keywords=None).count()

    return render(request, 'stats.html', {'counts': counts})
