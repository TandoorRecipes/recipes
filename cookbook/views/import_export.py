import base64
import json
import re
from json import JSONDecodeError

from django.contrib import messages
from django.core.files.base import ContentFile
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from rest_framework.renderers import JSONRenderer

from cookbook.forms import ExportForm, ImportForm
from cookbook.helper.permission_helper import group_required
from cookbook.models import Recipe
from cookbook.serializer import RecipeSerializer


@group_required('user')
def import_recipe(request):
    if request.method == "POST":
        form = ImportForm(request.POST)
        if form.is_valid():
            try:
                data = json.loads(re.sub(r'"id":([0-9])+,', '', form.cleaned_data['recipe']))

                sr = RecipeSerializer(data=data)
                if sr.is_valid():
                    sr.validated_data['created_by'] = request.user
                    recipe = sr.save()

                    if data['image']:
                        try:
                            fmt, img = data['image'].split(';base64,')
                            ext = fmt.split('/')[-1]
                            recipe.image = ContentFile(base64.b64decode(img), name=f'{recipe.pk}.{ext}')  # TODO possible security risk, maybe some checks needed
                            recipe.save()
                        except ValueError:
                            pass

                    messages.add_message(request, messages.SUCCESS, _('Recipe imported successfully!'))
                    return HttpResponseRedirect(reverse_lazy('view_recipe', args=[recipe.pk]))
                else:
                    messages.add_message(request, messages.ERROR, _('Something went wrong during the import!'))
                    messages.add_message(request, messages.WARNING, sr.errors)
            except JSONDecodeError:
                messages.add_message(request, messages.ERROR, _('Could not parse the supplied JSON!'))

    else:
        form = ImportForm()

    return render(request, 'import.html', {'form': form})


@group_required('user')
def export_recipe(request):
    context = {}
    if request.method == "POST":
        form = ExportForm(request.POST)
        if form.is_valid():
            recipe = form.cleaned_data['recipe']
            if recipe.internal:
                export = RecipeSerializer(recipe).data

                if recipe.image and form.cleaned_data['image']:
                    with open(recipe.image.path, 'rb') as img_f:
                        export['image'] = f'data:image/png;base64,{base64.b64encode(img_f.read()).decode("utf-8")}'

                json_string = JSONRenderer().render(export).decode("utf-8")

                if form.cleaned_data['download']:
                    response = HttpResponse(json_string, content_type='text/plain')
                    response['Content-Disposition'] = f'attachment; filename={recipe.name}.json'
                    return response

                context['export'] = re.sub(r'"id":([0-9])+,', '', json_string)
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
