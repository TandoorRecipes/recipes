from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.forms import ImportRecipeForm, RecipeImport
from cookbook.models import Category, Keyword, Recipe


class RecipeCreate(LoginRequiredMixin, CreateView):  # this exists for completeness but is not in use at the moment
    template_name = "generic\\new_template.html"
    model = Recipe
    fields = ['name', 'category', 'keywords']
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(RecipeCreate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


class CategoryCreate(LoginRequiredMixin, CreateView):
    template_name = "generic\\new_template.html"
    model = Category
    fields = ['name', 'icon', 'description']
    success_url = reverse_lazy('list_category')

    def get_context_data(self, **kwargs):
        context = super(CategoryCreate, self).get_context_data(**kwargs)
        context['title'] = _("Category")
        return context


class KeywordCreate(LoginRequiredMixin, CreateView):
    template_name = "generic\\new_template.html"
    model = Keyword
    fields = ['name', 'icon', 'description']
    success_url = reverse_lazy('list_keyword')

    def get_context_data(self, **kwargs):
        context = super(KeywordCreate, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


@login_required
def create_new_recipe(request, import_id):
    if request.method == "POST":
        form = ImportRecipeForm(request.POST)
        if form.is_valid():
            recipe = Recipe()
            recipe.name = form.cleaned_data['name']
            recipe.path = form.cleaned_data['path']
            recipe.category = form.cleaned_data['category']

            recipe.save()

            recipe.keywords.set(form.cleaned_data['keywords'])

            RecipeImport.objects.get(id=import_id).delete()

            messages.add_message(request, messages.SUCCESS, _('Imported new recipe!'))
            return redirect('list_import')
        else:
            messages.add_message(request, messages.ERROR, _('There was an error importing this recipe!'))
    else:
        new_recipe = RecipeImport.objects.get(id=import_id)
        form = ImportRecipeForm(initial={'path': new_recipe.path, 'name': new_recipe.name})

    return render(request, 'forms/edit_import_recipe.html', {'form': form})
