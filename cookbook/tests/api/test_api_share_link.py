from django.urls import reverse
from django_scopes import scopes_disabled


def test_get_share_link(recipe_1_s1, u1_s1, u1_s2, g1_s1, a_u, space_1):
    assert u1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 200
    assert u1_s2.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 404
    assert g1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 403
    assert a_u.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 403

    with scopes_disabled():
        space_1.allow_sharing = False
        space_1.save()
        assert u1_s1.get(reverse('api_share_link', args=[recipe_1_s1.pk])).status_code == 403
