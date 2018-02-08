from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django_tables2 import RequestConfig

from cookbook.forms import CategoryForm, KeywordForm, RecipeForm
from cookbook.models import Category, Keyword
from cookbook.tables import CategoryTable, KeywordTable


@login_required
def recipe(request):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            recipe_obj = form.save(commit=False)
            recipe_obj.created_by = request.user.id
            recipe_obj.save()
            form.save_m2m()
            return redirect('index')
    else:
        form = RecipeForm()

    return render(request, 'new_recipe.html', {'form': form})


@login_required
def category(request):
    if request.method == "POST":
        form = CategoryForm(request.POST)
        if form.is_valid():
            category_obj = form.save(commit=False)
            category_obj.created_by = request.user.id
            category_obj.save()
            return redirect('new_category')
    else:
        form = CategoryForm()

    table = CategoryTable(Category.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'new_category.html', {'form': form, 'table': table})


@login_required
def keyword(request):
    if request.method == "POST":
        form = KeywordForm(request.POST)
        if form.is_valid():
            keyword_obj = form.save(commit=False)
            keyword_obj.created_by = request.user.id
            keyword_obj.save()
            return redirect('new_keyword')
    else:
        form = KeywordForm()

    table = KeywordTable(Keyword.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'new_keyword.html', {'form': form, 'table': table})
