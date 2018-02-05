from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django_tables2 import RequestConfig

from cookbook.filters import RecipeFilter
from cookbook.forms import *
from cookbook.tables import RecipeTable, CategoryTable, KeywordTable


def index(request):
    if request.user.is_authenticated:
        f = RecipeFilter(request.GET, queryset=Recipe.objects.all())

        table = RecipeTable(f.qs)
        RequestConfig(request, paginate={'per_page': 3}).configure(table)

        return render(request, 'index.html', {'recipes': table, 'filter': f})
    else:
        return render(request, 'index.html')


@login_required
def edit_recipe(request, recipe_id):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            recipe = form.save(commit=False)
            recipe.created_by = request.user.id
            recipe.save()
            form.save_m2m()
            return redirect('edit_recipe/' + recipe_id)
    else:
        recipe = Recipe.objects.get(id=recipe_id)
        form = EditRecipeForm(instance=recipe)

    return render(request, 'new_recipe.html', {'from': form})


@login_required
def edit_category(request, category_id):
    return render(request, 'index.html')


@login_required
def edit_keyword(request, keyword_id):
    return render(request, 'index.html')


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
            return redirect('new_category')
    else:
        form = CategoryForm()

    table = CategoryTable(Category.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'new_category.html', {'form': form, 'table': table})


@login_required
def new_keyword(request):
    if request.method == "POST":
        form = KeywordForm(request.POST)
        if form.is_valid():
            keyword = form.save(commit=False)
            keyword.created_by = request.user.id
            keyword.save()
            return redirect('new_keyword')
    else:
        form = KeywordForm()

    table = KeywordTable(Keyword.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'new_keyword.html', {'form': form, 'table': table})
