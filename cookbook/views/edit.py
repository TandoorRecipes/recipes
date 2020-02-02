import os
from io import BytesIO
import simplejson as json
from PIL import Image

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.files import File
from django.db.models import Value, CharField
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, get_object_or_404, render
from django.urls import reverse_lazy, reverse
from django.utils.translation import gettext as _
from django.views.generic import UpdateView, DeleteView

from cookbook.forms import ExternalRecipeForm, KeywordForm, StorageForm, SyncForm, InternalRecipeForm, CommentForm, MealPlanForm
from cookbook.models import Recipe, Sync, Keyword, RecipeImport, Storage, Comment, RecipeIngredients, RecipeBook, \
    RecipeBookEntry, MealPlan, Unit
from cookbook.provider.dropbox import Dropbox
from cookbook.provider.nextcloud import Nextcloud


@login_required
def switch_recipe(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    if recipe.internal:
        return HttpResponseRedirect(reverse('edit_internal_recipe', args=[pk]))
    else:
        return HttpResponseRedirect(reverse('edit_external_recipe', args=[pk]))


@login_required
def convert_recipe(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    if not recipe.internal:
        recipe.internal = True
        recipe.save()
        return HttpResponseRedirect(reverse('edit_internal_recipe', args=[pk]))


@login_required
def internal_recipe_update(request, pk):
    recipe_instance = get_object_or_404(Recipe, pk=pk)
    status = 200

    if request.method == "POST":
        form = InternalRecipeForm(request.POST, request.FILES)
        form.instance = recipe_instance

        if form.is_valid():
            recipe = recipe_instance
            recipe.name = form.cleaned_data['name']
            recipe.instructions = form.cleaned_data['instructions']
            recipe.working_time = form.cleaned_data['working_time']
            recipe.waiting_time = form.cleaned_data['waiting_time']

            if form.cleaned_data['image']:
                recipe.image = form.cleaned_data['image']

                img = Image.open(recipe.image)

                basewidth = 720
                wpercent = (basewidth / float(img.size[0]))
                hsize = int((float(img.size[1]) * float(wpercent)))
                img = img.resize((basewidth, hsize), Image.ANTIALIAS)

                im_io = BytesIO()
                img.save(im_io, 'JPEG', quality=70)
                recipe.image = File(im_io, name=(str(recipe.pk) + '.jpeg'))
            elif 'image' in form.changed_data and form.cleaned_data['image'] is False:
                recipe.image = None

            recipe.save()

            form_ingredients = json.loads(form.cleaned_data['ingredients'])
            RecipeIngredients.objects.filter(recipe=recipe_instance).delete()

            for i in form_ingredients:
                ingredient = RecipeIngredients()
                ingredient.recipe = recipe_instance
                ingredient.name = i['name']
                if isinstance(i['amount'], str):
                    ingredient.amount = float(i['amount'].replace(',', '.'))
                else:
                    ingredient.amount = i['amount']

                if Unit.objects.filter(name=i['unit__name']).exists():
                    ingredient.unit = Unit.objects.get(name=i['unit__name'])
                else:
                    unit = Unit()
                    unit.name = i['unit__name']
                    unit.save()
                    ingredient.unit = unit

                ingredient.save()

            recipe.keywords.set(form.cleaned_data['keywords'])

            messages.add_message(request, messages.SUCCESS, _('Recipe saved!'))
        else:
            messages.add_message(request, messages.ERROR, _('There was an error saving this recipe!'))
            status = 403
    else:
        form = InternalRecipeForm(instance=recipe_instance)

    ingredients = RecipeIngredients.objects.select_related('unit__name').filter(recipe=recipe_instance).values('name', 'unit__name', 'amount')

    return render(request, 'forms/edit_internal_recipe.html',
                  {'form': form, 'ingredients': json.dumps(list(ingredients)),
                   'view_url': reverse('view_recipe', args=[pk])}, status=status)


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


@login_required
def edit_storage(request, pk):
    instance = get_object_or_404(Storage, pk=pk)

    if not (instance.created_by == request.user or request.user.is_superuser):
        messages.add_message(request, messages.ERROR, _('You cannot edit this comment!'))
        return HttpResponseRedirect(reverse('list_storage'))

    if request.method == "POST":
        form = StorageForm(request.POST)
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

            messages.add_message(request, messages.SUCCESS, _('Storage saved!'))
            return HttpResponseRedirect(reverse('edit_storage', args=[pk]))
        else:
            messages.add_message(request, messages.ERROR, _('There was an error updating this storage backend.!'))
    else:
        pseudo_instance = instance
        pseudo_instance.password = '__NO__CHANGE__'
        pseudo_instance.token = '__NO__CHANGE__'
        form = StorageForm(instance=pseudo_instance)

    return render(request, 'generic/edit_template.html',
                  {'form': form, 'view_url': reverse('view_recipe', args=[pk])})


class CommentUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = Comment
    form_class = CommentForm

    # TODO add msg box

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()
        if not (obj.created_by == request.user or request.user.is_superuser):
            messages.add_message(request, messages.ERROR, _('You cannot edit this comment!'))
            return HttpResponseRedirect(reverse('view_recipe', args=[obj.recipe.pk]))
        return super(CommentUpdate, self).dispatch(request, *args, **kwargs)

    def get_success_url(self):
        return reverse('edit_comment', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(CommentUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Comment")
        context['view_url'] = reverse('view_recipe', args=[self.object.recipe.pk])
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


class RecipeBookUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = RecipeBook
    fields = ['name']

    # TODO add msg box

    def get_success_url(self):
        return reverse('view_books')

    def get_context_data(self, **kwargs):
        context = super(RecipeBookUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


class MealPlanUpdate(LoginRequiredMixin, UpdateView):
    template_name = "generic/edit_template.html"
    model = MealPlan
    form_class = MealPlanForm

    # TODO add msg box

    def get_success_url(self):
        return reverse('view_plan')

    def get_context_data(self, **kwargs):
        context = super(MealPlanUpdate, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")
        return context


class RecipeUpdate(LoginRequiredMixin, UpdateView):
    model = Recipe
    form_class = ExternalRecipeForm
    template_name = "generic/edit_template.html"

    def form_valid(self, form):
        self.object = form.save(commit=False)
        old_recipe = Recipe.objects.get(pk=self.object.pk)
        if not old_recipe.name == self.object.name:
            if self.object.storage.method == Storage.DROPBOX:
                Dropbox.rename_file(old_recipe,
                                    self.object.name)  # TODO central location to handle storage type switches
            if self.object.storage.method == Storage.NEXTCLOUD:
                Nextcloud.rename_file(old_recipe, self.object.name)

            self.object.file_path = os.path.dirname(self.object.file_path) + '/' + self.object.name + \
                                    os.path.splitext(self.object.file_path)[1]

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
        context['view_url'] = reverse('view_recipe', args=[self.object.pk])
        if self.object.storage:
            context['delete_external_url'] = reverse('delete_recipe_source', args=[self.object.pk])
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
