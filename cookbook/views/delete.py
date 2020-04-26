from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext as _
from django.views.generic import DeleteView

from cookbook.helper.group_helper import GroupRequiredMixin
from cookbook.models import Recipe, Sync, Keyword, RecipeImport, Storage, Comment, RecipeBook, \
    RecipeBookEntry, MealPlan, Ingredient
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


class RecipeDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = Recipe
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(RecipeDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


def delete_recipe_source(request, pk):
    group_required = ['user']
    recipe = get_object_or_404(Recipe, pk=pk)

    if recipe.storage.method == Storage.DROPBOX:
        Dropbox.delete_file(recipe)  # TODO central location to handle storage type switches
    if recipe.storage.method == Storage.NEXTCLOUD:
        Nextcloud.delete_file(recipe)

    recipe.storage = None
    recipe.file_path = ''
    recipe.file_uid = ''
    recipe.save()

    return HttpResponseRedirect(reverse('edit_recipe', args=[recipe.pk]))


class RecipeImportDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = RecipeImport
    success_url = reverse_lazy('list_recipe_import')

    def get_context_data(self, **kwargs):
        context = super(RecipeImportDelete, self).get_context_data(**kwargs)
        context['title'] = _("Import")
        return context


class SyncDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['admin']
    template_name = "generic/delete_template.html"
    model = Sync
    success_url = reverse_lazy('data_sync')

    def get_context_data(self, **kwargs):
        context = super(SyncDelete, self).get_context_data(**kwargs)
        context['title'] = _("Monitor")
        return context


class KeywordDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = Keyword
    success_url = reverse_lazy('list_keyword')

    def get_context_data(self, **kwargs):
        context = super(KeywordDelete, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class IngredientDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = Ingredient
    success_url = reverse_lazy('list_ingredient')

    def get_context_data(self, **kwargs):
        context = super(IngredientDelete, self).get_context_data(**kwargs)
        context['title'] = _("Ingredient")
        return context


class StorageDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['admin']
    template_name = "generic/delete_template.html"
    model = Storage
    success_url = reverse_lazy('list_storage')

    def get_context_data(self, **kwargs):
        context = super(StorageDelete, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context


class CommentDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Comment
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(CommentDelete, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        return context


class RecipeBookDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = RecipeBook
    success_url = reverse_lazy('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class RecipeBookEntryDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = RecipeBookEntry
    success_url = reverse_lazy('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookEntryDelete, self).get_context_data(**kwargs)
        context['title'] = _("Bookmarks")
        return context


class MealPlanDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = MealPlan
    success_url = reverse_lazy('view_plan')

    def get_context_data(self, **kwargs):
        context = super(MealPlanDelete, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")
        return context
