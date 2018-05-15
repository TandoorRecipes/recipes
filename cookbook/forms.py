from django.utils.translation import gettext as _
from django import forms
from .models import *


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
