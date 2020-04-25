import json

from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from cookbook.forms import ExportForm, ImportForm
from cookbook.models import RecipeIngredient, Recipe, Unit, Ingredient


def import_recipe(request):
    if request.method == "POST":
        form = ImportForm(request.POST)
        if form.is_valid():
            data = json.loads(form.cleaned_data['recipe'])

            recipe = Recipe.objects.create(name=data['recipe']['name'], instructions=data['recipe']['instructions'],
                                           working_time=data['recipe']['working_time'], waiting_time=data['recipe']['waiting_time'],
                                           created_by=request.user, internal=True)

            for u in data['units']:
                try:
                    Unit.objects.create(name=u['name'], description=u['description']).save()
                except IntegrityError:
                    pass

            for i in data['ingredients']:
                try:
                    Ingredient.objects.create(name=i['name']).save()
                except IntegrityError:
                    pass

            for ri in data['recipe_ingredients']:
                RecipeIngredient.objects.create(recipe=recipe, ingredient=Ingredient.objects.get(name=ri['ingredient']),
                                                unit=Unit.objects.get(name=ri['unit']), amount=ri['amount'], note=ri['note'])

            messages.add_message(request, messages.SUCCESS, _('Recipe imported successfully!'))
            return HttpResponseRedirect(reverse_lazy('view_recipe', args=[recipe.pk]))
    else:
        form = ImportForm()

    return render(request, 'import.html', {'form': form})


def export_recipe(request):
    context = {}
    if request.method == "POST":
        form = ExportForm(request.POST)
        if form.is_valid():
            recipe = form.cleaned_data['recipe']
            if recipe.internal:
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
                form.add_error('recipe', _('External recipes cannot be exported, please share the file directly or select an internal recipe.'))
    else:
        form = ExportForm()

    context['form'] = form

    return render(request, 'export.html', context)
