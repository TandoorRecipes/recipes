from datetime import datetime

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils.translation import ngettext
from django_tables2 import RequestConfig

from cookbook.forms import SyncForm, BatchEditForm
from cookbook.models import *
from cookbook.tables import SyncTable


@login_required
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


@login_required
def sync_wait(request):
    return render(request, 'batch/waiting.html')


@login_required
def batch_import(request):
    imports = RecipeImport.objects.all()
    for new_recipe in imports:
        recipe = Recipe(name=new_recipe.name, path=new_recipe.path, storage=new_recipe.storage)
        recipe.save()
        new_recipe.delete()

    return redirect('list_import')


@login_required
def batch_edit(request):
    if request.method == "POST":
        form = BatchEditForm(request.POST)
        if form.is_valid():
            word = form.cleaned_data['search']
            category = form.cleaned_data['category']
            keywords = form.cleaned_data['keywords']

            recipes = Recipe.objects.filter(name__contains=word)
            count = 0
            for recipe in recipes:
                edit = False
                if category is not None:
                    recipe.category = category
                    edit = True
                if keywords.__sizeof__() > 0:
                    recipe.keywords.add(*list(keywords))
                    edit = True
                if edit:
                    count = count + 1

                recipe.save()

            msg = ngettext(
                'Batch edit done. %(count)d recipe where updated.',
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


@login_required
def statistics(request):
    counts = Object()
    counts.recipes = Recipe.objects.count()
    counts.categories = Category.objects.count()
    counts.keywords = Keyword.objects.count()
    counts.recipe_import = RecipeImport.objects.count()

    counts.recipes_no_category = Recipe.objects.filter(category__isnull=True).count()
    counts.recipes_no_keyword = Recipe.objects.filter(keywords=None).count()

    return render(request, 'stats.html', {'counts': counts})
