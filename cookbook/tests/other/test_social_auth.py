import uuid
from datetime import timedelta

import pytest
from django.contrib.auth.models import Group, User
from django.test import RequestFactory, override_settings
from django.utils import timezone
from django_scopes import scopes_disabled

from cookbook.forms import AllAuthSocialSignupForm
from cookbook.helper.AllAuthCustomAdapter import AllAuthCustomAdapter
from cookbook.helper.social_adapter import TandoorSocialAccountAdapter, _mask_email
from cookbook.models import InviteLink, Space, UserSpace

pytestmark = pytest.mark.django_db


# ---------------------- FIXTURES -----------------------

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


@pytest.fixture
def adapter():
    return AllAuthCustomAdapter()


def _make_request(view_name, session=None):
    """Create a request with a specific resolver_match view_name."""
    request = RequestFactory().get('/fake/')
    request.session = session or {}

    class FakeMatch:
        pass

    match = FakeMatch()
    match.view_name = view_name
    request.resolver_match = match
    return request


@pytest.fixture
def invite_space():
    with scopes_disabled():
        space = Space.objects.create(name='Invite Space')
        return space


@pytest.fixture
def invite_link(invite_space):
    with scopes_disabled():
        group = Group.objects.get_or_create(name='user')[0]
        admin = User.objects.create_user(username='invite_admin', password='test')
        link = InviteLink.objects.create(
            group=group,
            valid_until=timezone.now().date() + timedelta(days=7),
            space=invite_space,
            created_by=admin,
        )
        return link


# ---------------------- SOCIAL SIGNUP FORM TESTS -----------------------

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


@override_settings(SOCIAL_DEFAULT_ACCESS=True, SOCIAL_DEFAULT_GROUP='nonexistent_group')
def test_social_default_access_bad_group(
    social_signup_space, new_social_user, signup_request
):
    """When SOCIAL_DEFAULT_GROUP doesn't match any Group,
    signup should not crash and should not create a UserSpace."""
    form = AllAuthSocialSignupForm.__new__(AllAuthSocialSignupForm)
    form.signup(signup_request, new_social_user)

    with scopes_disabled():
        assert UserSpace.objects.filter(user=new_social_user).count() == 0


# ---------------------- ADAPTER is_open_for_signup TESTS -----------------------


@override_settings(SOCIAL_PROVIDERS=['allauth.socialaccount.providers.openid_connect'])
def test_adapter_social_signup_allowed_with_providers(adapter):
    """Social signup form should be open when providers are configured."""
    request = _make_request('socialaccount_signup')
    assert adapter.is_open_for_signup(request) is True


@override_settings(SOCIAL_PROVIDERS=[])
def test_adapter_social_signup_blocked_without_providers(adapter):
    """Social signup form should be blocked when no providers configured."""
    request = _make_request('socialaccount_signup')
    assert adapter.is_open_for_signup(request) is False


@override_settings(ENABLE_SIGNUP=True)
def test_adapter_local_signup_allowed_when_enabled(adapter):
    """Local signup should be allowed when ENABLE_SIGNUP is True."""
    request = _make_request('account_signup')
    assert adapter.is_open_for_signup(request) is True


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_local_signup_blocked_when_disabled(adapter):
    """Local signup should be blocked when ENABLE_SIGNUP is False and no invite token."""
    request = _make_request('account_signup')
    assert adapter.is_open_for_signup(request) is False


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_local_signup_allowed_with_invite_token(adapter, invite_link):
    """Local signup should be allowed with a valid invite token even when ENABLE_SIGNUP is False."""
    request = _make_request('account_signup', session={'signup_token': str(invite_link.uuid)})
    assert adapter.is_open_for_signup(request) is True


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_local_signup_blocked_with_expired_invite(adapter, invite_space):
    """Local signup should be blocked when invite token is expired."""
    with scopes_disabled():
        group = Group.objects.get_or_create(name='user')[0]
        admin = User.objects.create_user(username='expired_admin', password='test')
        expired_link = InviteLink.objects.create(
            group=group,
            valid_until=timezone.now().date() - timedelta(days=1),
            space=invite_space,
            created_by=admin,
        )

    request = _make_request('account_signup', session={'signup_token': str(expired_link.uuid)})
    assert adapter.is_open_for_signup(request) is False


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_local_signup_blocked_with_invalid_token(adapter):
    """Local signup should be blocked with a non-existent invite token."""
    request = _make_request('account_signup', session={'signup_token': str(uuid.uuid4())})
    assert adapter.is_open_for_signup(request) is False


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_oauth_callback_allowed(adapter):
    """OAuth callbacks (non-signup views) should not be blocked by ENABLE_SIGNUP."""
    request = _make_request('openid_connect_callback')
    assert adapter.is_open_for_signup(request) is True


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_unknown_view_allowed(adapter):
    """Unknown view names should defer to default (allow), not block."""
    request = _make_request('some_other_view')
    assert adapter.is_open_for_signup(request) is True


