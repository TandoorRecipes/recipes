from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from cookbook.forms import *


def index(request):
    recipes = Recipe.objects.all()
    return render(request, 'index.html', {'recipes': recipes})


@login_required
def new_recipe(request):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            recipe = form.save(commit=False)
            recipe.created_by = request.user.id
            recipe.save()
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
