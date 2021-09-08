from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.forms import widgets
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled
from django_scopes.forms import SafeModelChoiceField, SafeModelMultipleChoiceField
from emoji_picker.widgets import EmojiPickerTextInput
from hcaptcha.fields import hCaptchaField

from .models import (Comment, Food, InviteLink, Keyword, MealPlan, Recipe,
                     RecipeBook, RecipeBookEntry, Storage, Sync, Unit, User,
                     UserPreference, MealType, Space,
                     SearchPreference)


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


class UserPreferenceForm(forms.ModelForm):
    prefix = 'preference'

    class Meta:
        model = UserPreference
        fields = (
            'default_unit', 'use_fractions', 'theme', 'nav_color',
            'sticky_navbar', 'default_page', 'show_recent', 'search_style',
            'plan_share', 'ingredient_decimals', 'shopping_auto_sync',
            'comments'
        )

        help_texts = {
            'nav_color': _('Color of the top navigation bar. Not all colors work with all themes, just try them out!'),
            # noqa: E501
            'default_unit': _('Default Unit to be used when inserting a new ingredient into a recipe.'),  # noqa: E501
            'use_fractions': _(
                'Enables support for fractions in ingredient amounts (e.g. convert decimals to fractions automatically)'),
            # noqa: E501
            'plan_share': _(
                'Users with whom newly created meal plan/shopping list entries should be shared by default.'),
            # noqa: E501
            'show_recent': _('Show recently viewed recipes on search page.'),  # noqa: E501
            'ingredient_decimals': _('Number of decimals to round ingredients.'),  # noqa: E501
            'comments': _('If you want to be able to create and see comments underneath recipes.'),  # noqa: E501
            'shopping_auto_sync': _(
                'Setting to 0 will disable auto sync. When viewing a shopping list the list is updated every set seconds to sync changes someone else might have made. Useful when shopping with multiple people but might use a little bit '  # noqa: E501
                'of mobile data. If lower than instance limit it is reset when saving.'  # noqa: E501
            ),
            'sticky_navbar': _('Makes the navbar stick to the top of the page.')  # noqa: E501
        }

        widgets = {
            'plan_share': MultiSelectWidget
        }


class UserNameForm(forms.ModelForm):
    prefix = 'name'

    class Meta:
        model = User
        fields = ('first_name', 'last_name')

        help_texts = {
            'first_name': _('Both fields are optional. If none are given the username will be displayed instead')
        }


class ExternalRecipeForm(forms.ModelForm):
    file_path = forms.CharField(disabled=True, required=False)
    file_uid = forms.CharField(disabled=True, required=False)

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['keywords'].queryset = Keyword.objects.filter(space=space).all()

    class Meta:
        model = Recipe
        fields = (
            'name', 'description', 'servings', 'working_time', 'waiting_time',
            'file_path', 'file_uid', 'keywords'
        )

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'working_time': _('Preparation time in minutes'),
            'waiting_time': _('Waiting time (cooking/baking) in minutes'),
            'file_path': _('Path'),
            'file_uid': _('Storage UID'),
        }
        widgets = {'keywords': MultiSelectWidget}
        field_classes = {
            'keywords': SafeModelMultipleChoiceField,
        }


class ImportExportBase(forms.Form):
    DEFAULT = 'DEFAULT'
    PAPRIKA = 'PAPRIKA'
    NEXTCLOUD = 'NEXTCLOUD'
    MEALIE = 'MEALIE'
    CHOWDOWN = 'CHOWDOWN'
    SAFRON = 'SAFRON'
    CHEFTAP = 'CHEFTAP'
    PEPPERPLATE = 'PEPPERPLATE'
    RECIPEKEEPER = 'RECIPEKEEPER'
    RECETTETEK = 'RECETTETEK'
    RECIPESAGE = 'RECIPESAGE'
    DOMESTICA = 'DOMESTICA'
    MEALMASTER = 'MEALMASTER'
    REZKONV = 'REZKONV'
    OPENEATS = 'OPENEATS'

    type = forms.ChoiceField(choices=(
        (DEFAULT, _('Default')), (PAPRIKA, 'Paprika'), (NEXTCLOUD, 'Nextcloud Cookbook'),
        (MEALIE, 'Mealie'), (CHOWDOWN, 'Chowdown'), (SAFRON, 'Safron'), (CHEFTAP, 'ChefTap'),
        (PEPPERPLATE, 'Pepperplate'), (RECETTETEK, 'RecetteTek'), (RECIPESAGE, 'Recipe Sage'), (DOMESTICA, 'Domestica'),
        (MEALMASTER, 'MealMaster'), (REZKONV, 'RezKonv'), (OPENEATS, 'Openeats'), (RECIPEKEEPER, 'Recipe Keeper'),

    ))


