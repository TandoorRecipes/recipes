from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, render
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext as _
from django.views.generic import UpdateView, DeleteView

from cookbook.forms import EditRecipeForm
from cookbook.models import Recipe, Category, Monitor, Keyword, NewRecipe


class MonitorUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic\edit_template.html"
    model = Monitor
    fields = ['path']

    def get_success_url(self):
        return reverse('edit_recipe',  kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(MonitorUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Monitor")
        return context


class CategoryUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic\edit_template.html"
    model = Category
    fields = ['name', 'description']

    def get_success_url(self):
        return reverse('edit_recipe',  kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(CategoryUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Category")
        return context


class KeywordUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic\edit_template.html"
    model = Keyword
    fields = ['name', 'description']

    def get_success_url(self):
        return reverse('edit_recipe',  kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(KeywordUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class RecipeUpdate(LoginRequiredMixin, UpdateView):
    model = Recipe
    form_class = EditRecipeForm
    template_name = "generic\edit_template.html"

    def form_valid(self, form):
        messages.add_message(self.request, messages.SUCCESS, _('Changes saved!'))
        return super(RecipeUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.add_message(self.request, messages.ERROR, _('Error saving changes!'))
        return super(RecipeUpdate, self).form_valid(form)

    def get_success_url(self):
        return reverse('edit_recipe',  kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(RecipeUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


@login_required
def recipe(request, recipe_id):
    recipe_obj = Recipe.objects.get(id=recipe_id)
    if request.method == "POST":
        form = EditRecipeForm(request.POST)
        if form.is_valid():
            recipe_obj.name = form.cleaned_data['name']
            recipe_obj.path = form.cleaned_data['path']
            recipe_obj.category = Category.objects.get(name=form.cleaned_data['category'])
            recipe_obj.keywords.clear()
            recipe_obj.keywords.add(*list(form.cleaned_data['keywords']))
            recipe_obj.save()
            messages.add_message(request, messages.SUCCESS, _('Recipe updated'))
            return redirect(reverse_lazy('edit_recipe', args=[recipe_id]))
        else:
            messages.add_message(request, messages.ERROR, _('Recipe update failed'))
    else:
        form = EditRecipeForm(instance=recipe_obj)

    return render(request, 'edit/recipe.html', {'form': form})


# Generic Delete views
class RecipeDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Recipe
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(RecipeDelete, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


class MonitorDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Monitor
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(MonitorDelete, self).get_context_data(**kwargs)
        context['title'] = _("Monitor")
        return context


class CategoryDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Category
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(CategoryDelete, self).get_context_data(**kwargs)
        context['title'] = _("Category")
        return context


class KeywordDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Keyword
    success_url = reverse_lazy('index')

    def get_context_data(self, **kwargs):
        context = super(KeywordDelete, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


class NewRecipeDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = NewRecipe
    success_url = reverse_lazy('batch_import')

    def get_context_data(self, **kwargs):
        context = super(NewRecipeDelete, self).get_context_data(**kwargs)
        context['title'] = _("Import Recipe")
        return context
