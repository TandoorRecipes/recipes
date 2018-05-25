from datetime import datetime

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django_tables2 import RequestConfig

from cookbook.forms import SyncForm, BatchEditForm, RecipeImport
from cookbook.models import Recipe, Category, Sync
from cookbook.tables import SyncTable
from django.utils.translation import gettext as _, ngettext


@login_required
def batch_monitor(request):
    if request.method == "POST":
        form = SyncForm(request.POST)
        if form.is_valid():
            new_path = Sync()
            new_path.path = form.cleaned_data['path']
            new_path.storage = form.cleaned_data['storage']
            new_path.last_checked = datetime.now()
            new_path.save()
            return redirect('batch_monitor')
    else:
        form = SyncForm()

    monitored_paths = SyncTable(Sync.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@login_required
def sync_wait(request):
    return render(request, 'batch/waiting.html')


@login_required
def batch_import_all(request):
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
            keyword = form.cleaned_data['keyword']

            recipes = Recipe.objects.filter(name__contains=word)
            count = 0
            for recipe in recipes:
                edit = False
                if category is not None:
                    recipe.category = Category.objects.get(name=category)
                    edit = True
                if keyword.__sizeof__() > 0:
                    recipe.keywords.add(*list(keyword))
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

            return redirect('batch_edit')
    else:
        form = BatchEditForm()

    return render(request, 'batch/edit.html', {'form': form})
