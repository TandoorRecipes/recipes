from django import template
from django.templatetags.static import static
from django_scopes import scopes_disabled

from cookbook.models import UserPreference, UserFile, Space
from recipes.settings import STICKY_NAV_PREF_DEFAULT, UNAUTHENTICATED_THEME_FROM_SPACE

register = template.Library()


@register.simple_tag
def theme_url(request):
    themes = {
        UserPreference.BOOTSTRAP: 'themes/bootstrap.min.css',
        UserPreference.FLATLY: 'themes/flatly.min.css',
        UserPreference.DARKLY: 'themes/darkly.min.css',
        UserPreference.SUPERHERO: 'themes/superhero.min.css',
        UserPreference.TANDOOR: 'themes/tandoor.min.css',
        UserPreference.TANDOOR_DARK: 'themes/tandoor_dark.min.css',
    }

    if not request.user.is_authenticated:
        if UNAUTHENTICATED_THEME_FROM_SPACE > 0: # TODO load unauth space setting on boot in settings.py and use them here
            with scopes_disabled():
                return static(themes[Space.objects.filter(id=UNAUTHENTICATED_THEME_FROM_SPACE).first().space_theme])
        else:
            return static('themes/tandoor.min.css')

    if request.space.space_theme in themes:
        return static(themes[request.space.space_theme])
    else:
        if request.user.userpreference.theme in themes:
            return static(themes[request.user.userpreference.theme])
        else:
            raise AttributeError


@register.simple_tag
def custom_theme(request):
    if request.user.is_authenticated and request.space.custom_space_theme:
        return request.space.custom_space_theme.file.url
    elif UNAUTHENTICATED_THEME_FROM_SPACE > 0:
        with scopes_disabled():
            return Space.objects.filter(id=UNAUTHENTICATED_THEME_FROM_SPACE).first().custom_space_theme.file.url


@register.simple_tag
def logo_url(request):
    if not request.user.is_authenticated:
        if UNAUTHENTICATED_THEME_FROM_SPACE > 0:
            with scopes_disabled():
                space = Space.objects.filter(id=UNAUTHENTICATED_THEME_FROM_SPACE).first()
                if getattr(space, 'nav_logo', None):
                    return space.nav_logo.file.url
    if request.user.is_authenticated and getattr(getattr(request, "space", {}), 'nav_logo', None):
        return request.space.nav_logo.file.url
    else:
        return static('assets/brand_logo.png')


@register.simple_tag
def nav_bg_color(request):
    if not request.user.is_authenticated:
        if UNAUTHENTICATED_THEME_FROM_SPACE > 0:
            with scopes_disabled():
                space = Space.objects.filter(id=UNAUTHENTICATED_THEME_FROM_SPACE).first()
                if space.nav_bg_color:
                    return space.nav_bg_color
        return '#ddbf86'
    else:
        if request.space.nav_bg_color:
            return request.space.nav_bg_color
        else:
            return request.user.userpreference.nav_bg_color


@register.simple_tag
def nav_text_color(request):
    type_mapping = {Space.DARK: 'navbar-light',
                    Space.LIGHT: 'navbar-dark'}  # inverted since navbar-dark means the background
    if not request.user.is_authenticated:
        if UNAUTHENTICATED_THEME_FROM_SPACE > 0:
            with scopes_disabled():
                space = Space.objects.filter(id=UNAUTHENTICATED_THEME_FROM_SPACE).first()
                if space.nav_text_color:
                    return type_mapping[space.nav_text_color]
        return 'navbar-light'
    else:
        if request.space.nav_text_color != Space.BLANK:
            return type_mapping[request.space.nav_text_color]
        else:
            return type_mapping[request.user.userpreference.nav_text_color]


@register.simple_tag
def sticky_nav(request):
    if (not request.user.is_authenticated and STICKY_NAV_PREF_DEFAULT) or (
            request.user.is_authenticated and request.user.userpreference.nav_sticky):
        return 'position: sticky; top: 0; left: 0; z-index: 1000;'
    else:
        return ''
