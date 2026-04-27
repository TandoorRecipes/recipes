import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scopes_disabled

from cookbook.models import Food


# Regression: Django >= 5.2 passes `change=True` to ModelAdmin.get_form() via
# **kwargs (Django changed the call signature in #34349). treebeard 5.0.5's
# movenodeform_factory forwards **kwargs to django_modelform_factory, which
# rejects unknown kwargs with `TypeError: modelform_factory() got an
# unexpected keyword argument 'change'`. The cookbook FoodAdmin override
# accepted the call signature but forwarded **kwargs verbatim, surfacing
# the TypeError on every admin food edit. Fix is to accept `change=False`
# explicitly so it doesn't reach **kwargs / movenodeform_factory.


@pytest.fixture()
def admin_client(s1_s1):
    """Promote the Tandoor superuser to is_staff so Django admin will let
    them in (admin requires is_staff regardless of is_superuser)."""
    user = auth.get_user(s1_s1)
    user.is_staff = True
    user.save()
    return s1_s1


@pytest.mark.django_db
def test_admin_food_change_view_loads(admin_client, space_1):
    """Admin change view for Food must render (200) under Django >= 5.2."""
    with scopes_disabled():
        food = Food.add_root(name='Test Food', space=space_1)
    url = reverse('admin:cookbook_food_change', args=[food.pk])
    response = admin_client.get(url)
    assert response.status_code == 200, (
        f"admin change view returned {response.status_code} — "
        "treebeard movenodeform_factory likely rejecting Django 5.2 'change' kwarg"
    )


@pytest.mark.django_db
def test_admin_food_add_view_loads(admin_client):
    """Admin add view for Food must render (200) under Django >= 5.2."""
    url = reverse('admin:cookbook_food_add')
    response = admin_client.get(url)
    assert response.status_code == 200
