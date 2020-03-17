import re

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.forms import ImportRecipeForm, RecipeImport, KeywordForm, Storage, StorageForm, InternalRecipeForm, \
    RecipeBookForm, MealPlanForm
from cookbook.models import Keyword, Recipe, RecipeBook, MealPlan


class RecipeCreate(LoginRequiredMixin, CreateView):
    template_name = "generic/new_template.html"
    model = Recipe
    fields = ('name',)

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.internal = True
        obj.save()
        return HttpResponseRedirect(reverse('edit_recipe', kwargs={'pk': obj.pk}))

    def get_success_url(self):
        return reverse('edit_recipe', kwargs={'pk': self.object.pk})

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

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.save()
        return HttpResponseRedirect(reverse('edit_storage', kwargs={'pk': obj.pk}))

    def get_context_data(self, **kwargs):
        context = super(StorageCreate, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context


@login_required
def create_new_external_recipe(request, import_id):
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
            return redirect('list_recipe_import')
        else:
            messages.add_message(request, messages.ERROR, _('There was an error importing this recipe!'))
    else:
        new_recipe = RecipeImport.objects.get(id=import_id)
        form = ImportRecipeForm(
            initial={'file_path': new_recipe.file_path, 'name': new_recipe.name, 'file_uid': new_recipe.file_uid})

    return render(request, 'forms/edit_import_recipe.html', {'form': form})


class RecipeBookCreate(LoginRequiredMixin, CreateView):
    template_name = "generic/new_template.html"
    model = RecipeBook
    form_class = RecipeBookForm
    success_url = reverse_lazy('view_books')

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.user = self.request.user
        obj.save()
        return HttpResponseRedirect(reverse('view_books'))

    def get_context_data(self, **kwargs):
        context = super(RecipeBookCreate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class MealPlanCreate(LoginRequiredMixin, CreateView):
    template_name = "generic/new_template.html"
    model = MealPlan
    form_class = MealPlanForm
    success_url = reverse_lazy('view_plan')

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.user = self.request.user
        obj.save()
        return HttpResponseRedirect(reverse('view_plan'))

    def get_context_data(self, **kwargs):
        context = super(MealPlanCreate, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")

        recipe = self.request.GET.get('recipe')
        if recipe:
            if re.match(r'^([0-9])+$', recipe):
                if Recipe.objects.filter(pk=int(recipe)).exists():
                    context['default_recipe'] = Recipe.objects.get(pk=int(recipe))

        return context
