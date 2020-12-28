import json
from datetime import datetime
from io import BytesIO

import requests
from PIL import Image, UnidentifiedImageError
from django.contrib import messages
from django.core.files import File
from django.db.transaction import atomic
from django.utils.translation import gettext as _
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.translation import ngettext
from django_tables2 import RequestConfig

from cookbook.forms import SyncForm, BatchEditForm
from cookbook.helper.permission_helper import group_required, has_group_permission
from cookbook.models import *
from cookbook.tables import SyncTable


@group_required('user')
def sync(request):
    if request.method == "POST":
        if not has_group_permission(request.user, ['admin']):
            messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('data_sync'))
        form = SyncForm(request.POST)
        if form.is_valid():
            new_path = Sync()
            new_path.path = form.cleaned_data['path']
            new_path.storage = form.cleaned_data['storage']
            new_path.last_checked = datetime.now()
            new_path.save()
            return redirect('data_sync')
    else:
        form = SyncForm()

    monitored_paths = SyncTable(Sync.objects.all())
    RequestConfig(request, paginate={'per_page': 25}).configure(monitored_paths)

    return render(request, 'batch/monitor.html', {'form': form, 'monitored_paths': monitored_paths})


@group_required('user')
def sync_wait(request):
    return render(request, 'batch/waiting.html')


@group_required('user')
def batch_import(request):
    imports = RecipeImport.objects.all()
    for new_recipe in imports:
        recipe = Recipe(name=new_recipe.name, file_path=new_recipe.file_path, storage=new_recipe.storage, file_uid=new_recipe.file_uid, created_by=request.user)
        recipe.save()
        new_recipe.delete()

    return redirect('list_recipe_import')


@group_required('user')
def batch_edit(request):
    if request.method == "POST":
        form = BatchEditForm(request.POST)
        if form.is_valid():
            word = form.cleaned_data['search']
            keywords = form.cleaned_data['keywords']

            recipes = Recipe.objects.filter(name__icontains=word)
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
        form = BatchEditForm()

    return render(request, 'batch/edit.html', {'form': form})


@group_required('user')
@atomic
def import_url(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        recipe = Recipe.objects.create(
            name=data['name'],
            waiting_time=data['cookTime'],
            working_time=data['prepTime'],
            internal=True,
            created_by=request.user,
        )

        step = Step.objects.create(
            instruction=data['recipeInstructions'],
        )

        recipe.steps.add(step)

        for kw in data['keywords']:
            if kw['id'] != "null" and (k := Keyword.objects.filter(id=kw['id']).first()):
                recipe.keywords.add(k)
            elif data['all_keywords']:
                k = Keyword.objects.create(name=kw['text'])
                recipe.keywords.add(k)

        for ing in data['recipeIngredient']:
            ingredient = Ingredient()

            ingredient.food, f_created = Food.objects.get_or_create(name=ing['ingredient']['text'])
            if ing['unit'] and ing['unit']['text'] != '':
                ingredient.unit, u_created = Unit.objects.get_or_create(name=ing['unit']['text'])

            # TODO properly handle no_amount recipes
            if isinstance(ing['amount'], str):
                try:
                    ingredient.amount = float(ing['amount'].replace(',', '.'))
                except ValueError:
                    ingredient.no_amount = True
                    pass
            elif isinstance(ing['amount'], float) or isinstance(ing['amount'], int):
                ingredient.amount = ing['amount']
            ingredient.note = ing['note'] if 'note' in ing else ''

            ingredient.save()
            step.ingredients.add(ingredient)
            print(ingredient)

        if 'image' in data and data['image'] != '':
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
                recipe.image = File(im_io, name=f'{uuid.uuid4()}_{recipe.pk}.png')
                recipe.save()
            except UnidentifiedImageError:
                pass

        return HttpResponse(reverse('view_recipe', args=[recipe.pk]))

    return render(request, 'url_import.html', {})


class Object(object):
    pass


@group_required('user')
def statistics(request):
    counts = Object()
    counts.recipes = Recipe.objects.count()
    counts.keywords = Keyword.objects.count()
    counts.recipe_import = RecipeImport.objects.count()
    counts.units = Unit.objects.count()
    counts.ingredients = Food.objects.count()
    counts.comments = Comment.objects.count()

    counts.recipes_internal = Recipe.objects.filter(internal=True).count()
    counts.recipes_external = counts.recipes - counts.recipes_internal

    counts.recipes_no_keyword = Recipe.objects.filter(keywords=None).count()

    return render(request, 'stats.html', {'counts': counts})
