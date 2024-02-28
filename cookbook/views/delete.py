from django.contrib import messages
from django.db import models
from django.db.models import ProtectedError
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import DeleteView

from cookbook.helper.permission_helper import GroupRequiredMixin, OwnerRequiredMixin, group_required

from cookbook.models import Comment, InviteLink, Recipe, RecipeImport, Space, Storage, Sync, UserSpace

from cookbook.models import (Comment, InviteLink, MealPlan, Recipe, RecipeBook, RecipeBookEntry,
                             RecipeImport, Space, Storage, Sync, UserSpace, ConnectorConfig)

from cookbook.provider.dropbox import Dropbox
from cookbook.provider.local import Local
from cookbook.provider.nextcloud import Nextcloud


class RecipeDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['user']
    template_name = "generic/delete_template.html"
    model = Recipe
    success_url = reverse_lazy('index')

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        # TODO make this more generic so that all delete functions benefit from this
        if self.get_context_data()['protected_objects']:
            return render(request, template_name=self.template_name, context=self.get_context_data())

        success_url = self.get_success_url()
        self.object.delete()
        return HttpResponseRedirect(success_url)

    def get_context_data(self, **kwargs):
        context = super(RecipeDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")

        # TODO make this more generic so that all delete functions benefit from this
        self.object = self.get_object()
        context['protected_objects'] = []
        context['cascading_objects'] = []
        context['set_null_objects'] = []
        for x in self.object._meta.get_fields():
            try:
                related = x.related_model.objects.filter(**{x.field.name: self.object})
                if related.exists() and x.on_delete == models.PROTECT:
                    context['protected_objects'].append(related)
                if related.exists() and x.on_delete == models.CASCADE:
                    context['cascading_objects'].append(related)
                if related.exists() and x.on_delete == models.SET_NULL:
                    context['set_null_objects'].append(related)
            except AttributeError:
                pass

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
            messages.add_message(request, messages.WARNING,
                                 _('Could not delete this storage backend as it is used in at least one monitor.')  # noqa: E501
                                 )
            return HttpResponseRedirect(reverse('list_storage'))


class ConnectorConfigDelete(GroupRequiredMixin, DeleteView):
    groups_required = ['admin']
    template_name = "generic/delete_template.html"
    model = ConnectorConfig
    success_url = reverse_lazy('list_connector_config')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _("Connectors Config Backend")
        return context


class CommentDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Comment
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(CommentDelete, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        return context


class InviteLinkDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = InviteLink
    success_url = reverse_lazy('list_invite_link')

    def get_context_data(self, **kwargs):
        context = super(InviteLinkDelete, self).get_context_data(**kwargs)
        context['title'] = _("Invite Link")
        return context


class UserSpaceDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = UserSpace
    success_url = reverse_lazy('view_space_overview')

    def get_context_data(self, **kwargs):
        context = super(UserSpaceDelete, self).get_context_data(**kwargs)
        context['title'] = _("Space Membership")
        return context


class SpaceDelete(OwnerRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Space
    success_url = reverse_lazy('view_space_overview')

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.safe_delete()
        return HttpResponseRedirect(self.get_success_url())

    def get_context_data(self, **kwargs):
        context = super(SpaceDelete, self).get_context_data(**kwargs)
        context['title'] = _("Space")
        return context