@override_settings(ENABLE_SIGNUP=False)
def test_adapter_no_resolver_match(adapter):
    """Request with no resolver_match (e.g. 404) should not crash."""
    request = RequestFactory().get('/fake/')
    request.session = {}
    request.resolver_match = None
    assert adapter.is_open_for_signup(request) is True


# ---------------------- INVITE LINK VIEW TESTS -----------------------


def test_invite_link_unauthenticated_redirects_to_signup(client, invite_link):
    """Unauthenticated user with invite should be redirected to signup."""
    response = client.get(f'/invite/{invite_link.uuid}')
    assert response.status_code == 302
    assert '/accounts/signup/' in response.url



@override_settings(SOCIALACCOUNT_ONLY=True)
def test_invite_link_unauthenticated_social_only_redirects_to_login(client, invite_link):
    """With SOCIALACCOUNT_ONLY, unauthenticated user should be redirected to login."""
    response = client.get(f'/invite/{invite_link.uuid}')
    assert response.status_code == 302
    assert '/accounts/login/' in response.url



def test_invite_link_stores_token_in_session(client, invite_link):
    """Invite link should store the token in the session."""
    client.get(f'/invite/{invite_link.uuid}')
    assert client.session.get('signup_token') == str(invite_link.uuid)



def test_invite_link_authenticated_user_joins_space(client, invite_link, invite_space):
    """Authenticated user following invite link should be added to the space."""
    user = User.objects.create_user(username='invitee', password='test')
    client.force_login(user)

    response = client.get(f'/invite/{invite_link.uuid}')
    assert response.status_code == 302

    with scopes_disabled():
        assert UserSpace.objects.filter(user=user, space=invite_space).exists()



def test_invite_link_invalid_uuid(client):
    """Invalid UUID should redirect to index without crashing."""
    response = client.get('/invite/not-a-valid-uuid')
    assert response.status_code == 302



def test_invite_link_expired(client, invite_space):
    """Expired invite link should redirect to index."""
    with scopes_disabled():
        group = Group.objects.get_or_create(name='user')[0]
        admin = User.objects.create_user(username='exp_admin', password='test')
        expired = InviteLink.objects.create(
            group=group,
            valid_until=timezone.now().date() - timedelta(days=1),
            space=invite_space,
            created_by=admin,
        )
    response = client.get(f'/invite/{expired.uuid}')
    assert response.status_code == 302
    assert 'signup' not in response.url


def test_invite_link_authenticated_user_already_in_space(client, invite_link, invite_space):
    """Authenticated user already in the invite space should redirect to index without error."""
    user = User.objects.create_user(username='existing_member', password='test')
    with scopes_disabled():
        us = UserSpace.objects.create(user=user, space=invite_space, active=True)
        us.groups.add(invite_link.group)
    client.force_login(user)

    response = client.get(f'/invite/{invite_link.uuid}')
    assert response.status_code == 302
    assert 'signup' not in response.url
    # Should not create a duplicate UserSpace
    with scopes_disabled():
        assert UserSpace.objects.filter(user=user, space=invite_space).count() == 1


