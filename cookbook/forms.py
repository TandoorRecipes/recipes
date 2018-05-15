from django.utils.translation import gettext as _
from django import forms
from .models import *
from django.forms import widgets, TextInput, DateField


class MultiSelectWidget(widgets.SelectMultiple):
    class Media:
        js = ('custom/js/from_multiselect.js',)


class EmojiWidget(forms.TextInput):
    class Media:
        js = 'custom/js/form_emoji.js'


class EditRecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = ('name', 'category', 'keywords', 'path')

        labels = {
            'name': _('Name'),
            'category': _('Category'),
            'keywords': _('Keywords'),
            'path': _('Path'),
        }


class EditCategoryForm(forms.ModelForm):
    class Media:
        js = ('custom/js/form_emoji.js',)

    class Meta:
        model = Category
        fields = ('name', 'icon', 'description')


class MonitorForm(forms.Form):
    path = forms.CharField(label=_('Path'))


class BatchEditForm(forms.Form):
    search = forms.CharField(label=_('Search String'))
    category = forms.ModelChoiceField(queryset=Category.objects.all().order_by('id'), required=False)
    keyword = forms.ModelMultipleChoiceField(queryset=Keyword.objects.all().order_by('id'), required=False)


class ImportRecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = ('name', 'category', 'keywords', 'path')

        labels = {
            'name': _('Name'),
            'category': _('Category'),
            'keywords': _('Keywords'),
            'path': _('Path'),
        }
