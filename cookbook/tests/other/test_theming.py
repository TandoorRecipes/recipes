from django.contrib import auth
from django.templatetags.static import static
from django.test import RequestFactory
from django_scopes import scopes_disabled

from cookbook.models import Space, UserPreference, UserFile
from cookbook.templatetags.theming_tags import theme_values, get_theming_values


def test_theming_function(space_1, u1_s1):

    # uf = UserFile.objects.create(name='test', space=space_1, created_by=user) #TODO add file tests
    user = auth.get_user(u1_s1)
    request = RequestFactory()
    request.user = auth.get_user(u1_s1)
    request.space = space_1

    # defaults apply without setting anything (user preference is automatically created with these defaults)
    assert get_theming_values(request)['theme'] == static('themes/tandoor.min.css')
    assert get_theming_values(request)['nav_bg_color'] == '#ddbf86'
    assert get_theming_values(request)['nav_text_class'] == 'navbar-light'
    assert get_theming_values(request)['nav_logo'] == static('assets/brand_logo.png')
    assert get_theming_values(request)['sticky_nav'] == 'position: sticky; top: 0; left: 0; z-index: 1000;'
    assert get_theming_values(request)['app_name'] == 'Tandoor Recipes'

    with scopes_disabled():
        up = UserPreference.objects.filter(user=request.user).first()
        up.theme = UserPreference.TANDOOR_DARK
        up.nav_bg_color = '#ffffff'
        up.nav_text_color = UserPreference.LIGHT
        up.nav_sticky = False
        up.save()

    request = RequestFactory()
    request.user = auth.get_user(u1_s1)
    request.space = space_1

    # user values apply if only those are present
    assert get_theming_values(request)['theme'] == static('themes/tandoor_dark.min.css')
    assert get_theming_values(request)['nav_bg_color'] == '#ffffff'
    assert get_theming_values(request)['nav_text_class'] == 'navbar-dark'
    assert get_theming_values(request)['sticky_nav'] == ''
    assert get_theming_values(request)['app_name'] == 'Tandoor Recipes'

    space_1.space_theme = Space.BOOTSTRAP
    space_1.nav_bg_color = '#000000'
    space_1.nav_text_color = UserPreference.DARK
    space_1.app_name = 'test_app_name'
    space_1.save()

    request = RequestFactory()
    request.user = auth.get_user(u1_s1)
    request.space = space_1

    # space settings apply when set
    assert get_theming_values(request)['theme'] == static('themes/bootstrap.min.css')
    assert get_theming_values(request)['nav_bg_color'] == '#000000'
    assert get_theming_values(request)['nav_text_class'] == 'navbar-light'
    assert get_theming_values(request)['app_name'] == 'test_app_name'

    user.userspace_set.all().delete()
    request = RequestFactory()
    request.user = auth.get_user(u1_s1)

    # default user settings should apply when user has no space
    assert get_theming_values(request)['nav_bg_color'] == '#ffffff'
    assert get_theming_values(request)['nav_text_class'] == 'navbar-dark'
    assert get_theming_values(request)['nav_logo'] == static('assets/brand_logo.png')
