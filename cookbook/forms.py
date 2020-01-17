from dal_select2.widgets import ModelSelect2
from django import forms
from django.forms import widgets, SelectDateWidget
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
        fields = ('name',)


class MealPlanForm(forms.ModelForm):
    class Meta:
        model = MealPlan
        fields = ('recipe', 'meal', 'note', 'date')

        widgets = {'recipe': SelectWidget, 'date': DateWidget}
