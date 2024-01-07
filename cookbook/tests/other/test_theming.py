from django.contrib import auth
from django.templatetags.static import static

from cookbook.models import Space, UserPreference, UserFile
from cookbook.templatetags.theming_tags import theme_values, get_theming_values


def test_theming_function(space_1, u1_s1):
    user = auth.get_user(u1_s1)
    # uf = UserFile.objects.create(name='test', space=space_1, created_by=user) #TODO add file tests

    assert get_theming_values(space_1, user)['theme'] == static('themes/tandoor.min.css')
    assert get_theming_values(space_1, user)['nav_bg_color'] == '#ddbf86'
    assert get_theming_values(space_1, user)['nav_text_class'] == 'navbar-light'
    assert get_theming_values(space_1, user)['nav_logo'] == static('assets/brand_logo.png')
    assert get_theming_values(space_1, user)['sticky_nav'] == 'position: sticky; top: 0; left: 0; z-index: 1000;'

    user.userpreference.theme = UserPreference.TANDOOR_DARK
    user.userpreference.nav_bg_color = '#ffffff'
    user.userpreference.nav_text_color = UserPreference.LIGHT
    user.userpreference.nav_sticky = False
    user.userpreference.save()

    assert get_theming_values(space_1, user)['theme'] == static('themes/tandoor_dark.min.css')
    assert get_theming_values(space_1, user)['nav_bg_color'] == '#ffffff'
    assert get_theming_values(space_1, user)['nav_text_class'] == 'navbar-dark'
    assert get_theming_values(space_1, user)['sticky_nav'] == ''

    space_1.space_theme = Space.BOOTSTRAP
    space_1.nav_bg_color = '#000000'
    space_1.nav_text_color = UserPreference.DARK
    space_1.save()

    assert get_theming_values(space_1, user)['theme'] == static('themes/bootstrap.min.css')
    assert get_theming_values(space_1, user)['nav_bg_color'] == '#000000'
    assert get_theming_values(space_1, user)['nav_text_class'] == 'navbar-light'
