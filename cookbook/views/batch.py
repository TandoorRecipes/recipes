from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django_tables2 import RequestConfig

from cookbook.forms import MonitorForm, BatchEditForm, NewRecipe
from cookbook.models import Recipe, Category, Monitor
from cookbook.tables import MonitoredPathTable, NewRecipeTable


@login_required
def batch_monitor(request):
    if request.method == "POST":
        form = MonitorForm(request.POST)
        if form.is_valid():
            new_path = Monitor()
            new_path.path = form.cleaned_data['path']
            new_path.last_checked = datetime.now()
            new_path.save()
            return redirect('batch_import')
    else:
        form = MonitorForm()

    monitored_paths = MonitoredPathTable(Monitor.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@login_required
def batch_import(request):
    imported_recipes = NewRecipeTable(NewRecipe.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(imported_recipes)

    return render(request, 'batch/import.html', {'imported_recipes': imported_recipes})


@login_required
def batch_import_all(request):
    if request.method == "POST":
        imports = NewRecipe.objects.all()
        for new_recipe in imports:
            recipe = Recipe(name=new_recipe.name, path=new_recipe.path, category=(Category.objects.get(id=0)))
            recipe.save()
            new_recipe.delete()

    return redirect('batch_import')


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
