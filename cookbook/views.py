from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django_tables2 import RequestConfig
from cookbook.forms import *
from cookbook.tables import RecipeTable


def index(request):
    table = RecipeTable(Recipe.objects.all())
    RequestConfig(request, paginate={'per_page': 3}).configure(table)
    return render(request, 'index.html', {'recipes': table})


@login_required
def new_recipe(request):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            recipe = form.save(commit=False)
            recipe.created_by = request.user.id
            recipe.save()
            form.save_m2m()
            return redirect('index')
    else:
        form = RecipeForm()

    return render(request, 'new_recipe.html', {'form': form})


@login_required
def new_category(request):
    if request.method == "POST":
        form = CategoryForm(request.POST)
        if form.is_valid():
            category = form.save(commit=False)
            category.created_by = request.user.id
            category.save()
            return redirect('index')
    else:
        form = CategoryForm()

    return render(request, 'new_recipe.html', {'form': form})


@login_required
def new_keyword(request):
    if request.method == "POST":
        form = KeywordForm(request.POST)
        if form.is_valid():
            keyword = form.save(commit=False)
            keyword.created_by = request.user.id
            keyword.save()
            return redirect('index')
    else:
        form = KeywordForm()

    return render(request, 'new_keyword.html', {'form': form})
