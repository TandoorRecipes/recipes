from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django_tables2 import RequestConfig

from cookbook.filters import RecipeFilter
from cookbook.forms import *
from cookbook.tables import RecipeTable


def index(request):
    if request.user.is_authenticated:
        f = RecipeFilter(request.GET, queryset=Recipe.objects.all())

        table = RecipeTable(f.qs)
        RequestConfig(request, paginate={'per_page': 25}).configure(table)

        return render(request, 'index.html', {'recipes': table, 'filter': f})
    else:
        return render(request, 'index.html')


@login_required
def recipe_view(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    return render(request, 'recipe_view.html', {'recipe': recipe})


def test(request):
    return render(request, 'test.html')
