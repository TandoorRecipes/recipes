from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import DeleteView

from cookbook.models import Recipe, Sync, Keyword, RecipeImport, Storage, Comment, RecipeBook, \
    RecipeBookEntry, MealPlan
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


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


class RecipeSourceDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Recipe
    success_url = reverse_lazy('index')

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.storage.method == Storage.DROPBOX:
            Dropbox.delete_file(self.object)  # TODO central location to handle storage type switches
        if self.object.storage.method == Storage.NEXTCLOUD:
            Nextcloud.delete_file(self.object)

        return super(RecipeSourceDelete, self).delete(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(RecipeSourceDelete, self).get_context_data(**kwargs)
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


class CommentDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = Comment
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(CommentDelete, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        return context


class RecipeBookDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = RecipeBook
    success_url = reverse_lazy('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class RecipeBookEntryDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = RecipeBookEntry
    success_url = reverse_lazy('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookEntryDelete, self).get_context_data(**kwargs)
        context['title'] = _("Bookmarks")
        return context


class MealPlanDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic/delete_template.html"
    model = MealPlan
    success_url = reverse_lazy('view_plan')

    def get_context_data(self, **kwargs):
        context = super(MealPlanDelete, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")
        return context
