from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django_tables2 import RequestConfig
from django.utils.translation import gettext as _

from cookbook.models import Category, Keyword
from cookbook.tables import CategoryTable, KeywordTable


@login_required
def category_list(request):
    table = CategoryTable(Category.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Category"), 'table': table})


@login_required
def keyword_list(request):
    table = KeywordTable(Keyword.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(table)

    return render(request, 'generic/list_template.html', {'title': _("Keyword"), 'table': table})
