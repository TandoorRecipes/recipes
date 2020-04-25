import base64
import json
import re

from django.contrib import messages
from django.core.files.base import ContentFile
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy

from django.utils.translation import gettext as _
from cookbook.forms import ExportForm, ImportForm
from cookbook.models import RecipeIngredient, Recipe, Unit, Ingredient, Keyword


def import_recipe(request):
    if request.method == "POST":
        form = ImportForm(request.POST)
        if form.is_valid():
            data = json.loads(form.cleaned_data['recipe'])

            recipe = Recipe.objects.create(name=data['recipe']['name'], instructions=data['recipe']['instructions'],
                                           working_time=data['recipe']['working_time'], waiting_time=data['recipe']['waiting_time'],
                                           created_by=request.user, internal=True)

            for k in data['keywords']:
                try:
                    Keyword.objects.create(name=k['name'], icon=k['icon'], description=k['description']).save()
                except IntegrityError:
                    pass

                recipe.keywords.add(Keyword.objects.get(name=k['name']))

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

            if data['image']:
                fmt, img = data['image'].split(';base64,')
                ext = fmt.split('/')[-1]
                recipe.image = ContentFile(base64.b64decode(img), name=f'{recipe.pk}.{ext}')
                recipe.save()

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
                    'recipe_ingredients': [],
                    'keywords': [],
                    'image': None
                }

                for k in recipe.keywords.all():
                    export['keywords'].append({'name': k.name, 'icon': k.icon, 'description': k.description})

                for ri in RecipeIngredient.objects.filter(recipe=recipe).all():
                    if ri.unit not in export['units']:
                        export['units'].append({'name': ri.unit.name, 'description': ri.unit.description})
                    if ri.ingredient not in export['ingredients']:
                        export['ingredients'].append({'name': ri.ingredient.name})

                    export['recipe_ingredients'].append({'ingredient': ri.ingredient.name, 'unit': ri.unit.name, 'amount': float(ri.amount), 'note': ri.note})

                if recipe.image and form.cleaned_data['image']:
                    with open(recipe.image.path, 'rb') as img_f:
                        export['image'] = f'data:image/png;base64,{base64.b64encode(img_f.read()).decode("utf-8")}'

                if form.cleaned_data['download']:
                    response = HttpResponse(json.dumps(export), content_type='text/plain')
                    response['Content-Disposition'] = f'attachment; filename={recipe.name}.json'
                    return response

                context['export'] = json.dumps(export, indent=4)
            else:
                form.add_error('recipe', _('External recipes cannot be exported, please share the file directly or select an internal recipe.'))
    else:
        form = ExportForm()
        recipe = request.GET.get('r')
        if recipe:
            if re.match(r'^([0-9])+$', recipe):
                if recipe := Recipe.objects.filter(pk=int(recipe)).first():
                    form = ExportForm(initial={'recipe': recipe})

    context['form'] = form

    return render(request, 'export.html', context)
