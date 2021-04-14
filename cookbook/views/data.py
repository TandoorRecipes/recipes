import json
import uuid
from datetime import datetime
from io import BytesIO

import requests
from django.contrib import messages
from django.core.files import File
from django.db.transaction import atomic
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.translation import gettext as _
from django.utils.translation import ngettext
from django_tables2 import RequestConfig
from PIL import Image, UnidentifiedImageError
from requests.exceptions import MissingSchema

from cookbook.forms import BatchEditForm, SyncForm
from cookbook.helper.permission_helper import group_required, has_group_permission
from cookbook.helper.recipe_url_import import parse_cooktime
from cookbook.models import (Comment, Food, Ingredient, Keyword, Recipe,
                             RecipeImport, Step, Sync, Unit)
from cookbook.tables import SyncTable


@group_required('user')
def sync(request):
    if request.method == "POST":
        if not has_group_permission(request.user, ['admin']):
            messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('data_sync'))
        form = SyncForm(request.POST, space=request.space)
        if form.is_valid():
            new_path = Sync()
            new_path.path = form.cleaned_data['path']
            new_path.storage = form.cleaned_data['storage']
            new_path.last_checked = datetime.now()
            new_path.space = request.space
            new_path.save()
            return redirect('data_sync')
    else:
        form = SyncForm(space=request.space)

    monitored_paths = SyncTable(Sync.objects.filter(space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@group_required('user')
def sync_wait(request):
    return render(request, 'batch/waiting.html')


@group_required('user')
def batch_import(request):
    imports = RecipeImport.objects.filter(space=request.space).all()
    for new_recipe in imports:
        recipe = Recipe(
            name=new_recipe.name,
            file_path=new_recipe.file_path,
            storage=new_recipe.storage,
            file_uid=new_recipe.file_uid,
            created_by=request.user,
            space=request.space
        )
        recipe.save()
        new_recipe.delete()

    return redirect('list_recipe_import')


@group_required('user')
def batch_edit(request):
    if request.method == "POST":
        form = BatchEditForm(request.POST, space=request.space)
        if form.is_valid():
            word = form.cleaned_data['search']
            keywords = form.cleaned_data['keywords']

            recipes = Recipe.objects.filter(name__icontains=word, space=request.space)
            count = 0
            for recipe in recipes:
                edit = False
                if keywords.__sizeof__() > 0:
                    recipe.keywords.add(*list(keywords))
                    edit = True
                if edit:
                    count = count + 1

                recipe.save()

            msg = ngettext(
                'Batch edit done. %(count)d recipe was updated.',
                'Batch edit done. %(count)d Recipes where updated.',
                count) % {
                      'count': count,
                  }
            messages.add_message(request, messages.SUCCESS, msg)

            return redirect('data_batch_edit')
    else:
        form = BatchEditForm(space=request.space)

    return render(request, 'batch/edit.html', {'form': form})


@group_required('user')
@atomic
def import_url(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        data['cookTime'] = parse_cooktime(data.get('cookTime', ''))
        data['prepTime'] = parse_cooktime(data.get('prepTime', ''))

        recipe = Recipe.objects.create(
            name=data['name'],
            description=data['description'],
            waiting_time=data['cookTime'],
            working_time=data['prepTime'],
            servings=data['servings'],
            internal=True,
            created_by=request.user,
            space=request.space,
        )

        step = Step.objects.create(
            instruction=data['recipeInstructions'],
        )

        recipe.steps.add(step)

        for kw in data['keywords']:
            if k := Keyword.objects.filter(name=kw['text'], space=request.space).first():
                recipe.keywords.add(k)
            elif data['all_keywords']:
                k = Keyword.objects.create(name=kw['text'], space=request.space)
                recipe.keywords.add(k)

        for ing in data['recipeIngredient']:
            ingredient = Ingredient()

            if ing['ingredient']['text'] != '':
                ingredient.food, f_created = Food.objects.get_or_create(
                    name=ing['ingredient']['text'].strip(), space=request.space
                )

            if ing['unit'] and ing['unit']['text'] != '':
                ingredient.unit, u_created = Unit.objects.get_or_create(
                    name=ing['unit']['text'].strip(), space=request.space
                )

            # TODO properly handle no_amount recipes
            if isinstance(ing['amount'], str):
                try:
                    ingredient.amount = float(ing['amount'].replace(',', '.'))
                except ValueError:
                    ingredient.no_amount = True
                    pass
            elif isinstance(ing['amount'], float) \
                    or isinstance(ing['amount'], int):
                ingredient.amount = ing['amount']
            ingredient.note = ing['note'] if 'note' in ing else ''

            ingredient.save()
            step.ingredients.add(ingredient)
            print(ingredient)

        if 'image' in data and data['image'] != '' and data['image'] is not None:
            try:
                response = requests.get(data['image'])
                img = Image.open(BytesIO(response.content))

                # todo move image processing to dedicated function
                basewidth = 720
                wpercent = (basewidth / float(img.size[0]))
                hsize = int((float(img.size[1]) * float(wpercent)))
                img = img.resize((basewidth, hsize), Image.ANTIALIAS)

                im_io = BytesIO()
                img.save(im_io, 'PNG', quality=70)
                recipe.image = File(
                    im_io, name=f'{uuid.uuid4()}_{recipe.pk}.png'
                )
                recipe.save()
            except UnidentifiedImageError:
                pass
            except MissingSchema:
                pass

        return HttpResponse(reverse('view_recipe', args=[recipe.pk]))

    if 'id' in request.GET:
        context = {'bookmarklet': request.GET.get('id', '')}
    else:
        context = {}

    return render(request, 'url_import.html', context)

class Object(object):
    pass


@group_required('user')
def statistics(request):
    counts = Object()
    counts.recipes = Recipe.objects.filter(space=request.space).count()
    counts.keywords = Keyword.objects.filter(space=request.space).count()
    counts.recipe_import = RecipeImport.objects.filter(space=request.space).count()
    counts.units = Unit.objects.filter(space=request.space).count()
    counts.ingredients = Food.objects.filter(space=request.space).count()
    counts.comments = Comment.objects.filter(recipe__space=request.space).count()

    counts.recipes_internal = Recipe.objects.filter(internal=True, space=request.space).count()
    counts.recipes_external = counts.recipes - counts.recipes_internal

    counts.recipes_no_keyword = Recipe.objects.filter(keywords=None, space=request.space).count()

    return render(request, 'stats.html', {'counts': counts})
