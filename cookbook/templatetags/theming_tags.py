from django import template
from django.templatetags.static import static

from cookbook.models import UserPreference

register = template.Library()


@register.simple_tag
def theme_url(request):
    if not request.user.is_authenticated:
        return static('themes/flatly.min.css')
    themes = {
        UserPreference.BOOTSTRAP: 'themes/bootstrap.min.css',
        UserPreference.FLATLY: 'themes/flatly.min.css',
        UserPreference.DARKLY: 'themes/darkly.min.css',
        UserPreference.SUPERHERO: 'themes/superhero.min.css',
    }
    if request.user.userpreference.theme in themes:
        return static(themes[request.user.userpreference.theme])
    else:
        raise AttributeError


@register.simple_tag
def nav_color(request):
    if not request.user.is_authenticated:
        return 'primary'
    return request.user.userpreference.nav_color


@register.simple_tag
def tabulator_theme_url(request):
    if not request.user.is_authenticated:
        return static('tabulator/tabulator_bootstrap4.min.css')
    themes = {
        UserPreference.BOOTSTRAP: 'tabulator/tabulator_bootstrap4.min.css',
        UserPreference.FLATLY: 'tabulator/tabulator_bootstrap4.min.css',
        UserPreference.DARKLY: 'tabulator/tabulator_site.min.css',
        UserPreference.SUPERHERO: 'tabulator/tabulator_site.min.css',
    }
    if request.user.userpreference.theme in themes:
        return static(themes[request.user.userpreference.theme])
    else:
        raise AttributeError
