from datetime import datetime

from allauth.account.forms import ResetPasswordForm, SignupForm
from allauth.socialaccount.forms import SignupForm as SocialSignupForm
from django import forms
from django.conf import settings
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.forms import widgets
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled
from django_scopes.forms import SafeModelChoiceField
from hcaptcha.fields import hCaptchaField

from .models import InviteLink, Recipe, Space, User, UserPreference, UserSpace


class SelectWidget(widgets.Select):

    class Media:
        js = ('custom/js/form_select.js', )


class MultiSelectWidget(widgets.SelectMultiple):

    class Media:
        js = ('custom/js/form_multiselect.js', )


class ImportExportBase(forms.Form):
    DEFAULT = 'DEFAULT'
    PAPRIKA = 'PAPRIKA'
    NEXTCLOUD = 'NEXTCLOUD'
    MEALIE = 'MEALIE'
    MEALIE1 = 'MEALIE1'
    CHOWDOWN = 'CHOWDOWN'
    SAFFRON = 'SAFFRON'
    CHEFTAP = 'CHEFTAP'
    PEPPERPLATE = 'PEPPERPLATE'
    RECIPEKEEPER = 'RECIPEKEEPER'
    RECETTETEK = 'RECETTETEK'
    RECIPESAGE = 'RECIPESAGE'
    DOMESTICA = 'DOMESTICA'
    MEALMASTER = 'MEALMASTER'
    MELARECIPES = 'MELARECIPES'
    REZKONV = 'REZKONV'
    OPENEATS = 'OPENEATS'
    PLANTOEAT = 'PLANTOEAT'
    COOKBOOKAPP = 'COOKBOOKAPP'
    COOKLANG = 'COOKLANG'
    COPYMETHAT = 'COPYMETHAT'
    COOKMATE = 'COOKMATE'
    REZEPTSUITEDE = 'REZEPTSUITEDE'
    PDF = 'PDF'  # Deprecated: pyppeteer removed, kept for DB/migration compat
    GOURMET = 'GOURMET'
    PESTLE = 'PESTLE'

    type = forms.ChoiceField(
        choices=((DEFAULT, _('Default')), (PAPRIKA, 'Paprika'), (NEXTCLOUD, 'Nextcloud Cookbook'), (MEALIE, 'Mealie'), (MEALIE1, 'Mealie1'), (CHOWDOWN, 'Chowdown'),
                 (SAFFRON, 'Saffron'), (CHEFTAP, 'ChefTap'), (PEPPERPLATE, 'Pepperplate'), (RECETTETEK, 'RecetteTek'), (RECIPESAGE, 'Recipe Sage'), (DOMESTICA, 'Domestica'),
                 (MEALMASTER, 'MealMaster'), (REZKONV, 'RezKonv'), (OPENEATS, 'Openeats'), (RECIPEKEEPER, 'Recipe Keeper'), (PLANTOEAT, 'Plantoeat'), (COOKBOOKAPP, 'CookBookApp'),
                 # (COOKLANG, 'Cooklang Markdown'), (COPYMETHAT, 'CopyMeThat'), (PDF, 'PDF'), (MELARECIPES, 'Melarecipes'), (COOKMATE, 'Cookmate'),
                 (COOKLANG, 'Cooklang Markdown'), (COPYMETHAT, 'CopyMeThat'), (MELARECIPES, 'Melarecipes'), (COOKMATE, 'Cookmate'),
                 (REZEPTSUITEDE, 'Recipesuite.de'), (GOURMET, 'Gourmet'), (PESTLE, 'Pestle'))
    )



class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleFileField(forms.FileField):

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = single_file_clean(data, initial)
        return result


class ImportForm(ImportExportBase):
    files = MultipleFileField(required=True)
    duplicates = forms.BooleanField(
        help_text=_('To prevent duplicates recipes with the same name as existing ones are ignored. Check this box to import everything.'), required=False
    )
    meal_plans = forms.BooleanField(required=False)
    shopping_lists = forms.BooleanField(required=False)
    nutrition_per_serving = forms.BooleanField(required=False)  # some managers (e.g. mealie) do not specify what the nutrition's relate to so we let the user choose


class ExportForm(ImportExportBase):
    recipes = forms.ModelMultipleChoiceField(widget=MultiSelectWidget, queryset=Recipe.objects.none(), required=False)
    all = forms.BooleanField(required=False)
    custom_filter = forms.IntegerField(required=False)

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['recipes'].queryset = Recipe.objects.filter(space=space).all()


class UserCreateForm(forms.Form):
    name = forms.CharField(label='Username', widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password', 'class': 'form-control'}))
    password_confirm = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password', 'class': 'form-control'}))
