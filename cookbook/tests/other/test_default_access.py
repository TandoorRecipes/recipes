from types import SimpleNamespace

import pytest
from allauth.core import context
from allauth.socialaccount.models import SocialAccount, SocialLogin
from django.contrib.auth.models import AnonymousUser, Group, User
from django.core.exceptions import ImproperlyConfigured
from django.test import RequestFactory
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.helper.AllAuthCustomAdapter import AllAuthCustomAdapter
from cookbook.helper.social_adapter import TandoorSocialAccountAdapter
from cookbook.helper.default_access import ensure_default_access
from cookbook.models import Space, UserSpace

pytestmark = pytest.mark.django_db


@pytest.fixture
def shared_access(settings):
    settings.ENABLE_SIGNUP = False
    settings.SOCIAL_DEFAULT_ACCESS = True
    settings.SOCIAL_DEFAULT_GROUP = 'user'
    with scopes_disabled():
        Space.objects.create(pk=1, name='Other space')
        space = Space.objects.create(pk=2, name='LDAP community')
    settings.SOCIAL_DEFAULT_SPACE_ID = '2'
    return space


@pytest.mark.parametrize('signup_form', [False, True], ids=['automatic-social', 'social-form'])
def test_registration_joins_only_configured_space(shared_access, client, signup_form):
    request = RequestFactory().get('/accounts/social/signup/')
    request.user = AnonymousUser()
    request.session = client.session
    sociallogin = SocialLogin(user=User(username='new_external_user'), account=SocialAccount(provider='openid_connect', uid='external-1'))
    form = SimpleNamespace(sociallogin=sociallogin, cleaned_data={'username': 'new_external_user'}) if signup_form else None
    adapter = TandoorSocialAccountAdapter()
    assert adapter.is_open_for_signup(request, sociallogin)
    assert not AllAuthCustomAdapter().is_open_for_signup(request)
    with context.request_context(request):
        user = adapter.save_user(request, sociallogin, form=form)
    client.force_login(user)
    for _ in range(2):
        assert client.get(reverse('api:keyword-list')).status_code == 200
    with scopes_disabled():
        membership = UserSpace.objects.get(user=user)
        assert membership.space == shared_access
        assert membership.active
        assert list(membership.groups.values_list('name', flat=True)) == ['user']
        assert Space.objects.count() == 2
        assert not Space.objects.filter(created_by=user).exists()


def test_ldap_first_login_with_public_registration_closed(shared_access, settings, client, monkeypatch):
    from django_auth_ldap.backend import _LDAPUser

    settings.AUTHENTICATION_BACKENDS = ['django_auth_ldap.backend.LDAPBackend']
    settings.AUTH_LDAP_USER_ATTR_MAP = {}
    settings.AUTH_LDAP_USER_FLAGS_BY_GROUP = {}
    # Only mock directory access: the LDAP backend still provisions and saves the user.
    monkeypatch.setattr(_LDAPUser, '_authenticate_user_dn', lambda self, password: None)
    monkeypatch.setattr(_LDAPUser, '_check_requirements', lambda self: None)
    assert client.login(username='new_ldap_user', password='directory-password')
    user = User.objects.get(username='new_ldap_user')
    assert not user.has_usable_password()
    assert client.get(reverse('api:keyword-list')).status_code == 200
    with scopes_disabled():
        membership = UserSpace.objects.get(user=user)
        assert membership.space == shared_access
        assert membership.active
        assert list(membership.groups.values_list('name', flat=True)) == ['user']
        assert Space.objects.count() == 2
        assert not Space.objects.filter(created_by=user).exists()


@pytest.mark.parametrize('space_id', ['999', 'invalid'])
def test_invalid_target_never_creates_or_joins_another_space(shared_access, settings, client, space_id):
    settings.SOCIAL_DEFAULT_SPACE_ID = space_id
    user = User.objects.create_user(username='external_user')
    client.force_login(user)
    with pytest.raises(ImproperlyConfigured, match='SOCIAL_DEFAULT_SPACE_ID'):
        client.get(reverse('api:keyword-list'))
    with scopes_disabled():
        assert not UserSpace.objects.filter(user=user).exists()
        assert Space.objects.count() == 2


@pytest.mark.parametrize('missing', ['space', 'group'])
def test_unavailable_default_access_never_creates_personal_space(settings, client, missing):
    settings.SOCIAL_DEFAULT_ACCESS = True
    settings.SOCIAL_DEFAULT_SPACE_ID = None
    settings.SOCIAL_DEFAULT_GROUP = 'missing' if missing == 'group' else 'user'
    with scopes_disabled():
        if missing == 'group':
            Space.objects.create(name='Shared space')
        count = Space.objects.count()
    user = User.objects.create_user(username='external_user')
    client.force_login(user)
    assert client.get(reverse('api:keyword-list')).status_code == 403
    with scopes_disabled():
        assert not UserSpace.objects.filter(user=user).exists()
        assert Space.objects.count() == count


def test_default_access_preserves_existing_membership(shared_access):
    user = User.objects.create_user(username='existing_user')
    with scopes_disabled():
        membership = UserSpace.objects.create(user=user, space_id=1, active=True)
        membership.groups.add(Group.objects.get(name='admin'))
        for _ in range(2):
            assert ensure_default_access(user).pk == membership.pk
        assert UserSpace.objects.filter(user=user).count() == 1
        assert list(membership.groups.values_list('name', flat=True)) == ['admin']


def test_unset_target_preserves_first_space_default(shared_access, settings):
    settings.SOCIAL_DEFAULT_SPACE_ID = None
    user = User.objects.create_user(username='external_user')
    membership = ensure_default_access(user)
    assert membership.space_id == 1
    assert membership.active


def test_token_authenticated_first_request_joins_configured_space(shared_access, client, monkeypatch):
    from oauth2_provider.contrib.rest_framework import OAuth2Authentication

    user = User.objects.create_user(username='token_user')
    monkeypatch.setattr(OAuth2Authentication, 'authenticate', lambda self, request: (user, None))
    assert client.get(reverse('api:keyword-list')).status_code == 200
    with scopes_disabled():
        assert UserSpace.objects.get(user=user).space == shared_access
        assert Space.objects.count() == 2


def test_account_adapter_commit_false_does_not_provision_space():
    request = RequestFactory().get('/account/signup/')
    user = User(username='pending_user')
    form = SimpleNamespace(cleaned_data={'username': 'pending_user'})
    with context.request_context(request):
        result = AllAuthCustomAdapter().save_user(request, user, form, commit=False)
    assert result.pk is None
    with scopes_disabled():
        assert not Space.objects.exists()
