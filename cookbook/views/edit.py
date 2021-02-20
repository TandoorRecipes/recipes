import os

from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import UpdateView
from django.views.generic.edit import FormMixin
from django_scopes import scopes_disabled

from cookbook.forms import (CommentForm, ExternalRecipeForm, FoodForm,
                            FoodMergeForm, KeywordForm, MealPlanForm,
                            RecipeBookForm, StorageForm, SyncForm,
                            UnitMergeForm)
from cookbook.helper.permission_helper import (GroupRequiredMixin,
                                               OwnerRequiredMixin,
                                               group_required)
from cookbook.models import (Comment, Food, Ingredient, Keyword, MealPlan,
                             MealType, Recipe, RecipeBook, RecipeImport,
                             Storage, Sync)
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.local import Local
from cookbook.provider.nextcloud import Nextcloud


@group_required('guest')
def switch_recipe(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk, space=request.space)
    if recipe.internal:
        return HttpResponseRedirect(reverse('edit_internal_recipe', args=[pk]))
    else:
        return HttpResponseRedirect(reverse('edit_external_recipe', args=[pk]))


@group_required('user')
def convert_recipe(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk, space=request.space)
    if not recipe.internal:
        recipe.internal = True
        recipe.save()

    return HttpResponseRedirect(reverse('edit_internal_recipe', args=[pk]))


@group_required('user')
def internal_recipe_update(request, pk):
    recipe_instance = get_object_or_404(Recipe, pk=pk, space=request.space)

    return render(
        request, 'forms/edit_internal_recipe.html', {'recipe': recipe_instance}
    )


class SpaceFormMixing(FormMixin):

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs.update({'space': self.request.space})
        return kwargs


class SyncUpdate(GroupRequiredMixin, UpdateView, SpaceFormMixing):
    groups_required = ['admin']
    template_name = "generic/edit_template.html"
    model = Sync
    form_class = SyncForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_sync', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
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
        context = super().get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class FoodUpdate(GroupRequiredMixin, UpdateView, SpaceFormMixing):
    groups_required = ['user']
    template_name = "generic/edit_template.html"
    model = Food
    form_class = FoodForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_food', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(FoodUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Food")
        return context


@group_required('admin')
def edit_storage(request, pk):
    instance = get_object_or_404(Storage, pk=pk, space=request.space)

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

            messages.add_message(
                request, messages.SUCCESS, _('Storage saved!')
            )
        else:
            messages.add_message(
                request,
                messages.ERROR,
                _('There was an error updating this storage backend!')
            )
    else:
        pseudo_instance = instance
        pseudo_instance.password = '__NO__CHANGE__'
        pseudo_instance.token = '__NO__CHANGE__'
        form = StorageForm(instance=pseudo_instance)

    return render(
        request,
        'generic/edit_template.html',
        {'form': form, 'title': _('Storage')}
    )


class CommentUpdate(OwnerRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = Comment
    form_class = CommentForm

    def get_success_url(self):
        return reverse('edit_comment', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(CommentUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        context['view_url'] = reverse(
            'view_recipe', args=[self.object.recipe.pk]
        )
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


class RecipeBookUpdate(OwnerRequiredMixin, UpdateView, SpaceFormMixing):
    template_name = "generic/edit_template.html"
    model = RecipeBook
    form_class = RecipeBookForm

    def get_success_url(self):
        return reverse('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class MealPlanUpdate(OwnerRequiredMixin, UpdateView, SpaceFormMixing):
    template_name = "generic/edit_template.html"
    model = MealPlan
    form_class = MealPlanForm

    def get_success_url(self):
        return reverse('view_plan_entry', kwargs={'pk': self.object.pk})

    def get_form(self, form_class=None):
        form = self.form_class(**self.get_form_kwargs())
        form.fields['meal_type'].queryset = MealType.objects \
            .filter(created_by=self.request.user).all()
        return form

    def get_context_data(self, **kwargs):
        context = super(MealPlanUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")
        return context


class ExternalRecipeUpdate(GroupRequiredMixin, UpdateView, SpaceFormMixing):
    groups_required = ['user']
    model = Recipe
    form_class = ExternalRecipeForm
    template_name = "generic/edit_template.html"

    def form_valid(self, form):
        self.object = form.save(commit=False)
        old_recipe = Recipe.objects.get(pk=self.object.pk, space=self.request.space)
        if not old_recipe.name == self.object.name:
            # TODO central location to handle storage type switches
            if self.object.storage.method == Storage.DROPBOX:
                Dropbox.rename_file(old_recipe, self.object.name)
            if self.object.storage.method == Storage.NEXTCLOUD:
                Nextcloud.rename_file(old_recipe, self.object.name)
            if self.object.storage.method == Storage.LOCAL:
                Local.rename_file(old_recipe, self.object.name)

            self.object.file_path = "%s/%s%s" % (
                os.path.dirname(self.object.file_path),
                self.object.name,
                os.path.splitext(self.object.file_path)[1]
            )

        messages.add_message(self.request, messages.SUCCESS, _('Changes saved!'))
        return super(ExternalRecipeUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, _('Error saving changes!'))
        return super(ExternalRecipeUpdate, self).form_valid(form)

    def get_success_url(self):
        return reverse('edit_recipe', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _("Recipe")
        context['view_url'] = reverse('view_recipe', args=[self.object.pk])
        if self.object.storage:
            context['delete_external_url'] = reverse(
                'delete_recipe_source', args=[self.object.pk]
            )
        return context


@group_required('user')
def edit_ingredients(request):
    if request.method == "POST":
        success = False
        units_form = UnitMergeForm(request.POST, prefix=UnitMergeForm.prefix, space=request.space)
        if units_form.is_valid():
            new_unit = units_form.cleaned_data['new_unit']
            old_unit = units_form.cleaned_data['old_unit']
            if new_unit != old_unit:
                recipe_ingredients = Ingredient.objects.filter(unit=old_unit, space=request.space).all()
                for i in recipe_ingredients:
                    i.unit = new_unit
                    i.save()

                old_unit.delete()
                success = True
                messages.add_message(request, messages.SUCCESS, _('Units merged!'))
            else:
                messages.add_message(request, messages.ERROR, _('Cannot merge with the same object!'))

        food_form = FoodMergeForm(request.POST, prefix=FoodMergeForm.prefix, space=request.space)
        if food_form.is_valid():
            new_food = food_form.cleaned_data['new_food']
            old_food = food_form.cleaned_data['old_food']
            if new_food != old_food:
                ingredients = Ingredient.objects.filter(food=old_food, space=request.space).all()
                for i in ingredients:
                    i.food = new_food
                    i.save()

                old_food.delete()
                success = True
                messages.add_message(request, messages.SUCCESS, _('Foods merged!'))
            else:
                messages.add_message(request, messages.ERROR, _('Cannot merge with the same object!'))

        if success:
            units_form = UnitMergeForm(space=request.space)
            food_form = FoodMergeForm(space=request.space)
    else:
        units_form = UnitMergeForm(space=request.space)
        food_form = FoodMergeForm(space=request.space)

    return render(request, 'forms/ingredients.html', {'units_form': units_form, 'food_form': food_form})
