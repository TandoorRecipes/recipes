from django import template
from django.templatetags.static import static
from django_scopes import scopes_disabled

from cookbook.models import UserPreference, UserFile, Space
from recipes.settings import STICKY_NAV_PREF_DEFAULT, UNAUTHENTICATED_THEME_FROM_SPACE, FORCE_THEME_FROM_SPACE

register = template.Library()


@register.simple_tag
def theme_values(request):
    return get_theming_values(request)


def get_theming_values(request):
    space = None
    if getattr(request, 'space', None):
        space = request.space
    if not request.user.is_authenticated and UNAUTHENTICATED_THEME_FROM_SPACE > 0 and FORCE_THEME_FROM_SPACE == 0:
        with scopes_disabled():
            space = Space.objects.filter(id=UNAUTHENTICATED_THEME_FROM_SPACE).first()
    if FORCE_THEME_FROM_SPACE:
        with scopes_disabled():
            space = Space.objects.filter(id=FORCE_THEME_FROM_SPACE).first()

    themes = {
        UserPreference.BOOTSTRAP: 'themes/bootstrap.min.css',
        UserPreference.FLATLY: 'themes/flatly.min.css',
        UserPreference.DARKLY: 'themes/darkly.min.css',
        UserPreference.SUPERHERO: 'themes/superhero.min.css',
        UserPreference.TANDOOR: 'themes/tandoor.min.css',
        UserPreference.TANDOOR_DARK: 'themes/tandoor_dark.min.css',
    }
    nav_text_type_mapping = {Space.DARK: 'navbar-light',
                             Space.LIGHT: 'navbar-dark'}  # inverted since navbar-dark means the background

    tv = {
        'logo_color_32': static('assets/logo_color_32.png'),
        'logo_color_128': static('assets/logo_color_128.png'),
        'logo_color_144': static('assets/logo_color_144.png'),
        'logo_color_180': static('assets/logo_color_180.png'),
        'logo_color_192': static('assets/logo_color_192.png'),
        'logo_color_512': static('assets/logo_color_512.png'),
        'logo_color_svg': static('assets/logo_color_svg.svg'),
        'custom_theme': None,
        'theme': static(themes[UserPreference.TANDOOR]),
        'nav_logo': static('assets/brand_logo.png'),
        'nav_bg_color': '#ddbf86',
        'nav_text_class': 'navbar-light',
        'sticky_nav': 'position: sticky; top: 0; left: 0; z-index: 1000;',
        'app_name': 'Tandoor Recipes',
    }

    if request.user.is_authenticated:
        if request.user.userpreference.theme in themes:
            tv['theme'] = static(themes[request.user.userpreference.theme])
        if request.user.userpreference.nav_bg_color:
            tv['nav_bg_color'] = request.user.userpreference.nav_bg_color
        if request.user.userpreference.nav_text_color and request.user.userpreference.nav_text_color in nav_text_type_mapping:
            tv['nav_text_class'] = nav_text_type_mapping[request.user.userpreference.nav_text_color]
        if not request.user.userpreference.nav_sticky:
            tv['sticky_nav'] = ''

    if space:
        for logo in list(tv.keys()):
            if logo.startswith('logo_color_') and getattr(space, logo, None):
                tv[logo] = getattr(space, logo).file.url

        if space.custom_space_theme:
            tv['custom_theme'] = space.custom_space_theme.file.url
        if space.space_theme in themes:
            tv['theme'] = static(themes[space.space_theme])
        if space.nav_logo:
            tv['nav_logo'] = space.nav_logo.file.url
        if space.nav_bg_color:
            tv['nav_bg_color'] = space.nav_bg_color
        if space.nav_text_color and space.nav_text_color in nav_text_type_mapping:
            tv['nav_text_class'] = nav_text_type_mapping[space.nav_text_color]
        if space.app_name:
            tv['app_name'] = space.app_name
    return tv
