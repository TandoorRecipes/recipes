import pytest
from django.contrib.auth.models import User
from django.test import RequestFactory, override_settings
from django_scopes import scopes_disabled

from cookbook.forms import AllAuthSocialSignupForm
from cookbook.models import Space, UserSpace


@pytest.fixture
def social_signup_space():
    with scopes_disabled():
        return Space.objects.create(name='Community Space')


@pytest.fixture
def new_social_user():
    return User.objects.create_user(username='social_user', password='test')


@pytest.fixture
def signup_request():
    return RequestFactory().get('/accounts/social/signup/')


@override_settings(SOCIAL_DEFAULT_ACCESS=True, SOCIAL_DEFAULT_GROUP='guest')
def test_social_default_access_adds_user_to_existing_space(
    social_signup_space, new_social_user, signup_request
):
    """When SOCIAL_DEFAULT_ACCESS is enabled, social signup should add
    the user to the first existing space with the configured group."""
    with scopes_disabled():
        assert UserSpace.objects.filter(user=new_social_user).count() == 0

    form = AllAuthSocialSignupForm.__new__(AllAuthSocialSignupForm)
    form.signup(signup_request, new_social_user)

    with scopes_disabled():
        user_spaces = UserSpace.objects.filter(user=new_social_user)
        assert user_spaces.count() == 1
        us = user_spaces.first()
        assert us.space == social_signup_space
        assert us.groups.filter(name='guest').exists()


@override_settings(SOCIAL_DEFAULT_ACCESS=False, SOCIAL_DEFAULT_GROUP='guest')
def test_social_default_access_disabled_does_nothing(
    social_signup_space, new_social_user, signup_request
):
    """When SOCIAL_DEFAULT_ACCESS is disabled, social signup should
    not auto-add the user to any space."""
    form = AllAuthSocialSignupForm.__new__(AllAuthSocialSignupForm)
    form.signup(signup_request, new_social_user)

    with scopes_disabled():
        assert UserSpace.objects.filter(user=new_social_user).count() == 0


@override_settings(SOCIAL_DEFAULT_ACCESS=True, SOCIAL_DEFAULT_GROUP='guest')
def test_social_default_access_uses_first_space(
    new_social_user, signup_request
):
    """When multiple spaces exist, social signup should add the user
    to the first space."""
    with scopes_disabled():
        space_a = Space.objects.create(name='First Space')
        Space.objects.create(name='Second Space')

    form = AllAuthSocialSignupForm.__new__(AllAuthSocialSignupForm)
    form.signup(signup_request, new_social_user)

    with scopes_disabled():
        user_spaces = UserSpace.objects.filter(user=new_social_user)
        assert user_spaces.count() == 1
        assert user_spaces.first().space == space_a


@override_settings(SOCIAL_DEFAULT_ACCESS=True, SOCIAL_DEFAULT_GROUP='guest')
def test_social_default_access_no_space_exists(
    new_social_user, signup_request
):
    """When SOCIAL_DEFAULT_ACCESS is enabled but no spaces exist,
    signup should not crash and should not create a UserSpace."""
    with scopes_disabled():
        assert Space.objects.count() == 0

    form = AllAuthSocialSignupForm.__new__(AllAuthSocialSignupForm)
    form.signup(signup_request, new_social_user)

    with scopes_disabled():
        assert UserSpace.objects.filter(user=new_social_user).count() == 0
