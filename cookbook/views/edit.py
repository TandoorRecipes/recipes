from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext as _
from django.views.generic import UpdateView, DeleteView

from cookbook.forms import EditRecipeForm, KeywordForm, StorageForm, SyncForm
from cookbook.models import Recipe, Sync, Keyword, RecipeImport, Storage


class SyncUpdate(LoginRequiredMixin, UpdateView):
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


class KeywordUpdate(LoginRequiredMixin, UpdateView):
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


class StorageUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = Storage
    form_class = StorageForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('edit_storage', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(StorageUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context


class ImportUpdate(LoginRequiredMixin, UpdateView):
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


class RecipeUpdate(LoginRequiredMixin, UpdateView):
    model = Recipe
    form_class = EditRecipeForm
    template_name = "generic/edit_template.html"

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, _('Changes saved!'))
        return super(RecipeUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, _('Error saving changes!'))
        return super(RecipeUpdate, self).form_valid(form)

    def get_success_url(self):
        return reverse('edit_recipe', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(RecipeUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


# Generic Delete views

def delete_redirect(request, name, pk):
    return redirect(('delete_' + name), pk)


class RecipeDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Recipe
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(RecipeDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


class ImportDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = RecipeImport
    success_url = reverse_lazy('list_import')

    def get_context_data(self, **kwargs):
        context = super(ImportDelete, self).get_context_data(**kwargs)
        context['title'] = _("Import")
        return context


class MonitorDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Sync
    success_url = reverse_lazy('data_sync')

    def get_context_data(self, **kwargs):
        context = super(MonitorDelete, self).get_context_data(**kwargs)
        context['title'] = _("Monitor")
        return context


class KeywordDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Keyword
    success_url = reverse_lazy('list_keyword')

    def get_context_data(self, **kwargs):
        context = super(KeywordDelete, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class StorageDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Storage
    success_url = reverse_lazy('list_storage')

    def get_context_data(self, **kwargs):
        context = super(StorageDelete, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context
