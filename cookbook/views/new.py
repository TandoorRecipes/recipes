import re
from datetime import datetime, timedelta
from html import escape
from smtplib import SMTPException

from django.contrib import messages
from django.contrib.auth.models import Group
from django.core.mail import BadHeaderError, send_mail
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.forms import ImportRecipeForm, InviteLinkForm, MealPlanForm, Storage, StorageForm
from cookbook.helper.permission_helper import GroupRequiredMixin, group_required, above_space_limit
from cookbook.models import (InviteLink, MealPlan, MealType, Recipe, RecipeBook, RecipeImport,
                             ShareLink, Step, UserPreference, UserSpace)
from cookbook.views.edit import SpaceFormMixing
from recipes import settings


class RecipeCreate(GroupRequiredMixin, CreateView):
    groups_required = ['user']
    template_name = "generic/new_template.html"
    model = Recipe
    fields = ('name',)

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


# class KeywordCreate(GroupRequiredMixin, CreateView):
#     groups_required = ['user']
#     template_name = "generic/new_template.html"
#     model = Keyword
#     form_class = KeywordForm
#     success_url = reverse_lazy('list_keyword')

#     def form_valid(self, form):
#         form.cleaned_data['space'] = self.request.space
#         form.save()
#         return HttpResponseRedirect(reverse('list_keyword'))

#     def get_context_data(self, **kwargs):
#         context = super(KeywordCreate, self).get_context_data(**kwargs)
#         context['title'] = _("Keyword")
#         return context


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
        obj.save()
        if self.request.space.demo or settings.HOSTED:
            messages.add_message(self.request, messages.ERROR, _('This feature is not yet available in the hosted version of tandoor!'))
            return redirect('index')
        return HttpResponseRedirect(reverse('edit_storage', kwargs={'pk': obj.pk}))

    def get_context_data(self, **kwargs):
        context = super(StorageCreate, self).get_context_data(**kwargs)
        context['title'] = _("Storage Backend")
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
        form = ImportRecipeForm(
            initial={
                'file_path': new_recipe.file_path,
                'name': new_recipe.name,
                'file_uid': new_recipe.file_uid
            }, space=request.space
        )

    return render(request, 'forms/edit_import_recipe.html', {'form': form})


class MealPlanCreate(GroupRequiredMixin, CreateView, SpaceFormMixing):
    groups_required = ['user']
    template_name = "generic/new_template.html"
    model = MealPlan
    form_class = MealPlanForm
    success_url = reverse_lazy('view_plan')

    def get_form(self, form_class=None):
        form = self.form_class(**self.get_form_kwargs())
        form.fields['meal_type'].queryset = MealType.objects.filter(created_by=self.request.user,
                                                                    space=self.request.space).all()
        return form

    def get_initial(self):
        return dict(
            meal_type=(
                self.request.GET['meal']
                if 'meal' in self.request.GET
                else None
            ),
            date=(
                datetime.strptime(self.request.GET['date'], '%Y-%m-%d')
                if 'date' in self.request.GET
                else None
            ),
            shared=(
                self.request.user.userpreference.plan_share.all()
                if self.request.user.userpreference.plan_share
                else None
            )
        )

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.space = self.request.space
        obj.save()
        return HttpResponseRedirect(reverse('view_plan'))

    def get_context_data(self, **kwargs):
        context = super(MealPlanCreate, self).get_context_data(**kwargs)
        context['title'] = _("Meal-Plan")

        recipe = self.request.GET.get('recipe')
        if recipe:
            if re.match(r'^([0-9])+$', recipe):
                if Recipe.objects.filter(pk=int(recipe), space=self.request.space).exists():
                    context['default_recipe'] = Recipe.objects.get(pk=int(recipe), space=self.request.space)

        return context


