from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, render
from django.urls import reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import UpdateView, DeleteView

from cookbook.forms import EditRecipeForm
from cookbook.models import Recipe, Category, Monitor, Keyword, NewRecipe


class MonitorUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic\edit_template.html"
    model = Monitor
    fields = ['path']


class CategoryUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic\edit_template.html"
    model = Category
    fields = ['name', 'description']


class KeywordUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic\edit_template.html"
    model = Keyword
    fields = ['name', 'description']


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
class MonitorDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Monitor
    success_url = reverse_lazy('index')


class CategoryDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Category
    success_url = reverse_lazy('index')


class KeywordDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = Keyword
    success_url = reverse_lazy('index')


class NewRecipeDelete(LoginRequiredMixin, DeleteView):
    template_name = "generic\delete_template.html"
    model = NewRecipe
    success_url = reverse_lazy('batch_import')
