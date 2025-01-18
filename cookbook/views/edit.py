import copy
import os

from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils.translation import gettext as _
from django.views.generic import UpdateView
from django.views.generic.edit import FormMixin

from cookbook.forms import CommentForm, ExternalRecipeForm, StorageForm, SyncForm, ConnectorConfigForm
from cookbook.helper.permission_helper import GroupRequiredMixin, OwnerRequiredMixin, above_space_limit, group_required
from cookbook.models import Comment, Recipe, RecipeImport, Storage, Sync, ConnectorConfig
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.local import Local
from cookbook.provider.nextcloud import Nextcloud
from recipes import settings

VALUE_NOT_CHANGED = '__NO__CHANGE__'


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
    limit, msg = above_space_limit(request.space)
    if limit:
        messages.add_message(request, messages.WARNING, msg)
        return HttpResponseRedirect(reverse('view_recipe', args=[pk]))

    recipe_instance = get_object_or_404(Recipe, pk=pk, space=request.space)

    return render(request, 'forms/edit_internal_recipe.html', {'recipe': recipe_instance})


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


@group_required('admin')
def edit_storage(request, pk):
    instance: Storage = get_object_or_404(Storage, pk=pk, space=request.space)

    if not request.user.is_superuser:
        messages.add_message(request, messages.ERROR, _('You cannot edit this storage!'))
        return HttpResponseRedirect(reverse('list_storage'))

    if request.space.demo or settings.HOSTED:
        messages.add_message(request, messages.ERROR, _('This feature is not yet available in the hosted version of tandoor!'))
        return redirect('index')

    if request.method == "POST":
        form = StorageForm(request.POST, instance=copy.deepcopy(instance))
        if form.is_valid():
            instance.name = form.cleaned_data['name']
            instance.method = form.cleaned_data['method']
            instance.username = form.cleaned_data['username']
            instance.url = form.cleaned_data['url']
            instance.path = form.cleaned_data['path']

            if form.cleaned_data['password'] != VALUE_NOT_CHANGED:
                instance.password = form.cleaned_data['password']

            if form.cleaned_data['token'] != VALUE_NOT_CHANGED:
                instance.token = form.cleaned_data['token']

            instance.save()

            messages.add_message(request, messages.SUCCESS, _('Storage saved!'))
        else:
            messages.add_message(request, messages.ERROR, _('There was an error updating this storage backend!'))
    else:
        pseudo_instance = instance
        pseudo_instance.password = VALUE_NOT_CHANGED
        pseudo_instance.token = VALUE_NOT_CHANGED
        form = StorageForm(instance=pseudo_instance)

    return render(request, 'generic/edit_template.html', {'form': form, 'title': _('Storage')})


class ConnectorConfigUpdate(GroupRequiredMixin, UpdateView):
    groups_required = ['admin']
    template_name = "generic/edit_template.html"
    model = ConnectorConfig
    form_class = ConnectorConfigForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['initial']['update_token'] = VALUE_NOT_CHANGED
        return kwargs

    def form_valid(self, form):
        if form.cleaned_data['update_token'] != VALUE_NOT_CHANGED and form.cleaned_data['update_token'] != "":
            form.instance.token = form.cleaned_data['update_token']
        messages.add_message(self.request, messages.SUCCESS, _('Config saved!'))
        return super(ConnectorConfigUpdate, self).form_valid(form)

    def get_success_url(self):
        return reverse('edit_connector_config', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _("ConnectorConfig")
        return context


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

            self.object.file_path = "%s/%s%s" % (os.path.dirname(self.object.file_path), self.object.name, os.path.splitext(self.object.file_path)[1])

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
            context['delete_external_url'] = reverse('delete_recipe_source', args=[self.object.pk])
        return context
