import uuid

from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.helper.permission_helper import share_link_valid
from cookbook.models import ShareLink


def test_share(recipe_1_s1, u1_s1, a_u):
    with scopes_disabled():
        url = reverse('view_recipe', kwargs={'pk': recipe_1_s1.pk})
        r = u1_s1.get(url)
        assert r.status_code == 200

        r = a_u.get(url)
        assert r.status_code == 302

        url = reverse('new_share_link', kwargs={'pk': recipe_1_s1.pk})
        r = u1_s1.get(url)
        assert r.status_code == 302
        share = ShareLink.objects.filter(recipe=recipe_1_s1).first()
        assert share
        assert share_link_valid(recipe_1_s1, share.uuid)

        url = reverse(
            'view_recipe',
            kwargs={'pk': recipe_1_s1.pk, 'share': share.uuid}
        )
        r = a_u.get(url)
        assert r.status_code == 200

        url = reverse(
            'view_recipe',
            kwargs={'pk': (recipe_1_s1.pk + 1), 'share': share.uuid}
        )
        r = a_u.get(url)
        assert r.status_code == 404

        url = reverse(
            'view_recipe',
            kwargs={'pk': recipe_1_s1.pk, 'share': uuid.uuid4()}
        )
        r = a_u.get(url)
        assert r.status_code == 302
