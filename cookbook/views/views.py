from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django_tables2 import RequestConfig

from cookbook.filters import RecipeFilter
from cookbook.forms import *
from cookbook.helper import dropbox
from cookbook.tables import RecipeTable, CategoryTable, KeywordTable


def index(request):
    if request.user.is_authenticated:
        f = RecipeFilter(request.GET, queryset=Recipe.objects.all())

        table = RecipeTable(f.qs)
        RequestConfig(request, paginate={'per_page': 25}).configure(table)

        return render(request, 'index.html', {'recipes': table, 'filter': f})
    else:
        return render(request, 'index.html')


def test(request):
    return render(request, 'test.html')
