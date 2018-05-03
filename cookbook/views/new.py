from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.models import Category, Keyword, Recipe


class RecipeCreate(LoginRequiredMixin, CreateView):  # this exists for completeness but is not in use at the moment
    template_name = "generic\\new_template.html"
    model = Recipe
    fields = ['name', 'category', 'keywords']
    success_url = reverse_lazy('list_category')

    def get_context_data(self, **kwargs):
        context = super(RecipeCreate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


class CategoryCreate(LoginRequiredMixin, CreateView):
    template_name = "generic\\new_template.html"
    model = Category
    fields = ['name', 'description']
    success_url = reverse_lazy('list_category')

    def get_context_data(self, **kwargs):
        context = super(CategoryCreate, self).get_context_data(**kwargs)
        context['title'] = _("Category")
        return context


class KeywordCreate(LoginRequiredMixin, CreateView):
    template_name = "generic\\new_template.html"
    model = Keyword
    fields = ['name', 'description']
    success_url = reverse_lazy('list_keyword')

    def get_context_data(self, **kwargs):
        context = super(KeywordCreate, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context