class ImportForm(ImportExportBase):
    files = forms.FileField(required=True, widget=forms.ClearableFileInput(attrs={'multiple': True}))
    duplicates = forms.BooleanField(help_text=_(
        'To prevent duplicates recipes with the same name as existing ones are ignored. Check this box to import everything.'),
        required=False)


class ExportForm(ImportExportBase):
    recipes = forms.ModelMultipleChoiceField(widget=MultiSelectWidget, queryset=Recipe.objects.none())
    all = forms.BooleanField(required=False)

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['recipes'].queryset = Recipe.objects.filter(space=space).all()


class UnitMergeForm(forms.Form):
    prefix = 'unit'

    new_unit = SafeModelChoiceField(
        queryset=Unit.objects.none(),
        widget=SelectWidget,
        label=_('New Unit'),
        help_text=_('New unit that other gets replaced by.'),
    )
    old_unit = SafeModelChoiceField(
        queryset=Unit.objects.none(),
        widget=SelectWidget,
        label=_('Old Unit'),
        help_text=_('Unit that should be replaced.'),
    )

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['new_unit'].queryset = Unit.objects.filter(space=space).all()
        self.fields['old_unit'].queryset = Unit.objects.filter(space=space).all()


# TODO Deprecated
class FoodMergeForm(forms.Form):
    prefix = 'food'

    new_food = SafeModelChoiceField(
        queryset=Food.objects.none(),
        widget=SelectWidget,
        label=_('New Food'),
        help_text=_('New food that other gets replaced by.'),
    )
    old_food = SafeModelChoiceField(
        queryset=Food.objects.none(),
        widget=SelectWidget,
        label=_('Old Food'),
        help_text=_('Food that should be replaced.'),
    )

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['new_food'].queryset = Food.objects.filter(space=space).all()
        self.fields['old_food'].queryset = Food.objects.filter(space=space).all()


class CommentForm(forms.ModelForm):
    prefix = 'comment'

    class Meta:
        model = Comment
        fields = ('text',)

        labels = {
            'text': _('Add your comment: '),
        }
        widgets = {
            'text': forms.Textarea(attrs={'rows': 2, 'cols': 15}),
        }


# class KeywordForm(MoveNodeForm):
#     class Meta:
#         model = Keyword
#         fields = ('name', 'icon', 'description')
#         exclude = ('sib_order', 'parent', 'path', 'depth', 'numchild')
#         widgets = {'icon': EmojiPickerTextInput}


# class FoodForm(forms.ModelForm):

#     def __init__(self, *args, **kwargs):
#         space = kwargs.pop('space')
#         super().__init__(*args, **kwargs)
#         self.fields['recipe'].queryset = Recipe.objects.filter(space=space).all()
#         self.fields['supermarket_category'].queryset = SupermarketCategory.objects.filter(space=space).all()

#     class Meta:
#         model = Food
#         fields = ('name', 'description', 'ignore_shopping', 'recipe', 'supermarket_category')
#         widgets = {'recipe': SelectWidget}

#         field_classes = {
#             'recipe': SafeModelChoiceField,
#             'supermarket_category': SafeModelChoiceField,
#         }


class StorageForm(forms.ModelForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'autocomplete': 'new-password'}),
        required=False
    )
    password = forms.CharField(
        widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}),
        required=False,
        help_text=_('Leave empty for dropbox and enter app password for nextcloud.')
    )
    token = forms.CharField(
        widget=forms.TextInput(
            attrs={'autocomplete': 'new-password', 'type': 'password'}
        ),
        required=False,
        help_text=_('Leave empty for nextcloud and enter api token for dropbox.')
    )

    class Meta:
        model = Storage
        fields = ('name', 'method', 'username', 'password', 'token', 'url', 'path')

        help_texts = {
            'url': _(
                'Leave empty for dropbox and enter only base url for nextcloud (<code>/remote.php/webdav/</code> is added automatically)'),
        }


class RecipeBookEntryForm(forms.ModelForm):
    prefix = 'bookmark'

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['book'].queryset = RecipeBook.objects.filter(space=space).all()

    class Meta:
        model = RecipeBookEntry
        fields = ('book',)

        field_classes = {
            'book': SafeModelChoiceField,
        }


class SyncForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['storage'].queryset = Storage.objects.filter(space=space).all()

    class Meta:
        model = Sync
        fields = ('storage', 'path', 'active')

        field_classes = {
            'storage': SafeModelChoiceField,
        }


class BatchEditForm(forms.Form):
    search = forms.CharField(label=_('Search String'))
    keywords = forms.ModelMultipleChoiceField(
        queryset=Keyword.objects.none(),
        required=False,
        widget=MultiSelectWidget
    )

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

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'file_path': _('Path'),
            'file_uid': _('File ID'),
        }
        widgets = {'keywords': MultiSelectWidget}
        field_classes = {
            'keywords': SafeModelChoiceField,
        }


class RecipeBookForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['shared'].queryset = User.objects.filter(userpreference__space=space).all()

    class Meta:
        model = RecipeBook
        fields = ('name', 'icon', 'description', 'shared')
        widgets = {'icon': EmojiPickerTextInput, 'shared': MultiSelectWidget}
        field_classes = {
            'shared': SafeModelMultipleChoiceField,
        }


class MealPlanForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['recipe'].queryset = Recipe.objects.filter(space=space).all()
        self.fields['meal_type'].queryset = MealType.objects.filter(space=space).all()
        self.fields['shared'].queryset = User.objects.filter(userpreference__space=space).all()

    def clean(self):
        cleaned_data = super(MealPlanForm, self).clean()

        if cleaned_data['title'] == '' and cleaned_data['recipe'] is None:
            raise forms.ValidationError(
                _('You must provide at least a recipe or a title.')
            )

        return cleaned_data

    class Meta:
        model = MealPlan
        fields = (
            'recipe', 'title', 'meal_type', 'note',
            'servings', 'date', 'shared'
        )

        help_texts = {
            'shared': _('You can list default users to share recipes with in the settings.'),  # noqa: E501
            'note': _('You can use markdown to format this field. See the <a href="/docs/markdown/">docs here</a>')
            # noqa: E501
        }

        widgets = {
            'recipe': SelectWidget,
            'date': DateWidget,
            'shared': MultiSelectWidget
        }
        field_classes = {
            'recipe': SafeModelChoiceField,
            'meal_type': SafeModelChoiceField,
            'shared': SafeModelMultipleChoiceField,
        }


class InviteLinkForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user')
        super().__init__(*args, **kwargs)
        self.fields['space'].queryset = Space.objects.filter(created_by=user).all()

    def clean(self):
        space = self.cleaned_data['space']
        if space.max_users != 0 and (UserPreference.objects.filter(space=space).count() + InviteLink.objects.filter(space=space).count()) >= space.max_users:
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
        help_texts = {
            'email': _('An email address is not required but if present the invite link will be send to the user.'),
        }
        field_classes = {
            'space': SafeModelChoiceField,
        }


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


class AllAuthSignupForm(forms.Form):
    captcha = hCaptchaField()
    terms = forms.BooleanField(label=_('Accept Terms and Privacy'))

    def __init__(self, **kwargs):
        super(AllAuthSignupForm, self).__init__(**kwargs)
        if settings.PRIVACY_URL == '' and settings.TERMS_URL == '':
            self.fields.pop('terms')
        if settings.HCAPTCHA_SECRET == '':
            self.fields.pop('captcha')

    def signup(self, request, user):
        pass


class UserCreateForm(forms.Form):
    name = forms.CharField(label='Username')
    password = forms.CharField(
        widget=forms.TextInput(
            attrs={'autocomplete': 'new-password', 'type': 'password'}
        )
    )
    password_confirm = forms.CharField(
        widget=forms.TextInput(
            attrs={'autocomplete': 'new-password', 'type': 'password'}
        )
    )


class SearchPreferenceForm(forms.ModelForm):
    prefix = 'search'

    class Meta:
        model = SearchPreference
        fields = ('search', 'lookup', 'unaccent', 'icontains', 'istartswith', 'trigram', 'fulltext')

        help_texts = {
            'search': _('Select type method of search.  Click <a href="/docs/search/">here</a> for full desciption of choices.'),
            'lookup': _('Use fuzzy matching on units, keywords and ingredients when editing and importing recipes.'),
            'unaccent': _('Fields to search ignoring accents.  Selecting this option can improve or degrade search quality depending on language'),
            'icontains': _("Fields to search for partial matches.  (e.g. searching for 'Pie' will return 'pie' and 'piece' and 'soapie')"),
            'istartswith': _("Fields to search for beginning of word matches. (e.g. searching for 'sa' will return 'salad' and 'sandwich')"),
            'trigram': _("Fields to 'fuzzy' search. (e.g. searching for 'recpie' will find 'recipe'.)  Note: this option will conflict with 'web' and 'raw' methods of search."),
            'fulltext': _("Fields to full text search.  Note: 'web', 'phrase', and 'raw' search methods only function with fulltext fields.")
        }

        labels = {
            'search': _('Search Method'),
            'lookup': _('Fuzzy Lookups'),
            'unaccent': _('Ignore Accent'),
            'icontains': _("Partial Match"),
            'istartswith': _("Starts Wtih"),
            'trigram': _("Fuzzy Search"),
            'fulltext': _("Full Text")
        }

        widgets = {
            'search': SelectWidget,
            'unaccent': MultiSelectWidget,
            'icontains': MultiSelectWidget,
            'istartswith': MultiSelectWidget,
            'trigram': MultiSelectWidget,
            'fulltext': MultiSelectWidget,
        }
