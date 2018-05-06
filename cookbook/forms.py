from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
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

    def __init__(self, *args, **kwargs):
        super(EditRecipeForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('save', _('Save'), css_class='btn-primary'))


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
