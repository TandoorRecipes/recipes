from cookbook.models import Recipe, Storage
from django.contrib import auth
from django.urls import reverse
from pytest_django.asserts import assertTemplateUsed


def test_switch_recipe(u1_s1, recipe_1_s1, space_1):
    external_recipe = Recipe.objects.create(
        name='Test',
        internal=False,
        created_by=auth.get_user(u1_s1),
        space=space_1,
    )

    url = reverse('edit_recipe', args=[recipe_1_s1.pk])
    r = u1_s1.get(url)
    print(r)
    assert r.status_code == 302

    r = u1_s1.get(r.url)
    assertTemplateUsed(r, 'forms/edit_internal_recipe.html')

    url = reverse('edit_recipe', args=[external_recipe.pk])
    r = u1_s1.get(url)
    assert r.status_code == 302

    r = u1_s1.get(r.url)
    assertTemplateUsed(r, 'generic/edit_template.html')


def test_convert_recipe(u1_s1, space_1):
    external_recipe = Recipe.objects.create(
        name='Test',
        internal=False,
        created_by=auth.get_user(u1_s1),
        space=space_1,
    )

    r = u1_s1.get(reverse('edit_convert_recipe', args=[external_recipe.pk]))
    assert r.status_code == 302

    external_recipe.refresh_from_db()
    assert external_recipe.internal


def test_external_recipe_update(u1_s1, u1_s2, space_1):
    storage = Storage.objects.create(
        name='TestStorage',
        method=Storage.DROPBOX,
        created_by=auth.get_user(u1_s1),
        token='test',
        username='test',
        password='test',
        space=space_1,
    )

    recipe = Recipe.objects.create(
        name='Test',
        created_by=auth.get_user(u1_s1),
        storage=storage,
        space=space_1,
    )

    url = reverse('edit_external_recipe', args=[recipe.pk])

    r = u1_s1.get(url)
    assert r.status_code == 200

    u1_s2.post(
        url,
        {'name': 'Test', 'working_time': 15, 'waiting_time': 15, 'servings': 1, }
    )
    recipe.refresh_from_db()
    assert recipe.working_time == 0
    assert recipe.waiting_time == 0

    u1_s1.post(
        url,
        {'name': 'Test', 'working_time': 15, 'waiting_time': 15, 'servings': 1, }
    )
    recipe.refresh_from_db()
    assert recipe.working_time == 15
    assert recipe.waiting_time == 15
