from django.contrib import messages
from django.db.models import ProtectedError
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import DeleteView

from cookbook.helper.permission_helper import (GroupRequiredMixin,
                                               OwnerRequiredMixin,
                                               group_required)
from cookbook.models import (Comment, InviteLink, MealPlan, Recipe,
                             RecipeBook, RecipeBookEntry, RecipeImport,
                             Storage, Sync)
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.local import Local
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


@group_required('user')
def delete_recipe_source(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk, space=request.space)

    if recipe.storage.method == Storage.DROPBOX:
        # TODO central location to handle storage type switches
        Dropbox.delete_file(recipe)
    if recipe.storage.method == Storage.NEXTCLOUD:
        Nextcloud.delete_file(recipe)
    if recipe.storage.method == Storage.LOCAL:
        Local.delete_file(recipe)

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


# class KeywordDelete(GroupRequiredMixin, DeleteView):
#     groups_required = ['user']
#     template_name = "generic/delete_template.html"
#     model = Keyword
#     success_url = reverse_lazy('list_keyword')

#     def get_context_data(self, **kwargs):
#         context = super(KeywordDelete, self).get_context_data(**kwargs)
#         context['title'] = _("Keyword")
#         return context


class StorageDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['admin']
    template_name = "generic/delete_template.html"
    model = Storage
    success_url = reverse_lazy('list_storage')

    def get_context_data(self, **kwargs):
        context = super(StorageDelete, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context

    def post(self, request, *args, **kwargs):
        try:
            return self.delete(request, *args, **kwargs)
        except ProtectedError:
            messages.add_message(
                request,
                messages.WARNING,
                _('Could not delete this storage backend as it is used in at least one monitor.')  # noqa: E501
            )
            return HttpResponseRedirect(reverse('list_storage'))


class CommentDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Comment
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(CommentDelete, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        return context


class RecipeBookDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = RecipeBook
    success_url = reverse_lazy('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class RecipeBookEntryDelete(OwnerRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = RecipeBookEntry
    success_url = reverse_lazy('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookEntryDelete, self).get_context_data(**kwargs)
        context['title'] = _("Bookmarks")
        return context


class MealPlanDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = MealPlan
    success_url = reverse_lazy('view_plan')

    def get_context_data(self, **kwargs):
        context = super(MealPlanDelete, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")
        return context


class InviteLinkDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = InviteLink
    success_url = reverse_lazy('list_invite_link')

    def get_context_data(self, **kwargs):
        context = super(InviteLinkDelete, self).get_context_data(**kwargs)
        context['title'] = _("Invite Link")
        return context
