from django import forms
from django.forms import widgets
from django.utils.translation import gettext as _

from .models import *


class MultiSelectWidget(widgets.SelectMultiple):
    class Media:
        js = ('custom/js/form_multiselect.js',)


class EmojiWidget(forms.TextInput):
    class Media:
        js = ('custom/js/form_emoji.js',)


class ExternalRecipeForm(forms.ModelForm):
    file_path = forms.CharField(disabled=True, required=False)
    storage = forms.ModelChoiceField(queryset=Storage.objects.all(), disabled=True, required=False)
    file_uid = forms.CharField(disabled=True, required=False)

    class Meta:
        model = Recipe
        fields = ('name', 'keywords', 'file_path', 'storage', 'file_uid')

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'file_path': _('Path'),
            'file_uid': _('Storage UID'),
        }
        widgets = {'keywords': MultiSelectWidget}


class InternalRecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = ('name', 'instructions', 'keywords')

        labels = {
            'name': _('Name'),
            'keywords': _('Keywords'),
            'instructions': _('Instructions'),
        }
        widgets = {'keywords': MultiSelectWidget}


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('text', )

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
        widgets = {'icon': EmojiWidget}


class StorageForm(forms.ModelForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password'}), required=False)
    password = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}),
                               required=False)
    token = forms.CharField(widget=forms.TextInput(attrs={'autocomplete': 'new-password', 'type': 'password'}),
                            required=False)

    class Meta:
        model = Storage
        fields = ('name', 'method', 'username', 'password', 'token', 'url')


class SyncForm(forms.ModelForm):
    class Meta:
        model = Sync
        fields = ('storage', 'path')


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
