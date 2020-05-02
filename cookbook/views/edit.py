import os
from io import BytesIO

import simplejson
import simplejson as json
from PIL import Image
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.files import File
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils.translation import gettext as _
from django.views.generic import UpdateView

from cookbook.forms import ExternalRecipeForm, KeywordForm, StorageForm, SyncForm, InternalRecipeForm, CommentForm, \
    MealPlanForm, UnitMergeForm, IngredientMergeForm, IngredientForm, RecipeBookForm
from cookbook.helper.permission_helper import group_required, GroupRequiredMixin

from cookbook.helper.permission_helper import OwnerRequiredMixin
from cookbook.models import Recipe, Sync, Keyword, RecipeImport, Storage, Comment, RecipeIngredient, RecipeBook, \
    MealPlan, Unit, Ingredient
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


@group_required('guest')
def switch_recipe(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    if recipe.internal:
        return HttpResponseRedirect(reverse('edit_internal_recipe', args=[pk]))
    else:
        return HttpResponseRedirect(reverse('edit_external_recipe', args=[pk]))


@group_required('user')
def convert_recipe(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    if not recipe.internal:
        recipe.internal = True
        recipe.save()

    return HttpResponseRedirect(reverse('edit_internal_recipe', args=[pk]))


@group_required('user')
def internal_recipe_update(request, pk):
    recipe_instance = get_object_or_404(Recipe, pk=pk)
    status = 200

    if request.method == "POST":
        form = InternalRecipeForm(request.POST, request.FILES)
        form.instance = recipe_instance

        if form.is_valid():
            recipe = recipe_instance
            recipe.name = form.cleaned_data['name']
            recipe.instructions = form.cleaned_data['instructions']
            recipe.working_time = form.cleaned_data['working_time']
            recipe.waiting_time = form.cleaned_data['waiting_time']

            if form.cleaned_data['image']:
                recipe.image = form.cleaned_data['image']

                img = Image.open(recipe.image)

                basewidth = 720
                wpercent = (basewidth / float(img.size[0]))
                hsize = int((float(img.size[1]) * float(wpercent)))
                img = img.resize((basewidth, hsize), Image.ANTIALIAS)

                im_io = BytesIO()
                img.save(im_io, 'PNG', quality=70)
                recipe.image = File(im_io, name=(str(recipe.pk) + '.png'))
            elif 'image' in form.changed_data and form.cleaned_data['image'] is False:
                recipe.image = None

            recipe.save()

            try:
                form_ingredients = json.loads(form.cleaned_data['ingredients'])
            except simplejson.errors.JSONDecodeError:
                form_ingredients = []

            RecipeIngredient.objects.filter(recipe=recipe_instance).delete()

            for i in form_ingredients:
                recipe_ingredient = RecipeIngredient()
                recipe_ingredient.recipe = recipe_instance

                if 'note' in i:
                    recipe_ingredient.note = i['note']

                if Ingredient.objects.filter(name=i['ingredient__name']).exists():
                    recipe_ingredient.ingredient = Ingredient.objects.get(name=i['ingredient__name'])
                else:
                    ingredient = Ingredient()
                    ingredient.name = i['ingredient__name']
                    ingredient.save()
                    recipe_ingredient.ingredient = ingredient

                if isinstance(i['amount'], str):
                    try:
                        recipe_ingredient.amount = float(i['amount'].replace(',', '.'))
                    except ValueError:
                        form.add_error("ingredients", _('There was an error converting your ingredients amount to a number: ') + i['unit__name'])
                else:
                    recipe_ingredient.amount = i['amount']

                if Unit.objects.filter(name=i['unit__name']).exists():
                    recipe_ingredient.unit = Unit.objects.get(name=i['unit__name'])
                else:
                    unit = Unit()
                    unit.name = i['unit__name']
                    unit.save()
                    recipe_ingredient.unit = unit

                recipe_ingredient.save()

            recipe.keywords.set(form.cleaned_data['keywords'])

            messages.add_message(request, messages.SUCCESS, _('Recipe saved!'))
        else:
            messages.add_message(request, messages.ERROR, _('There was an error saving this recipe!'))
            status = 403
    else:
        form = InternalRecipeForm(instance=recipe_instance)

    ingredients = RecipeIngredient.objects.select_related('unit__name', 'ingredient__name').filter(recipe=recipe_instance).values('ingredient__name', 'unit__name', 'amount', 'note')

    return render(request, 'forms/edit_internal_recipe.html',
                  {'form': form, 'ingredients': json.dumps(list(ingredients)),
                   'view_url': reverse('view_recipe', args=[pk])}, status=status)


class SyncUpdate(GroupRequiredMixin, UpdateView):
    groups_required = ['admin']
    template_name = "generic/edit_template.html"
    model = Sync
    form_class = SyncForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_sync', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(SyncUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Sync")
        return context


class KeywordUpdate(GroupRequiredMixin, UpdateView):
    groups_required = ['user']
    template_name = "generic/edit_template.html"
    model = Keyword
    form_class = KeywordForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_keyword', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(KeywordUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class IngredientUpdate(GroupRequiredMixin, UpdateView):
    groups_required = ['user']
    template_name = "generic/edit_template.html"
    model = Ingredient
    form_class = IngredientForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_ingredient', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(IngredientUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Ingredient")
        return context


@group_required('admin')
def edit_storage(request, pk):
    instance = get_object_or_404(Storage, pk=pk)

    if not (instance.created_by == request.user or request.user.is_superuser):
        messages.add_message(request, messages.ERROR, _('You cannot edit this storage!'))
        return HttpResponseRedirect(reverse('list_storage'))

    if request.method == "POST":
        form = StorageForm(request.POST, instance=instance)
        if form.is_valid():
            instance.name = form.cleaned_data['name']
            instance.method = form.cleaned_data['method']
            instance.username = form.cleaned_data['username']
            instance.url = form.cleaned_data['url']

            if form.cleaned_data['password'] != '__NO__CHANGE__':
                instance.password = form.cleaned_data['password']

            if form.cleaned_data['token'] != '__NO__CHANGE__':
                instance.token = form.cleaned_data['token']

            instance.save()

            messages.add_message(request, messages.SUCCESS, _('Storage saved!'))
        else:
            messages.add_message(request, messages.ERROR, _('There was an error updating this storage backend!'))
    else:
        pseudo_instance = instance
        pseudo_instance.password = '__NO__CHANGE__'
        pseudo_instance.token = '__NO__CHANGE__'
        form = StorageForm(instance=pseudo_instance)

    return render(request, 'generic/edit_template.html', {'form': form, 'title': _('Storage')})


class CommentUpdate(OwnerRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = Comment
    form_class = CommentForm

    def get_success_url(self):
        return reverse('edit_comment', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(CommentUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        context['view_url'] = reverse('view_recipe', args=[self.object.recipe.pk])
        return context


class ImportUpdate(GroupRequiredMixin, UpdateView):
    groups_required = ['user']
    template_name = "generic/edit_template.html"
    model = RecipeImport
    fields = ['name', 'path']

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_import', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(ImportUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Import")
        return context


class RecipeBookUpdate(OwnerRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = RecipeBook
    form_class = RecipeBookForm

    def get_success_url(self):
        return reverse('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class MealPlanUpdate(OwnerRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = MealPlan
    form_class = MealPlanForm

    def get_success_url(self):
        return reverse('view_plan')

    def get_context_data(self, **kwargs):
        context = super(MealPlanUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")
        return context


class ExternalRecipeUpdate(GroupRequiredMixin, UpdateView):
    groups_required = ['user']
    model = Recipe
    form_class = ExternalRecipeForm
    template_name = "generic/edit_template.html"

    def form_valid(self, form):
        self.object = form.save(commit=False)
        old_recipe = Recipe.objects.get(pk=self.object.pk)
        if not old_recipe.name == self.object.name:
            if self.object.storage.method == Storage.DROPBOX:
                Dropbox.rename_file(old_recipe, self.object.name)  # TODO central location to handle storage type switches
            if self.object.storage.method == Storage.NEXTCLOUD:
                Nextcloud.rename_file(old_recipe, self.object.name)

            self.object.file_path = os.path.dirname(self.object.file_path) + '/' + self.object.name + os.path.splitext(self.object.file_path)[1]

        messages.add_message(self.request, messages.SUCCESS, _('Changes saved!'))
        return super(ExternalRecipeUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, _('Error saving changes!'))
        return super(ExternalRecipeUpdate, self).form_valid(form)

    def get_success_url(self):
        return reverse('edit_recipe', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(ExternalRecipeUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        context['view_url'] = reverse('view_recipe', args=[self.object.pk])
        if self.object.storage:
            context['delete_external_url'] = reverse('delete_recipe_source', args=[self.object.pk])
        return context


@group_required('user')
def edit_ingredients(request):
    if request.method == "POST":
        success = False
        units_form = UnitMergeForm(request.POST, prefix=UnitMergeForm.prefix)
        if units_form.is_valid():
            new_unit = units_form.cleaned_data['new_unit']
            old_unit = units_form.cleaned_data['old_unit']
            recipe_ingredients = RecipeIngredient.objects.filter(unit=old_unit).all()
            for i in recipe_ingredients:
                i.unit = new_unit
                i.save()

            old_unit.delete()
            success = True
            messages.add_message(request, messages.SUCCESS, _('Units merged!'))

        ingredients_form = IngredientMergeForm(request.POST, prefix=IngredientMergeForm.prefix)
        if ingredients_form.is_valid():
            new_ingredient = ingredients_form.cleaned_data['new_ingredient']
            old_ingredient = ingredients_form.cleaned_data['old_ingredient']
            recipe_ingredients = RecipeIngredient.objects.filter(ingredient=old_ingredient).all()
            for i in recipe_ingredients:
                i.ingredient = new_ingredient
                i.save()

            old_ingredient.delete()
            success = True
            messages.add_message(request, messages.SUCCESS, _('Ingredients merged!'))

        if success:
            units_form = UnitMergeForm()
            ingredients_form = IngredientMergeForm()
    else:
        units_form = UnitMergeForm()
        ingredients_form = IngredientMergeForm()

    return render(request, 'forms/ingredients.html', {'units_form': units_form, 'ingredients_form': ingredients_form})
