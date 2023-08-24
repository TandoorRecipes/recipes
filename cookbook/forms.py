from datetime import datetime

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.forms import NumberInput, widgets
from django.utils.translation import gettext_lazy as _
from django_scopes import scopes_disabled
from django_scopes.forms import SafeModelChoiceField, SafeModelMultipleChoiceField
from hcaptcha.fields import hCaptchaField

from .models import (Comment, Food, InviteLink, Keyword, MealPlan, MealType, Recipe, RecipeBook,
                     RecipeBookEntry, SearchPreference, Space, Storage, Sync, User, UserPreference)


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

    def __init__(self, *args, **kwargs):
        space = kwargs.pop('space')
        super().__init__(*args, **kwargs)
        self.fields['plan_share'].queryset = User.objects.filter(userspace__space=space).all()

    class Meta:
        model = UserPreference
        fields = (
            'default_unit', 'use_fractions', 'use_kj', 'theme', 'nav_color',
            'sticky_navbar', 'default_page', 'plan_share', 'ingredient_decimals', 'comments', 'left_handed',
            'show_step_ingredients',
        )

        labels = {
            'default_unit': _('Default unit'),
            'use_fractions': _('Use fractions'),
            'use_kj': _('Use KJ'),
            'theme': _('Theme'),
            'nav_color': _('Navbar color'),
            'sticky_navbar': _('Sticky navbar'),
            'default_page': _('Default page'),
            'plan_share': _('Plan sharing'),
            'ingredient_decimals': _('Ingredient decimal places'),
            'shopping_auto_sync': _('Shopping list auto sync period'),
            'comments': _('Comments'),
            'left_handed': _('Left-handed mode'),
            'show_step_ingredients': _('Show step ingredients table')
        }

        help_texts = {
            'nav_color': _('Color of the top navigation bar. Not all colors work with all themes, just try them out!'),
            
            'default_unit': _('Default Unit to be used when inserting a new ingredient into a recipe.'),  
            'use_fractions': _(
                'Enables support for fractions in ingredient amounts (e.g. convert decimals to fractions automatically)'),
            
            'use_kj': _('Display nutritional energy amounts in joules instead of calories'),  
            'plan_share': _('Users with whom newly created meal plans should be shared by default.'),
            'shopping_share': _('Users with whom to share shopping lists.'),
            'ingredient_decimals': _('Number of decimals to round ingredients.'),  
            'comments': _('If you want to be able to create and see comments underneath recipes.'),  
            'shopping_auto_sync': _(
                'Setting to 0 will disable auto sync. When viewing a shopping list the list is updated every set seconds to sync changes someone else might have made. Useful when shopping with multiple people but might use a little bit '  
                'of mobile data. If lower than instance limit it is reset when saving.'  
            ),
            'sticky_navbar': _('Makes the navbar stick to the top of the page.'),  
            'mealplan_autoadd_shopping': _('Automatically add meal plan ingredients to shopping list.'),
            'mealplan_autoexclude_onhand': _('Exclude ingredients that are on hand.'),
            'left_handed': _('Will optimize the UI for use with your left hand.'),
            'show_step_ingredients': _('Add ingredients table next to recipe steps. Applies at creation time for manually created and URL imported recipes. Individual steps can be overridden in the edit recipe view.')
        }

        widgets = {
            'plan_share': MultiSelectWidget,
            'shopping_share': MultiSelectWidget,
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

    type = forms.ChoiceField(choices=(
        (DEFAULT, _('Default')), (PAPRIKA, 'Paprika'), (NEXTCLOUD, 'Nextcloud Cookbook'),
        (MEALIE, 'Mealie'), (CHOWDOWN, 'Chowdown'), (SAFFRON, 'Saffron'), (CHEFTAP, 'ChefTap'),
        (PEPPERPLATE, 'Pepperplate'), (RECETTETEK, 'RecetteTek'), (RECIPESAGE, 'Recipe Sage'), (DOMESTICA, 'Domestica'),
        (MEALMASTER, 'MealMaster'), (REZKONV, 'RezKonv'), (OPENEATS, 'Openeats'), (RECIPEKEEPER, 'Recipe Keeper'),
        (PLANTOEAT, 'Plantoeat'), (COOKBOOKAPP, 'CookBookApp'), (COPYMETHAT, 'CopyMeThat'), (PDF, 'PDF'), (MELARECIPES, 'Melarecipes'),
        (COOKMATE, 'Cookmate'), (REZEPTSUITEDE, 'Recipesuite.de')
    ))


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
    duplicates = forms.BooleanField(help_text=_(
        'To prevent duplicates recipes with the same name as existing ones are ignored. Check this box to import everything.'),
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

        labels = {
            'text': _('Add your comment: '),
        }
        widgets = {
            'text': forms.Textarea(attrs={'rows': 2, 'cols': 15}),
        }


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


# TODO: Deprecate
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

        labels = {
            'storage': _('Storage'),
            'path': _('Path'),
            'active': _('Active')
        }


# TODO deprecate
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


# TODO deprecate
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
            'shared': _('You can list default users to share recipes with in the settings.'),  
            'note': _('You can use markdown to format this field. See the <a href="/docs/markdown/">docs here</a>')
            
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
        if space.max_users != 0 and (UserPreference.objects.filter(space=space).count() +
                                     InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, space=space).count()) >= space.max_users:
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
            'email': _('An email address is not required but if present the invite link will be sent to the user.'),
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
    trigram_threshold = forms.DecimalField(min_value=0.01, max_value=1, decimal_places=2,
                                           widget=NumberInput(attrs={'class': "form-control-range", 'type': 'range'}),
                                           help_text=_(
                                               'Determines how fuzzy a search is if it uses trigram similarity matching (e.g. low values mean more typos are ignored).'))
    preset = forms.CharField(widget=forms.HiddenInput(), required=False)

    class Meta:
        model = SearchPreference
        fields = (
            'search', 'lookup', 'unaccent', 'icontains', 'istartswith', 'trigram', 'fulltext', 'trigram_threshold')

        help_texts = {
            'search': _(
                'Select type method of search.  Click <a href="/docs/search/">here</a> for full description of choices.'),
            'lookup': _('Use fuzzy matching on units, keywords and ingredients when editing and importing recipes.'),
            'unaccent': _(
                'Fields to search ignoring accents.  Selecting this option can improve or degrade search quality depending on language'),
            'icontains': _(
                "Fields to search for partial matches.  (e.g. searching for 'Pie' will return 'pie' and 'piece' and 'soapie')"),
            'istartswith': _(
                "Fields to search for beginning of word matches. (e.g. searching for 'sa' will return 'salad' and 'sandwich')"),
            'trigram': _(
                "Fields to 'fuzzy' search. (e.g. searching for 'recpie' will find 'recipe'.)  Note: this option will conflict with 'web' and 'raw' methods of search."),
            'fulltext': _(
                "Fields to full text search.  Note: 'web', 'phrase', and 'raw' search methods only function with fulltext fields."),
        }

        labels = {
            'search': _('Search Method'),
            'lookup': _('Fuzzy Lookups'),
            'unaccent': _('Ignore Accent'),
            'icontains': _("Partial Match"),
            'istartswith': _("Starts With"),
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


class ShoppingPreferenceForm(forms.ModelForm):
    prefix = 'shopping'

    class Meta:
        model = UserPreference

        fields = (
            'shopping_share', 'shopping_auto_sync', 'mealplan_autoadd_shopping', 'mealplan_autoexclude_onhand',
            'mealplan_autoinclude_related', 'shopping_add_onhand', 'default_delay', 'filter_to_supermarket', 'shopping_recent_days', 'csv_delim', 'csv_prefix'
        )

        help_texts = {
            'shopping_share': _('Users will see all items you add to your shopping list.  They must add you to see items on their list.'),
            'shopping_auto_sync': _(
                'Setting to 0 will disable auto sync. When viewing a shopping list the list is updated every set seconds to sync changes someone else might have made. Useful when shopping with multiple people but might use a little bit '  
                'of mobile data. If lower than instance limit it is reset when saving.'  
            ),
            'mealplan_autoadd_shopping': _('Automatically add meal plan ingredients to shopping list.'),
            'mealplan_autoinclude_related': _('When adding a meal plan to the shopping list (manually or automatically), include all related recipes.'),
            'mealplan_autoexclude_onhand': _('When adding a meal plan to the shopping list (manually or automatically), exclude ingredients that are on hand.'),
            'default_delay': _('Default number of hours to delay a shopping list entry.'),
            'filter_to_supermarket': _('Filter shopping list to only include supermarket categories.'),
            'shopping_recent_days': _('Days of recent shopping list entries to display.'),
            'shopping_add_onhand': _("Mark food 'On Hand' when checked off shopping list."),
            'csv_delim': _('Delimiter to use for CSV exports.'),
            'csv_prefix': _('Prefix to add when copying list to the clipboard.'),

        }
        labels = {
            'shopping_share': _('Share Shopping List'),
            'shopping_auto_sync': _('Autosync'),
            'mealplan_autoadd_shopping': _('Auto Add Meal Plan'),
            'mealplan_autoexclude_onhand': _('Exclude On Hand'),
            'mealplan_autoinclude_related': _('Include Related'),
            'default_delay': _('Default Delay Hours'),
            'filter_to_supermarket': _('Filter to Supermarket'),
            'shopping_recent_days': _('Recent Days'),
            'csv_delim': _('CSV Delimiter'),
            "csv_prefix_label": _("List Prefix"),
            'shopping_add_onhand': _("Auto On Hand"),
        }

        widgets = {
            'shopping_share': MultiSelectWidget
        }


class SpacePreferenceForm(forms.ModelForm):
    prefix = 'space'
    reset_food_inherit = forms.BooleanField(label=_("Reset Food Inheritance"), initial=False, required=False,
                                            help_text=_("Reset all food to inherit the fields configured."))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)  # populates the post
        self.fields['food_inherit'].queryset = Food.inheritable_fields

    class Meta:
        model = Space

        fields = ('food_inherit', 'reset_food_inherit', 'show_facet_count', 'use_plural')

        help_texts = {
            'food_inherit': _('Fields on food that should be inherited by default.'),
            'show_facet_count': _('Show recipe counts on search filters'), 
            'use_plural': _('Use the plural form for units and food inside this space.'),
        }

        widgets = {
            'food_inherit': MultiSelectWidget
        }
