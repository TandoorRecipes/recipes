from datetime import datetime

from allauth.account.forms import ResetPasswordForm, SignupForm
from allauth.socialaccount.forms import SignupForm as SocialSignupForm
from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.forms import NumberInput, widgets
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled
from django_scopes.forms import SafeModelChoiceField, SafeModelMultipleChoiceField
from hcaptcha.fields import hCaptchaField

from .models import Comment, InviteLink, Keyword, Recipe, SearchPreference, Space, Storage, Sync, User, UserPreference, ConnectorConfig

class SelectWidget(widgets.Select):
    class Media:
        js = ('custom/js/form_select.js',)


class MultiSelectWidget(widgets.SelectMultiple):
    class Media:
        js = ('custom/js/form_multiselect.js',)
class ImportExportBase(forms.Form):
    DEFAULT = 'DEFAULT'
    PAPRIKA = 'PAPRIKA'
    NEXTCLOUD = 'NEXTCLOUD'
    MEALIE = 'MEALIE'
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
    COPYMETHAT = 'COPYMETHAT'
    COOKMATE = 'COOKMATE'
    REZEPTSUITEDE = 'REZEPTSUITEDE'
    PDF = 'PDF'
    GOURMET = 'GOURMET'

    type = forms.ChoiceField(choices=((DEFAULT, _('Default')), (PAPRIKA, 'Paprika'), (NEXTCLOUD, 'Nextcloud Cookbook'), (MEALIE, 'Mealie'), (CHOWDOWN, 'Chowdown'),
                                      (SAFFRON, 'Saffron'), (CHEFTAP, 'ChefTap'), (PEPPERPLATE, 'Pepperplate'), (RECETTETEK, 'RecetteTek'), (RECIPESAGE, 'Recipe Sage'),
                                      (DOMESTICA, 'Domestica'), (MEALMASTER, 'MealMaster'), (REZKONV, 'RezKonv'), (OPENEATS, 'Openeats'), (RECIPEKEEPER, 'Recipe Keeper'),
                                      (PLANTOEAT, 'Plantoeat'), (COOKBOOKAPP, 'CookBookApp'), (COPYMETHAT, 'CopyMeThat'), (PDF, 'PDF'), (MELARECIPES, 'Melarecipes'),
                                      (COOKMATE, 'Cookmate'), (REZEPTSUITEDE, 'Recipesuite.de'), (GOURMET, 'Gourmet')))

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
    duplicates = forms.BooleanField(help_text=_('To prevent duplicates recipes with the same name as existing ones are ignored. Check this box to import everything.'),
                                    required=False)
class ExportForm(ImportExportBase):
    recipes = forms.ModelMultipleChoiceField(widget=MultiSelectWidget, queryset=Recipe.objects.none(), required=False)
    all = forms.BooleanField(required=False)
    custom_filter = forms.IntegerField(required=False)

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['recipes'].queryset = Recipe.objects.filter(space=space).all()

from .models import InviteLink, SearchPreference, Space, User, UserPreference


class InviteLinkForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')
        super().__init__(*args, **kwargs)
        self.fields['space'].queryset = Space.objects.filter(created_by=user).all()

    def clean(self):
        space = self.cleaned_data['space']
        if space.max_users != 0 and (UserPreference.objects.filter(space=space).count()
                                     + InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, space=space).count()) >= space.max_users:
            raise ValidationError(_('Maximum number of users for this space reached.'))

    def clean_email(self):
        email = self.cleaned_data['email']
        with scopes_disabled():
            if email != '' and User.objects.filter(email=email).exists():
                raise ValidationError(_('Email address already taken!'))

        return email

    class Meta:
        model = InviteLink
        fields = ('email', 'group', 'valid_until', 'space')
        help_texts = {'email': _('An email address is not required but if present the invite link will be sent to the user.'), }
        field_classes = {'space': SafeModelChoiceField, }


class SpaceCreateForm(forms.Form):
    prefix = 'create'
    name = forms.CharField()

    def clean_name(self):
        name = self.cleaned_data['name']
        with scopes_disabled():
            if Space.objects.filter(name=name).exists():
                raise ValidationError(_('Name already taken.'))
        return name


class SpaceJoinForm(forms.Form):
    prefix = 'join'
    token = forms.CharField()


class AllAuthSignupForm(SignupForm):
    captcha = hCaptchaField()
    terms = forms.BooleanField(label=_('Accept Terms and Privacy'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if settings.PRIVACY_URL == '' and settings.TERMS_URL == '':
            self.fields.pop('terms')
        if settings.HCAPTCHA_SECRET == '':
            self.fields.pop('captcha')

    def signup(self, request, user):
        pass


class AllAuthSocialSignupForm(SocialSignupForm):
    terms = forms.BooleanField(label=_('Accept Terms and Privacy'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if settings.PRIVACY_URL == '' and settings.TERMS_URL == '':
            self.fields.pop('terms')

    def signup(self, request, user):
        pass


class CustomPasswordResetForm(ResetPasswordForm):
    captcha = hCaptchaField()

    def __init__(self, **kwargs):
        super(CustomPasswordResetForm, self).__init__(**kwargs)
        if settings.HCAPTCHA_SECRET == '':
            self.fields.pop('captcha')


class UserCreateForm(forms.Form):
    name = forms.CharField(label='Username')
    password = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}))
    password_confirm = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}))
