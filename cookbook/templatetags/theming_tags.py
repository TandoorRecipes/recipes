from cookbook.models import UserPreference
from django import template
from django.templatetags.static import static
from recipes.settings import STICKY_NAV_PREF_DEFAULT

register = template.Library()


@register.simple_tag
def theme_url(request):
    if not request.user.is_authenticated:
        return static('themes/tandoor.min.css')
    themes = {
        UserPreference.BOOTSTRAP: 'themes/bootstrap.min.css',
        UserPreference.FLATLY: 'themes/flatly.min.css',
        UserPreference.DARKLY: 'themes/darkly.min.css',
        UserPreference.SUPERHERO: 'themes/superhero.min.css',
        UserPreference.TANDOOR: 'themes/tandoor.min.css',
    }
    if request.user.userpreference.theme in themes:
        return static(themes[request.user.userpreference.theme])
    else:
        raise AttributeError


@register.simple_tag
def nav_color(request):
    if not request.user.is_authenticated:
        return 'primary'
    return request.user.userpreference.nav_color.lower()


@register.simple_tag
def sticky_nav(request):
    if (not request.user.is_authenticated and STICKY_NAV_PREF_DEFAULT) or \
            (request.user.is_authenticated and request.user.userpreference.sticky_navbar):  # noqa: E501
        return 'position: sticky; top: 0; left: 0; z-index: 1000;'
    else:
        return ''


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
