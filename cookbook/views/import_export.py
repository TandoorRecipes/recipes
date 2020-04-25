import json

from django.core import serializers
from django.shortcuts import render

from cookbook.forms import ExportForm
from cookbook.models import Recipe, Ingredient, RecipeIngredient, Unit


def import_recipe(request):
    return render(request, 'import.html', {})


def export_recipe(request):
    # TODO filter internal only
    context = {}

    if request.method == "POST":
        form = ExportForm(request.POST)
        if form.is_valid():
            recipe = form.cleaned_data['recipe']

            export = {
                'recipe': {'name': recipe.name, 'instructions': recipe.instructions, 'working_time': recipe.working_time, 'waiting_time': recipe.working_time},
                'units': [],
                'ingredients': [],
                'recipe_ingredients': []
            }

            for ri in RecipeIngredient.objects.filter(recipe=recipe).all():
                if ri.unit not in export['units']:
                    export['units'].append({'name': ri.unit.name, 'description': ri.unit.description})
                if ri.ingredient not in export['ingredients']:
                    export['ingredients'].append({'name': ri.ingredient.name})

                export['recipe_ingredients'].append({'ingredient': ri.ingredient.name, 'unit': ri.unit.name, 'amount': float(ri.amount), 'note': ri.note})

            context['export'] = json.dumps(export, indent=4)
    else:
        form = ExportForm()

    context['form'] = form

    return render(request, 'export.html', context)
