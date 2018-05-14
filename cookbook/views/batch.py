from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django_tables2 import RequestConfig

from cookbook.forms import MonitorForm, BatchEditForm, RecipeImport
from cookbook.models import Recipe, Category, Sync
from cookbook.tables import MonitoredPathTable


@login_required
def batch_monitor(request):
    if request.method == "POST":
        form = MonitorForm(request.POST)
        if form.is_valid():
            new_path = Sync()
            new_path.path = form.cleaned_data['path']
            new_path.last_checked = datetime.now()
            new_path.save()
            return redirect('batch_monitor')
    else:
        form = MonitorForm()

    monitored_paths = MonitoredPathTable(Sync.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@login_required
def batch_import_all(request):
    imports = RecipeImport.objects.all()
    for new_recipe in imports:
        recipe = Recipe(name=new_recipe.name, path=new_recipe.path)
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
            for recipe in recipes:
                if category is not None:
                    recipe.category = Category.objects.get(name=category)
                if keyword.__sizeof__() > 0:
                    recipe.keywords.add(*list(keyword))

                recipe.save()

            return redirect('batch_edit')
    else:
        form = BatchEditForm()

    return render(request, 'batch/edit.html', {'form': form})
