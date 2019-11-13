from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.forms import ImportRecipeForm, RecipeImport, KeywordForm, Storage, StorageForm, InternalRecipeForm
from cookbook.models import Keyword, Recipe


class RecipeCreate(LoginRequiredMixin, CreateView):
    template_name = "generic/new_template.html"
    model = Recipe
    form_class = InternalRecipeForm
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(RecipeCreate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


class KeywordCreate(LoginRequiredMixin, CreateView):
    template_name = "generic/new_template.html"
    model = Keyword
    form_class = KeywordForm
    success_url = reverse_lazy('list_keyword')

    def get_context_data(self, **kwargs):
        context = super(KeywordCreate, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class StorageCreate(LoginRequiredMixin, CreateView):
    template_name = "generic/new_template.html"
    model = Storage
    form_class = StorageForm
    success_url = reverse_lazy('list_storage')

    def get_context_data(self, **kwargs):
        context = super(StorageCreate, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context


@login_required
def create_new_recipe(request, import_id):
    if request.method == "POST":
        form = ImportRecipeForm(request.POST)
        if form.is_valid():
            new_recipe = RecipeImport.objects.get(id=import_id)
            recipe = Recipe()
            recipe.storage = new_recipe.storage
            recipe.name = form.cleaned_data['name']
            recipe.file_path = form.cleaned_data['file_path']
            recipe.file_uid = form.cleaned_data['file_uid']

            recipe.save()

            recipe.keywords.set(form.cleaned_data['keywords'])

            RecipeImport.objects.get(id=import_id).delete()

            messages.add_message(request, messages.SUCCESS, _('Imported new recipe!'))
            return redirect('list_import')
        else:
            messages.add_message(request, messages.ERROR, _('There was an error importing this recipe!'))
    else:
        new_recipe = RecipeImport.objects.get(id=import_id)
        form = ImportRecipeForm(initial={'file_path': new_recipe.file_path, 'name': new_recipe.name, 'file_uid': new_recipe.file_uid})

    return render(request, 'forms/edit_import_recipe.html', {'form': form})
