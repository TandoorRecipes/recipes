import django_tables2 as tables

from .models import *


class RecipeTable(tables.Table):
    class Meta:
        model = Recipe
        template_name = 'tables/table_template.html'
        fields = ('name', 'category', 'all_tags')
