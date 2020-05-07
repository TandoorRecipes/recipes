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
        fields = ('default_unit', 'theme', 'nav_color', 'default_page', 'search_style', 'plan_share')

        help_texts = {
            'nav_color': _('Color of the top navigation bar. Not all colors work with all themes, just try them out!'),
            'default_unit': _('Default Unit to be used when inserting a new ingredient into a recipe.'),
            'plan_share': _('Default user to share newly created meal plan entries with.')
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
        fields = ('name', 'instructions', 'image', 'working_time', 'waiting_time', 'keywords')

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'instructions': _('Instructions'),
            'working_time': _('Preparation time in minutes'),
            'waiting_time': _('Waiting time (cooking/baking) in minutes'),
        }
        widgets = {'keywords': MultiSelectWidget}
        help_texts = {
            'instructions': _('You can use markdown to format the instructions. See the <a href="/docs/markdown/">docs here</a>')
        }


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


class IngredientMergeForm(forms.Form):
    prefix = 'ingredient'

    new_ingredient = forms.ModelChoiceField(
        queryset=Ingredient.objects.all(),
        widget=SelectWidget,
        label=_('New Ingredient'),
        help_text=_('New ingredient that other gets replaced by.'),
    )
    old_ingredient = forms.ModelChoiceField(
        queryset=Ingredient.objects.all(),
        widget=SelectWidget,
        label=_('Old Ingredient'),
        help_text=_('Ingredient that should be replaced.'),
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


class IngredientForm(forms.ModelForm):
    class Meta:
        model = Ingredient
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
        fields = ('recipe', 'title', 'meal', 'note', 'date', 'shared')

        widgets = {'recipe': SelectWidget, 'date': DateWidget, 'shared': MultiSelectWidget}
