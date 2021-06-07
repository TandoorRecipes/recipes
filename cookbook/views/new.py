import re
from datetime import datetime, timedelta
from html import escape
from smtplib import SMTPException

from django.contrib import messages
from django.contrib.auth.models import Group
from django.core.mail import send_mail, BadHeaderError
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from django.views.generic import CreateView

from cookbook.forms import (ImportRecipeForm, InviteLinkForm, KeywordForm,
                            MealPlanForm, RecipeBookForm, Storage, StorageForm)
from cookbook.helper.permission_helper import (GroupRequiredMixin,
                                               group_required)
from cookbook.models import (InviteLink, Keyword, MealPlan, MealType, Recipe,
                             RecipeBook, RecipeImport, ShareLink, Step, UserPreference)
from cookbook.views.edit import SpaceFormMixing


class RecipeCreate(GroupRequiredMixin, CreateView):
    groups_required = ['user']
    template_name = "generic/new_template.html"
    model = Recipe
    fields = ('name',)

    def form_valid(self, form):
        if self.request.space.max_recipes != 0 and Recipe.objects.filter(space=self.request.space).count() >= self.request.space.max_recipes: # TODO move to central helper function
            messages.add_message(self.request, messages.WARNING, _('You have reached the maximum number of recipes for your space.'))
            return HttpResponseRedirect(reverse('index'))

        if self.request.space.max_users != 0 and UserPreference.objects.filter(space=self.request.space).count() > self.request.space.max_users:
            messages.add_message(self.request, messages.WARNING, _('You have more users than allowed in your space.'))
            return HttpResponseRedirect(reverse('index'))

        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.space = self.request.space
        obj.internal = True
        obj.save()
        obj.steps.add(Step.objects.create())
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


class KeywordCreate(GroupRequiredMixin, CreateView):
    groups_required = ['user']
    template_name = "generic/new_template.html"
    model = Keyword
    form_class = KeywordForm
    success_url = reverse_lazy('list_keyword')

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.space = self.request.space
        obj.save()
        return HttpResponseRedirect(reverse('edit_keyword', kwargs={'pk': obj.pk}))

    def get_context_data(self, **kwargs):
        context = super(KeywordCreate, self).get_context_data(**kwargs)
        context['title'] = _("Keyword")
        return context


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


class RecipeBookCreate(GroupRequiredMixin, CreateView, SpaceFormMixing):
    groups_required = ['user']
    template_name = "generic/new_template.html"
    model = RecipeBook
    form_class = RecipeBookForm
    success_url = reverse_lazy('view_books')

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.space = self.request.space
        obj.save()
        return HttpResponseRedirect(reverse('view_books'))

    def get_context_data(self, **kwargs):
        context = super(RecipeBookCreate, self).get_context_data(**kwargs)
        context['title'] = _("Recipe Book")
        return context


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


class InviteLinkCreate(GroupRequiredMixin, CreateView):
    groups_required = ['admin']
    template_name = "generic/new_template.html"
    model = InviteLink
    form_class = InviteLinkForm

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.created_by = self.request.user
        obj.space = self.request.space
        obj.save()
        if obj.email:
            try:
                if InviteLink.objects.filter(space=self.request.space, created_at__gte=datetime.now() - timedelta(hours=4)).count() < 20:
                    message = _('Hello') + '!\n\n' + _('You have been invited by ') + escape(self.request.user.username)
                    message += _(' to join their Tandoor Recipes space ') + escape(self.request.space.name) + '.\n\n'
                    message += _('Click the following link to activate your account: ') + self.request.build_absolute_uri(reverse('view_invite', args=[str(obj.uuid)])) + '\n\n'
                    message += _('If the link does not work use the following code to manually join the space: ') + str(obj.uuid) + '\n\n'
                    message += _('The invitation is valid until ') + str(obj.valid_until) + '\n\n'
                    message += _('Tandoor Recipes is an Open Source recipe manager. Check it out on GitHub ') + 'https://github.com/vabene1111/recipes/'

                    send_mail(
                        _('Tandoor Recipes Invite'),
                        message,
                        None,
                        [obj.email],
                        fail_silently=False,
                    )
                    messages.add_message(self.request, messages.SUCCESS,
                                         _('Invite link successfully send to user.'))
                else:
                    messages.add_message(self.request, messages.ERROR,
                                         _('You have send to many emails, please share the link manually or wait a few hours.'))
            except (SMTPException, BadHeaderError, TimeoutError):
                messages.add_message(self.request, messages.ERROR, _('Email to user could not be send, please share link manually.'))

        return HttpResponseRedirect(reverse('view_space'))

    def get_context_data(self, **kwargs):
        context = super(InviteLinkCreate, self).get_context_data(**kwargs)
        context['title'] = _("Invite Link")
        return context

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs.update({'user': self.request.user})
        return kwargs

    def get_initial(self):
        return dict(
            space=self.request.space,
            group=Group.objects.get(name='user')
        )
