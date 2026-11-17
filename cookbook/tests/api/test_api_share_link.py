import json
import uuid

from django.test import override_settings
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.helper.permission_helper import share_link_valid
from cookbook.models import Recipe, ShareLink


def test_get_share_link(recipe_1_s1, u1_s1, u1_s2, g1_s1, a_u, space_1):
    assert u1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 200
    assert u1_s2.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 404
    assert g1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 403
    assert a_u.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 403

    with scopes_disabled():
        sl = json.loads(u1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).content)
        assert share_link_valid(Recipe.objects.filter(pk=sl['pk']).get(), sl['share'])

        space_1.allow_sharing = False
        space_1.save()
        assert u1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 403


def test_share_link_request_limit_allows_exactly_the_configured_number(recipe_1_s1):
    with scopes_disabled():
        share_link = ShareLink.objects.create(
            recipe=recipe_1_s1,
            space=recipe_1_s1.space,
            created_by=recipe_1_s1.created_by,
        )

        with override_settings(SHARING_LIMIT=3):
            assert share_link_valid(recipe_1_s1, str(share_link.uuid))
            assert share_link_valid(recipe_1_s1, str(share_link.uuid))
            assert share_link_valid(recipe_1_s1, str(share_link.uuid))
            assert not share_link_valid(recipe_1_s1, str(share_link.uuid))

        share_link.refresh_from_db()
        assert share_link.request_count == 3


def test_share_link_abuse_block_takes_effect_immediately(recipe_1_s1):
    with scopes_disabled():
        share_link = ShareLink.objects.create(
            recipe=recipe_1_s1,
            space=recipe_1_s1.space,
            created_by=recipe_1_s1.created_by,
        )
        token = str(share_link.uuid)

        assert share_link_valid(recipe_1_s1, token)

        share_link.abuse_blocked = True
        share_link.save()

        assert not share_link_valid(recipe_1_s1, token)


def test_nonexistent_share_link_is_rejected(recipe_1_s1):
    with scopes_disabled():
        assert not share_link_valid(recipe_1_s1, str(uuid.uuid4()))
