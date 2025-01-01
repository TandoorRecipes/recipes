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


# Yes there are some stupid browsers that still dont support this but
# I dont support people using these browsers.
class DateWidget(forms.DateInput):
    input_type = 'date'

    def __init__(self, **kwargs):
        kwargs["format"] = "%Y-%m-%d"
        super().__init__(**kwargs)


class UserNameForm(forms.ModelForm):
    prefix = 'name'

    class Meta:
        model = User
        fields = ('first_name', 'last_name')

        help_texts = {'first_name': _('Both fields are optional. If none are given the username will be displayed instead')}


class ExternalRecipeForm(forms.ModelForm):
    file_path = forms.CharField(disabled=True, required=False)
    file_uid = forms.CharField(disabled=True, required=False)

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['keywords'].queryset = Keyword.objects.filter(space=space).all()

    class Meta:
        model = Recipe
        fields = ('name', 'description', 'servings', 'working_time', 'waiting_time', 'file_path', 'file_uid', 'keywords')

        labels = {
            'name': _('Name'), 'keywords': _('Keywords'), 'working_time': _('Preparation time in minutes'), 'waiting_time': _('Waiting time (cooking/baking) in minutes'),
            'file_path': _('Path'), 'file_uid': _('Storage UID'),
        }
        widgets = {'keywords': MultiSelectWidget}
        field_classes = {'keywords': SafeModelMultipleChoiceField, }


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


class CommentForm(forms.ModelForm):
    prefix = 'comment'

    class Meta:
        model = Comment
        fields = ('text',)

        labels = {'text': _('Add your comment: '), }
        widgets = {'text': forms.Textarea(attrs={'rows': 2, 'cols': 15}), }


class StorageForm(forms.ModelForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password'}), required=False)
    password = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}),
                               required=False,
                               help_text=_('Leave empty for dropbox and enter app password for nextcloud.'))
    token = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}),
                            required=False,
                            help_text=_('Leave empty for nextcloud and enter api token for dropbox.'))

    class Meta:
        model = Storage
        fields = ('name', 'method', 'username', 'password', 'token', 'url', 'path')

        help_texts = {'url': _('Leave empty for dropbox and enter only base url for nextcloud (<code>/remote.php/webdav/</code> is added automatically)'), }


class ConnectorConfigForm(forms.ModelForm):
    enabled = forms.BooleanField(
        help_text="Is the connector enabled",
        required=False,
    )

    on_shopping_list_entry_created_enabled = forms.BooleanField(
        help_text="Enable action for ShoppingListEntry created events",
        required=False,
    )

    on_shopping_list_entry_updated_enabled = forms.BooleanField(
        help_text="Enable action for ShoppingListEntry updated events",
        required=False,
    )

    on_shopping_list_entry_deleted_enabled = forms.BooleanField(
        help_text="Enable action for ShoppingListEntry deleted events",
        required=False,
    )

    supports_description_field = forms.BooleanField(
        help_text="Does the connector todo entity support the description field",
        initial=True,
        required=False,
    )

    update_token = forms.CharField(
        widget=forms.TextInput(attrs={'autocomplete': 'update-token', 'type': 'password'}),
        required=False,
        help_text=_('<a href="https://www.home-assistant.io/docs/authentication/#your-account-profile">Long Lived Access Token</a> for your HomeAssistant instance')
    )

    url = forms.URLField(
        required=False,
        help_text=_('Something like http://homeassistant.local:8123/api'),
    )

    class Meta:
        model = ConnectorConfig

        fields = (
            'name', 'type', 'enabled', 'on_shopping_list_entry_created_enabled', 'on_shopping_list_entry_updated_enabled',
            'on_shopping_list_entry_deleted_enabled', 'supports_description_field', 'url', 'todo_entity',
        )

        help_texts = {
            'url': _('http://homeassistant.local:8123/api for example'),
        }


class SyncForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['storage'].queryset = Storage.objects.filter(space=space).all()

    class Meta:
        model = Sync
        fields = ('storage', 'path', 'active')

        field_classes = {'storage': SafeModelChoiceField, }

        labels = {'storage': _('Storage'), 'path': _('Path'), 'active': _('Active')}


class BatchEditForm(forms.Form):
    search = forms.CharField(label=_('Search String'))
    keywords = forms.ModelMultipleChoiceField(queryset=Keyword.objects.none(), required=False, widget=MultiSelectWidget)

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['keywords'].queryset = Keyword.objects.filter(space=space).all().order_by('id')


class ImportRecipeForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['keywords'].queryset = Keyword.objects.filter(space=space).all()

    class Meta:
        model = Recipe
        fields = ('name', 'keywords', 'file_path', 'file_uid')

        labels = {'name': _('Name'), 'keywords': _('Keywords'), 'file_path': _('Path'), 'file_uid': _('File ID'), }
        widgets = {'keywords': MultiSelectWidget}
        field_classes = {'keywords': SafeModelChoiceField, }


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


class SearchPreferenceForm(forms.ModelForm):
    prefix = 'search'
    trigram_threshold = forms.DecimalField(min_value=0.01,
                                           max_value=1,
                                           decimal_places=2,
                                           widget=NumberInput(attrs={'class': "form-control-range", 'type': 'range'}),
                                           help_text=_('Determines how fuzzy a search is if it uses trigram similarity matching (e.g. low values mean more typos are ignored).'))
    preset = forms.CharField(widget=forms.HiddenInput(), required=False)

    class Meta:
        model = SearchPreference
        fields = ('search', 'lookup', 'unaccent', 'icontains', 'istartswith', 'trigram', 'fulltext', 'trigram_threshold')

        help_texts = {
            'search': _('Select type method of search.  Click <a href="/docs/search/">here</a> for full description of choices.'), 'lookup':
                _('Use fuzzy matching on units, keywords and ingredients when editing and importing recipes.'), 'unaccent':
                _('Fields to search ignoring accents.  Selecting this option can improve or degrade search quality depending on language'), 'icontains':
                _("Fields to search for partial matches.  (e.g. searching for 'Pie' will return 'pie' and 'piece' and 'soapie')"), 'istartswith':
                _("Fields to search for beginning of word matches. (e.g. searching for 'sa' will return 'salad' and 'sandwich')"), 'trigram':
                _("Fields to 'fuzzy' search. (e.g. searching for 'recpie' will find 'recipe'.)  Note: this option will conflict with 'web' and 'raw' methods of search."),
            'fulltext':
                _("Fields to full text search.  Note: 'web', 'phrase', and 'raw' search methods only function with fulltext fields."),
        }

        labels = {
            'search': _('Search Method'), 'lookup': _('Fuzzy Lookups'), 'unaccent': _('Ignore Accent'), 'icontains': _("Partial Match"), 'istartswith': _("Starts With"),
            'trigram': _("Fuzzy Search"), 'fulltext': _("Full Text")
        }

        widgets = {
            'search': SelectWidget, 'unaccent': MultiSelectWidget, 'icontains': MultiSelectWidget, 'istartswith': MultiSelectWidget, 'trigram': MultiSelectWidget, 'fulltext':
                MultiSelectWidget,
        }
