from django import forms
from django.forms import widgets
from django.urls import reverse, reverse_lazy
from django.utils.translation import gettext as _
from emoji_picker.widgets import EmojiPickerTextInput

from .models import *


class SelectWidget(widgets.Select):
    class Media:
        js = ('custom/js/form_select.js',)


class MultiSelectWidget(widgets.SelectMultiple):
    class Media:
        js = ('custom/js/form_multiselect.js',)


# yes there are some stupid browsers that still dont support this but i dont support people using these browsers
class DateWidget(forms.DateInput):
    input_type = 'date'

    def __init__(self, **kwargs):
        kwargs["format"] = "%Y-%m-%d"
        super().__init__(**kwargs)


class UserPreferenceForm(forms.ModelForm):
    prefix = 'preference'

    class Meta:
        model = UserPreference
        fields = ('default_unit', 'theme', 'nav_color', 'default_page', 'show_recent', 'search_style', 'plan_share', 'ingredient_decimals', 'shopping_auto_sync', 'comments')

        help_texts = {
            'nav_color': _('Color of the top navigation bar. Not all colors work with all themes, just try them out!'),
            'default_unit': _('Default Unit to be used when inserting a new ingredient into a recipe.'),
            'plan_share': _('Default user to share newly created meal plan entries with.'),
            'show_recent': _('Show recently viewed recipes on search page.'),
            'ingredient_decimals': _('Number of decimals to round ingredients.'),
            'comments': _('If you want to be able to create and see comments underneath recipes.'),
            'shopping_auto_sync': _(
                'Setting to 0 will disable auto sync. When viewing a shopping list the list is updated every set seconds to sync changes someone else might have made. Useful when shopping with multiple people but might use a little bit '
                'of mobile data. If lower than instance limit it is reset when saving.')
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
    storage = forms.ModelChoiceField(queryset=Storage.objects.all(), disabled=True, required=False)
    file_uid = forms.CharField(disabled=True, required=False)

    class Meta:
        model = Recipe
        fields = ('name', 'keywords', 'working_time', 'waiting_time', 'file_path', 'storage', 'file_uid')

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'working_time': _('Preparation time in minutes'),
            'waiting_time': _('Waiting time (cooking/baking) in minutes'),
            'file_path': _('Path'),
            'file_uid': _('Storage UID'),
        }
        widgets = {'keywords': MultiSelectWidget}


class InternalRecipeForm(forms.ModelForm):
    ingredients = forms.CharField(widget=forms.HiddenInput(), required=False)

    class Meta:
        model = Recipe
        fields = ('name', 'image', 'working_time', 'waiting_time', 'servings', 'keywords')

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'working_time': _('Preparation time in minutes'),
            'waiting_time': _('Waiting time (cooking/baking) in minutes'),
            'servings': _('Number of servings'),
        }
        widgets = {'keywords': MultiSelectWidget}


class ShoppingForm(forms.Form):
    recipe = forms.ModelMultipleChoiceField(
        queryset=Recipe.objects.filter(internal=True).all(),
        widget=MultiSelectWidget
    )
    markdown_format = forms.BooleanField(
        help_text=_('Include <code>- [ ]</code> in list for easier usage in markdown based documents.'),
        required=False,
        initial=False
    )


class ExportForm(forms.Form):
    recipe = forms.ModelChoiceField(
        queryset=Recipe.objects.filter(internal=True).all(),
        widget=SelectWidget
    )
    image = forms.BooleanField(
        help_text=_('Export Base64 encoded image?'),
        required=False
    )
    download = forms.BooleanField(
        help_text=_('Download export directly or show on page?'),
        required=False
    )


class ImportForm(forms.Form):
    recipe = forms.CharField(widget=forms.Textarea, help_text=_('Simply paste a JSON export into this textarea and click import.'))


class UnitMergeForm(forms.Form):
    prefix = 'unit'

    new_unit = forms.ModelChoiceField(
        queryset=Unit.objects.all(),
        widget=SelectWidget,
        label=_('New Unit'),
        help_text=_('New unit that other gets replaced by.'),
    )
    old_unit = forms.ModelChoiceField(
        queryset=Unit.objects.all(),
        widget=SelectWidget,
        label=_('Old Unit'),
        help_text=_('Unit that should be replaced.'),
    )


class FoodMergeForm(forms.Form):
    prefix = 'food'

    new_food = forms.ModelChoiceField(
        queryset=Food.objects.all(),
        widget=SelectWidget,
        label=_('New Food'),
        help_text=_('New food that other gets replaced by.'),
    )
    old_food = forms.ModelChoiceField(
        queryset=Food.objects.all(),
        widget=SelectWidget,
        label=_('Old Food'),
        help_text=_('Food that should be replaced.'),
    )


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


class KeywordForm(forms.ModelForm):
    class Meta:
        model = Keyword
        fields = ('name', 'icon', 'description')
        widgets = {'icon': EmojiPickerTextInput}


class FoodForm(forms.ModelForm):
    class Meta:
        model = Food
        fields = ('name', 'recipe')
        widgets = {'recipe': SelectWidget}


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
        fields = ('name', 'method', 'username', 'password', 'token', 'url')

        help_texts = {
            'url': _(
                'Leave empty for dropbox and enter only base url for nextcloud (<code>/remote.php/webdav/</code> is added automatically)'),
        }


class RecipeBookEntryForm(forms.ModelForm):
    prefix = 'bookmark'

    class Meta:
        model = RecipeBookEntry
        fields = ('book',)


class SyncForm(forms.ModelForm):
    class Meta:
        model = Sync
        fields = ('storage', 'path', 'active')


class BatchEditForm(forms.Form):
    search = forms.CharField(label=_('Search String'))
    keywords = forms.ModelMultipleChoiceField(queryset=Keyword.objects.all().order_by('id'), required=False,
                                              widget=MultiSelectWidget)


class ImportRecipeForm(forms.ModelForm):
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


class RecipeBookForm(forms.ModelForm):
    class Meta:
        model = RecipeBook
        fields = ('name', 'icon', 'description', 'shared')
        widgets = {'icon': EmojiPickerTextInput, 'shared': MultiSelectWidget}


class MealPlanForm(forms.ModelForm):

    def clean(self):
        cleaned_data = super(MealPlanForm, self).clean()

        if cleaned_data['title'] == '' and cleaned_data['recipe'] is None:
            raise forms.ValidationError(_('You must provide at least a recipe or a title.'))

        return cleaned_data

    class Meta:
        model = MealPlan
        fields = ('recipe', 'title', 'meal_type', 'note', 'recipe_multiplier', 'date', 'shared')

        help_texts = {
            'shared': _('You can list default users to share recipes with in the settings.'),
            'note': _('You can use markdown to format this field. See the <a href="/docs/markdown/">docs here</a>'),
            'recipe_multiplier': _('Scaling factor for recipe.')
        }

        widgets = {'recipe': SelectWidget, 'date': DateWidget, 'shared': MultiSelectWidget}


class InviteLinkForm(forms.ModelForm):
    class Meta:
        model = InviteLink
        fields = ('username', 'group', 'valid_until')
        help_texts = {
            'username': _('A username is not required, if left blank the new user can choose one.')
        }


class UserCreateForm(forms.Form):
    name = forms.CharField(label='Username')
    password = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}))
    password_confirm = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}))