def test_invite_link_authenticated_user_verifies_group(client, invite_link, invite_space):
    """Authenticated user joining via invite should get the correct group."""
    user = User.objects.create_user(username='group_check', password='test')
    client.force_login(user)

    client.get(f'/invite/{invite_link.uuid}')

    with scopes_disabled():
        user_space = UserSpace.objects.get(user=user, space=invite_space)
        assert user_space.groups.filter(name='user').exists()
        assert user_space.active is True


def test_invite_link_deactivates_other_spaces(client, invite_link, invite_space):
    """Following an invite link should deactivate the user's other active spaces."""
    user = User.objects.create_user(username='multi_space', password='test')
    with scopes_disabled():
        other_space = Space.objects.create(name='Other Space')
        existing_us = UserSpace.objects.create(user=user, space=other_space, active=True)
        existing_us.groups.add(Group.objects.get_or_create(name='user')[0])
    client.force_login(user)

    client.get(f'/invite/{invite_link.uuid}')

    with scopes_disabled():
        existing_us.refresh_from_db()
        assert existing_us.active is False
        new_us = UserSpace.objects.get(user=user, space=invite_space)
        assert new_us.active is True


def test_invite_link_nonexistent_uuid(client):
    """Valid UUID format but no matching invite should redirect to index."""
    response = client.get(f'/invite/{uuid.uuid4()}')
    assert response.status_code == 302
    assert 'signup' not in response.url


# ---------------------- SOCIAL ADAPTER TESTS -----------------------


def test_mask_email_standard():
    assert _mask_email('user@example.com') == 'u***@example.com'


def test_mask_email_short_local():
    assert _mask_email('a@example.com') == 'a***@example.com'


def test_mask_email_no_domain():
    assert _mask_email('nodomain') == '***'


def test_mask_email_empty_local():
    assert _mask_email('@example.com') == '***@example.com'


def test_on_authentication_error_stores_in_cache(rf):
    """on_authentication_error should store masked errors in cache."""
    from django.core.cache import caches

    caches['default'].delete('social_login_errors')
    adapter = TandoorSocialAccountAdapter()
    request = rf.get('/fake/')

    class FakeProvider:
        id = 'test_provider'

    adapter.on_authentication_error(
        request, FakeProvider(), error='denied',
        exception=Exception('Failed for user@secret.com')
    )

    errors = caches['default'].get('social_login_errors', [])
    assert len(errors) == 1
    assert errors[0]['provider'] == 'test_provider'
    assert errors[0]['error'] == 'denied'
    # Email should be masked in cached exception
    assert 'user@secret.com' not in errors[0]['exception']
    assert 'u***@secret.com' in errors[0]['exception']
    assert 'timestamp' in errors[0]


def test_on_authentication_error_caps_at_50(rf):
    """Error cache should keep max 50 entries."""
    from django.core.cache import caches

    caches['default'].delete('social_login_errors')
    adapter = TandoorSocialAccountAdapter()
    request = rf.get('/fake/')

    class FakeProvider:
        id = 'test'

    for i in range(55):
        adapter.on_authentication_error(request, FakeProvider(), error=f'err_{i}')

    errors = caches['default'].get('social_login_errors', [])
    assert len(errors) == 50
    # Most recent should be first
    assert errors[0]['error'] == 'err_54'


def test_on_authentication_error_includes_chained_cause(rf):
    """on_authentication_error should include chained exception causes for debugging."""
    from django.core.cache import caches

    caches['default'].delete('social_login_errors')
    adapter = TandoorSocialAccountAdapter()
    request = rf.get('/fake/')

    class FakeProvider:
        id = 'oidc'

    # Simulate allauth's pattern: ValidationError("invalid_token") from OAuth2Error("JWT ...")
    root_cause = Exception('JWT audience mismatch: expected client123, got other456')
    outer = Exception('Invalid id_token')
    outer.__cause__ = root_cause

    adapter.on_authentication_error(request, FakeProvider(), error='unknown', exception=outer)

    errors = caches['default'].get('social_login_errors', [])
    assert len(errors) == 1
    assert 'JWT audience mismatch' in errors[0]['exception']
    assert 'Invalid id_token' in errors[0]['exception']
    assert '→' in errors[0]['exception']
