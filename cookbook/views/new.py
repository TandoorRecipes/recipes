from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.forms import ImportRecipeForm, Storage, StorageForm, ConnectorConfigForm
from cookbook.helper.permission_helper import GroupRequiredMixin, above_space_limit, group_required
from cookbook.models import Recipe, RecipeImport, ShareLink, Step, ConnectorConfig
from recipes import settings


class RecipeCreate(GroupRequiredMixin, CreateView):
    groups_required = ['user']
    template_name = "generic/new_template.html"
    model = Recipe
    fields = ('name', )

    def form_valid(self, form):
        limit, msg = above_space_limit(self.request.space)
        if limit:
            messages.add_message(self.request, messages.WARNING, msg)
            return HttpResponseRedirect(reverse('index'))

        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.space = self.request.space
        obj.internal = True
        obj.save()
        obj.steps.add(Step.objects.create(space=self.request.space, show_as_header=False, show_ingredients_table=self.request.user.userpreference.show_step_ingredients))
        return HttpResponseRedirect(reverse('edit_recipe', kwargs={'pk': obj.pk}))

    def get_success_url(self):
        return reverse('edit_recipe', kwargs={'pk': self.object.pk})

    def get_context_data(self, **kwargs):
        context = super(RecipeCreate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe")
        return context


@group_required('user')
def share_link(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk, space=request.space)
    link = ShareLink.objects.create(recipe=recipe, created_by=request.user, space=request.space)
    return HttpResponseRedirect(reverse('view_recipe', kwargs={'pk': pk, 'share': link.uuid}))


class StorageCreate(GroupRequiredMixin, CreateView):
    groups_required = ['admin']
    template_name = "generic/new_template.html"
    model = Storage
    form_class = StorageForm
    success_url = reverse_lazy('list_storage')

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.space = self.request.space

        if self.request.space.demo or settings.HOSTED:
            messages.add_message(self.request, messages.ERROR, _('This feature is not yet available in the hosted version of tandoor!'))
            return redirect('index')

        if not self.request.user.is_superuser:
            messages.add_message(self.request, messages.ERROR, _('This feature is only available for the instance administrator (superuser)'))
            return redirect('index')

        obj.save()
        return HttpResponseRedirect(reverse('edit_storage', kwargs={'pk': obj.pk}))

    def get_context_data(self, **kwargs):
        context = super(StorageCreate, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
        return context


class ConnectorConfigCreate(GroupRequiredMixin, CreateView):
    groups_required = ['admin']
    template_name = "generic/new_template.html"
    model = ConnectorConfig
    form_class = ConnectorConfigForm
    success_url = reverse_lazy('list_connector_config')

    def form_valid(self, form):
        if self.request.space.demo:
            messages.add_message(self.request, messages.ERROR, _('This feature is not yet available in the hosted version of tandoor!'))
            return redirect('index')

        if settings.DISABLE_EXTERNAL_CONNECTORS:
            messages.add_message(self.request, messages.ERROR, _('This feature is not enabled by the server admin!'))
            return redirect('index')

        obj = form.save(commit=False)
        obj.token = form.cleaned_data['update_token']
        obj.created_by = self.request.user
        obj.space = self.request.space
        obj.save()
        return HttpResponseRedirect(reverse('edit_connector_config', kwargs={'pk': obj.pk}))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = _("Connector Config Backend")
        return context


@group_required('user')
def create_new_external_recipe(request, import_id):
    if request.method == "POST":
        form = ImportRecipeForm(request.POST, space=request.space)
        if form.is_valid():
            new_recipe = get_object_or_404(RecipeImport, pk=import_id, space=request.space)
            recipe = Recipe()
            recipe.space = request.space
            recipe.storage = new_recipe.storage
            recipe.name = form.cleaned_data['name']
            recipe.file_path = form.cleaned_data['file_path']
            recipe.file_uid = form.cleaned_data['file_uid']
            recipe.created_by = request.user

            recipe.save()

            if form.cleaned_data['keywords']:
                recipe.keywords.set(form.cleaned_data['keywords'])

            new_recipe.delete()

            messages.add_message(request, messages.SUCCESS, _('Imported new recipe!'))
            return redirect('list_recipe_import')
        else:
            messages.add_message(request, messages.ERROR, _('There was an error importing this recipe!'))
    else:
        new_recipe = get_object_or_404(RecipeImport, pk=import_id, space=request.space)
        form = ImportRecipeForm(initial={'file_path': new_recipe.file_path, 'name': new_recipe.name, 'file_uid': new_recipe.file_uid}, space=request.space)

    return render(request, 'forms/edit_import_recipe.html', {'form': form})
