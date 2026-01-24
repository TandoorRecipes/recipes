import json
import logging
from smtplib import SMTPException
from unittest.mock import patch

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import InviteLink

LIST_URL = 'api:invitelink-list'
DETAIL_URL = 'api:invitelink-detail'


@pytest.mark.parametrize("arg", [
    ['a_u', 403, 0],
    ['g1_s1', 403, 0],
    ['u1_s1', 403, 0],
    ['a1_s1', 200, 1],
    ['a2_s1', 403, 0],
])
def test_list_permission(arg, request, space_1, g1_s1, u1_s1, a1_s1, ids=lambda arg: arg[0]):
    space_1.created_by = auth.get_user(a1_s1)
    space_1.save()
    InviteLink.objects.create(group_id=1, created_by=auth.get_user(a1_s1), space=space_1)

    c = request.getfixturevalue(arg[0])
    result = c.get(reverse(LIST_URL))
    assert result.status_code == arg[1]
    if arg[1] == 200:
        assert len(json.loads(result.content)['results']) == arg[2]


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 200],
    ['g1_s2', 403],
    ['u1_s2', 403],
    ['a1_s2', 403],
])
def test_update(arg, request, space_1, u1_s1, a1_s1, ids=lambda arg: arg[0]):
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        il = InviteLink.objects.create(group_id=1, created_by=auth.get_user(a1_s1), space=space_1)

        c = request.getfixturevalue(arg[0])
        r = c.patch(
            reverse(
                DETAIL_URL,
                args={il.id}
            ),
            {'email': 'test@mail.de'},
            content_type='application/json'
        )
        response = json.loads(r.content)
        print(response)
        assert r.status_code == arg[1]
        if r.status_code == 200:
            assert response['email'] == 'test@mail.de'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 403],
    ['u1_s1', 403],
    ['a1_s1', 201],
    ['a2_s1', 403],
])
def test_add(arg, request, a1_s1, space_1):
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()
        c = request.getfixturevalue(arg[0])

        r = c.post(
            reverse(LIST_URL),
            {'group': {'id': 3, 'name': 'admin'}},
            content_type='application/json'
        )
        print(r.content)
        assert r.status_code == arg[1]


def test_delete(u1_s1, u1_s2, a1_s1, a2_s1, space_1):
    with scopes_disabled():
        il = InviteLink.objects.create(group_id=1, created_by=auth.get_user(a1_s1), space=space_1)

        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # user cant delete
        r = u1_s1.delete(
            reverse(
                DETAIL_URL,
                args={il.id}
            )
        )
        assert r.status_code == 403

        # admin cant delete
        r = a2_s1.delete(
            reverse(
                DETAIL_URL,
                args={il.id}
            )
        )
        assert r.status_code == 403

        # owner can delete
        r = a1_s1.delete(
            reverse(
                DETAIL_URL,
                args={il.id}
            )
        )
        assert r.status_code == 204


# ============================================================================
# Email Status Tests (#1063)
# These tests verify that the API response includes email_sent field
# to indicate whether the invite email was successfully sent.
# ============================================================================

def test_invite_link_email_sent_true_when_configured(a1_s1, space_1, mailoutbox):
    """API response should include email_sent=True when email is configured and sent."""
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # Patch EMAIL_HOST at serializer module level (it's imported at module load time)
        with patch('cookbook.serializer.EMAIL_HOST', 'localhost'):
            r = a1_s1.post(
                reverse(LIST_URL),
                {'group': {'id': 3, 'name': 'admin'}, 'email': 'test@example.com'},
                content_type='application/json'
            )
        assert r.status_code == 201
        response = json.loads(r.content)

        # Field should exist and be True when email sent successfully
        assert 'email_sent' in response
        assert response['email_sent'] is True
        assert len(mailoutbox) == 1


def test_invite_link_email_sent_false_when_not_configured(a1_s1, space_1):
    """API response should include email_sent=False when EMAIL_HOST is empty."""
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # Patch EMAIL_HOST to empty string at serializer module level
        with patch('cookbook.serializer.EMAIL_HOST', ''):
            r = a1_s1.post(
                reverse(LIST_URL),
                {'group': {'id': 3, 'name': 'admin'}, 'email': 'test@example.com'},
                content_type='application/json'
            )
        assert r.status_code == 201
        response = json.loads(r.content)

        # Field should exist and be False when email not configured
        assert 'email_sent' in response
        assert response['email_sent'] is False


def test_invite_link_email_sent_false_on_smtp_failure(a1_s1, space_1):
    """API response should include email_sent=False when SMTP fails."""
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # Patch EMAIL_HOST at serializer module level
        with patch('cookbook.serializer.EMAIL_HOST', 'localhost'):
            with patch('cookbook.serializer.send_mail', side_effect=SMTPException('Connection refused')):
                r = a1_s1.post(
                    reverse(LIST_URL),
                    {'group': {'id': 3, 'name': 'admin'}, 'email': 'test@example.com'},
                    content_type='application/json'
                )

        assert r.status_code == 201  # Link still created
        response = json.loads(r.content)

        # Field should exist and be False when SMTP fails
        assert 'email_sent' in response
        assert response['email_sent'] is False


def test_invite_link_created_even_when_email_fails(a1_s1, space_1):
    """Invite link should be created even if email sending fails."""
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        initial_count = InviteLink.objects.count()

        # Patch EMAIL_HOST at serializer module level
        with patch('cookbook.serializer.EMAIL_HOST', 'localhost'):
            with patch('cookbook.serializer.send_mail', side_effect=SMTPException('Failed')):
                r = a1_s1.post(
                    reverse(LIST_URL),
                    {'group': {'id': 3, 'name': 'admin'}, 'email': 'test@example.com'},
                    content_type='application/json'
                )

        assert r.status_code == 201
        assert InviteLink.objects.count() == initial_count + 1


def test_invite_link_email_failure_is_logged(a1_s1, space_1, caplog):
    """Email failures should be logged for admin visibility."""
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # Patch EMAIL_HOST at serializer module level
        with patch('cookbook.serializer.EMAIL_HOST', 'localhost'):
            with caplog.at_level(logging.ERROR, logger='cookbook.serializer'):
                with patch('cookbook.serializer.send_mail', side_effect=SMTPException('Auth failed')):
                    r = a1_s1.post(
                        reverse(LIST_URL),
                        {'group': {'id': 3, 'name': 'admin'}, 'email': 'test@example.com'},
                        content_type='application/json'
                    )

        assert r.status_code == 201

        # Failure should be logged
        assert 'Failed to send invite email' in caplog.text
        assert 'test@example.com' in caplog.text


def test_invite_link_email_sent_false_when_no_email_provided(a1_s1, space_1):
    """API response should include email_sent=False when no email is provided."""
    with scopes_disabled():
        space_1.created_by = auth.get_user(a1_s1)
        space_1.save()

        # Patch EMAIL_HOST at serializer module level
        with patch('cookbook.serializer.EMAIL_HOST', 'localhost'):
            r = a1_s1.post(
                reverse(LIST_URL),
                {'group': {'id': 3, 'name': 'admin'}},  # No email provided
                content_type='application/json'
            )
        assert r.status_code == 201
        response = json.loads(r.content)

        # Field should exist and be False when no email provided
        assert 'email_sent' in response
        assert response['email_sent'] is False
