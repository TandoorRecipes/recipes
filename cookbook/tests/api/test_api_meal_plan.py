import json
from datetime import time, timedelta
from django.utils import timezone

import pytest
from django.contrib import auth
from django.urls import reverse
from django_scopes import scope, scopes_disabled
from icalendar import Calendar
from oauth2_provider.models import AccessToken
from rest_framework.test import APIClient

from cookbook.models import MealPlan, MealType
from cookbook.tests.factories import RecipeFactory

LIST_URL = 'api:mealplan-list'
DETAIL_URL = 'api:mealplan-detail'
ICAL_URL = 'api:mealplan-ical'

# NOTE: auto adding shopping list from meal plan is tested in test_shopping_recipe as tests are identical


@pytest.fixture()
def meal_type(space_1, u1_s1):
    return MealType.objects.get_or_create(name='test',
                                          space=space_1,
                                          created_by=auth.get_user(u1_s1))[0]


@pytest.fixture()
def obj_1(space_1, recipe_1_s1, meal_type, u1_s1):
    return MealPlan.objects.create(recipe=recipe_1_s1,
                                   space=space_1,
                                   meal_type=meal_type,
                                   from_date=timezone.now(),
                                   to_date=timezone.now(),
                                   created_by=auth.get_user(u1_s1))


@pytest.fixture
def obj_2(space_1, recipe_1_s1, meal_type, u1_s1):
    return MealPlan.objects.create(recipe=recipe_1_s1,
                                   space=space_1,
                                   meal_type=meal_type,
                                   from_date=timezone.now(),
                                   to_date=timezone.now(),
                                   created_by=auth.get_user(u1_s1))


@pytest.fixture
def obj_3(space_1, recipe_1_s1, meal_type, u1_s1):
    return MealPlan.objects.create(recipe=recipe_1_s1,
                                   space=space_1,
                                   meal_type=meal_type,
                                   from_date=timezone.now() - timedelta(days=30),
                                   to_date=timezone.now() - timedelta(days=1),
                                   created_by=auth.get_user(u1_s1))


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_space(obj_1, obj_2, u1_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(
        reverse(LIST_URL)).content)['results']) == 2
    assert len(json.loads(u1_s2.get(
        reverse(LIST_URL)).content)['results']) == 0

    obj_1.space = space_2
    obj_1.save()

    assert len(json.loads(u1_s1.get(
        reverse(LIST_URL)).content)['results']) == 1
    assert len(json.loads(u1_s2.get(
        reverse(LIST_URL)).content)['results']) == 0


def test_list_filter(obj_1, u1_s1):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)['results']
    assert len(response) == 1

    response = json.loads(
        u1_s1.get(
            f'{reverse(LIST_URL)}?meal_type={response[0]["meal_type"]["id"]}').
        content)['results']
    assert len(response) == 1

    response = json.loads(
        u1_s1.get(f'{reverse(LIST_URL)}?meal_type=0').content)['results']
    assert len(response) == 0

    response = json.loads(
        u1_s1.get(
            f'{reverse(LIST_URL)}?from_date={(timezone.localtime(timezone.now()) + timedelta(days=1)).strftime("%Y-%m-%d")}'
        ).content)['results']
    assert len(response) == 0

    response = json.loads(
        u1_s1.get(
            f'{reverse(LIST_URL)}?to_date={(timezone.localtime(timezone.now()) - timedelta(days=1)).strftime("%Y-%m-%d")}'
        ).content)['results']
    assert len(response) == 0

    response = json.loads(
        u1_s1.get(
            f'{reverse(LIST_URL)}?from_date={(timezone.localtime(timezone.now()) - timedelta(days=1)).strftime("%Y-%m-%d")}&to_date={(timezone.localtime(timezone.now()) + timedelta(days=1)).strftime("%Y-%m-%d")}'
        ).content)['results']
    assert len(response) == 1


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_update(arg, request, obj_1):
    c = request.getfixturevalue(arg[0])
    r = c.patch(reverse(DETAIL_URL, args={obj_1.id}), {'title': 'new'},
                content_type='application/json')
    response = json.loads(r.content)
    assert r.status_code == arg[1]
    if r.status_code == 200:
        assert response['title'] == 'new'


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 201],
    ['u1_s1', 201],
    ['a1_s1', 201],
])
def test_add(arg, request, u1_s2, recipe_1_s1, meal_type):
    c = request.getfixturevalue(arg[0])
    r = c.post(reverse(LIST_URL), {
        'recipe': {
            'id': recipe_1_s1.id,
            'name': recipe_1_s1.name,
            'keywords': []
        },
        'meal_type': {
            'id': meal_type.id,
            'name': meal_type.name
        },
        'from_date': (timezone.localtime(timezone.now())).strftime("%Y-%m-%d"),
        'to_date': (timezone.localtime(timezone.now())).strftime("%Y-%m-%d"),
        'servings': 1,
        'title': 'test',
        'shared': []
    },
               content_type='application/json')
    response = json.loads(r.content)
    print(response)
    assert r.status_code == arg[1]
    if r.status_code == 201:
        assert response['title'] == 'test'
        r = c.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 200
        r = u1_s2.get(reverse(DETAIL_URL, args={response['id']}))
        assert r.status_code == 404


def test_delete(u1_s1, u1_s2, obj_1):
    r = u1_s2.delete(reverse(DETAIL_URL, args={obj_1.id}))
    assert r.status_code == 404

    r = u1_s1.delete(reverse(DETAIL_URL, args={obj_1.id}))

    assert r.status_code == 204
    with scopes_disabled():
        assert MealPlan.objects.count() == 0


def test_add_with_shopping(u1_s1, meal_type):
    space = meal_type.space
    with scope(space=space):
        recipe = RecipeFactory.create(space=space)
    u1_s1.post(reverse(LIST_URL), {
        'recipe': {
            'id': recipe.id,
            'name': recipe.name,
            'keywords': []
        },
        'meal_type': {
            'id': meal_type.id,
            'name': meal_type.name
        },
        'from_date': (timezone.localtime(timezone.now())).strftime("%Y-%m-%d"),
        'to_date': (timezone.localtime(timezone.now())).strftime("%Y-%m-%d"),
        'servings': 1,
        'title': 'test',
        'shared': [],
        'addshopping': True
    },
               content_type='application/json')

    assert len(
        json.loads(u1_s1.get(
            reverse('api:shoppinglistentry-list')).content)['results']) == 10


@pytest.mark.parametrize("arg", [
    ['', 2],
    [f'?from_date={timezone.localtime(timezone.now()).strftime("%Y-%m-%d")}', 1],
    [
        f'?to_date={(timezone.localtime(timezone.now()) - timedelta(days=1)).strftime("%Y-%m-%d")}',
        1
    ],
    [
        f'?from_date={(timezone.localtime(timezone.now()) + timedelta(days=1)).strftime("%Y-%m-%d")}&to_date={(timezone.localtime(timezone.now()) + timedelta(days=1)).strftime("%Y-%m-%d")}',
        0
    ],
])
def test_ical(arg, request, obj_1, obj_3, u1_s1):
    r = u1_s1.get(f'{reverse(ICAL_URL)}{arg[0]}')
    assert r.status_code == 200
    cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
    events = cal.walk('VEVENT')
    assert len(events) == arg[1]


def test_ical_event(obj_1, u1_s1):
    r = u1_s1.get(f'{reverse(ICAL_URL)}')
    assert r.status_code == 200
    assert r['Content-Type'] == 'text/calendar'
    assert 'inline' in r['Content-Disposition']

    cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))

    events = cal.walk('VEVENT')
    assert len(events) == 1

    event = events[0]
    # UID must be RFC 5545 compliant (format: identifier@domain)
    assert event['uid'] == f'mealplan-{obj_1.id}@tandoor.recipes'
    assert event['summary'] == f'{obj_1.meal_type.name}: {obj_1.get_label()}'
    assert event['description'] == obj_1.note
    assert event.decoded('dtstart').date() == timezone.now().date()
    assert event.decoded('dtend').date() == timezone.now().date()


def test_ical_event_timezone_aware(space_1, recipe_1_s1, u1_s1):
    """iCal events should have timezone-aware datetimes with correct time from from_date."""
    specific_time = timezone.now().replace(hour=14, minute=30, second=0, microsecond=0)
    with scopes_disabled():
        meal_type = MealType.objects.get_or_create(
            name='lunch', space=space_1, created_by=auth.get_user(u1_s1),
            defaults={'time': time(12, 0)}
        )[0]
        MealPlan.objects.create(
            recipe=recipe_1_s1, space=space_1, meal_type=meal_type,
            from_date=specific_time, to_date=specific_time,
            created_by=auth.get_user(u1_s1)
        )

    r = u1_s1.get(f'{reverse(ICAL_URL)}')
    cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
    events = cal.walk('VEVENT')
    assert len(events) == 1

    event = events[0]
    dtstart = event.decoded('dtstart')
    # Must be timezone-aware
    assert dtstart.tzinfo is not None
    # Time should come from from_date (14:30), not meal_type.time (12:00)
    assert dtstart.hour == 14
    assert dtstart.minute == 30


def test_ical_event_minimum_duration(space_1, recipe_1_s1, u1_s1):
    """iCal events with same from_date and to_date should have minimum 1-hour duration."""
    now = timezone.now().replace(second=0, microsecond=0)
    with scopes_disabled():
        meal_type = MealType.objects.get_or_create(
            name='test_dur', space=space_1, created_by=auth.get_user(u1_s1)
        )[0]
        MealPlan.objects.create(
            recipe=recipe_1_s1, space=space_1, meal_type=meal_type,
            from_date=now, to_date=now,
            created_by=auth.get_user(u1_s1)
        )

    r = u1_s1.get(f'{reverse(ICAL_URL)}')
    cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
    events = cal.walk('VEVENT')
    assert len(events) == 1

    event = events[0]
    dtstart = event.decoded('dtstart')
    dtend = event.decoded('dtend')
    duration = dtend - dtstart
    assert duration >= timedelta(minutes=60)


def test_create_date_only_gets_noon_default(u1_s1, recipe_1_s1, meal_type):
    """Creating a meal plan with date-only string should default to noon local time."""
    r = u1_s1.post(reverse(LIST_URL), {
        'recipe': {'id': recipe_1_s1.id, 'name': recipe_1_s1.name, 'keywords': []},
        'meal_type': {'id': meal_type.id, 'name': meal_type.name},
        'from_date': '2026-06-15',
        'to_date': '2026-06-15',
        'servings': 1,
        'title': 'noon default test',
        'shared': []
    }, content_type='application/json')
    assert r.status_code == 201
    response = json.loads(r.content)
    with scopes_disabled():
        mp = MealPlan.objects.get(pk=response['id'])
    local_from = timezone.localtime(mp.from_date)
    local_to = timezone.localtime(mp.to_date)
    assert local_from.hour == 12
    assert local_from.minute == 0
    assert local_to.hour == 12
    assert local_to.minute == 0


def test_token_permissions(u1_s1, obj_1):
    user = auth.get_user(u1_s1)

    # Client with read write scope
    rw_client = APIClient()
    rw_token = AccessToken.objects.create(user=user, scope='read write', expires=timezone.now() + timedelta(days=1), token='rw_token')
    rw_client.credentials(HTTP_AUTHORIZATION=f'Bearer {rw_token.token}')

    # should be able to use normal endpoints
    assert rw_client.get(reverse(LIST_URL)).status_code == 200
    # should NOT be able to use ical endpoint (it requires 'mealplan' scope)
    assert rw_client.get(reverse(ICAL_URL)).status_code == 403

    # Client with mealplan scope
    mp_client = APIClient()
    mp_token = AccessToken.objects.create(user=user, scope='mealplan', expires=timezone.now() + timedelta(days=1), token='mp_token')
    mp_client.credentials(HTTP_AUTHORIZATION=f'Bearer {mp_token.token}')

    # should be able to use ical endpoint
    assert mp_client.get(reverse(ICAL_URL)).status_code == 200
    # should NOT be able to use normal endpoints
    assert mp_client.get(reverse(LIST_URL)).status_code == 403


def test_create_date_only_with_meal_type_time(u1_s1, recipe_1_s1, space_1):
    """Creating a meal plan with date-only string and meal type with time should use meal type time."""
    with scopes_disabled():
        dinner_type = MealType.objects.create(
            name='dinner_test', space=space_1,
            created_by=auth.get_user(u1_s1), time=time(17, 0)
        )
    r = u1_s1.post(reverse(LIST_URL), {
        'recipe': {'id': recipe_1_s1.id, 'name': recipe_1_s1.name, 'keywords': []},
        'meal_type': {'id': dinner_type.id, 'name': dinner_type.name},
        'from_date': '2026-06-15',
        'to_date': '2026-06-15',
        'servings': 1,
        'title': 'dinner time test',
        'shared': []
    }, content_type='application/json')
    assert r.status_code == 201
    response = json.loads(r.content)
    with scopes_disabled():
        mp = MealPlan.objects.get(pk=response['id'])
    local_from = timezone.localtime(mp.from_date)
    local_to = timezone.localtime(mp.to_date)
    assert local_from.hour == 17
    assert local_from.minute == 0
    assert local_to.hour == 17
    assert local_to.minute == 0


def test_create_explicit_time_preserved(u1_s1, recipe_1_s1, space_1):
    """Creating a meal plan with explicit datetime should preserve that time, ignoring meal type time."""
    with scopes_disabled():
        dinner_type = MealType.objects.create(
            name='dinner_explicit', space=space_1,
            created_by=auth.get_user(u1_s1), time=time(17, 0)
        )
    r = u1_s1.post(reverse(LIST_URL), {
        'recipe': {'id': recipe_1_s1.id, 'name': recipe_1_s1.name, 'keywords': []},
        'meal_type': {'id': dinner_type.id, 'name': dinner_type.name},
        'from_date': '2026-06-15T19:30:00Z',
        'to_date': '2026-06-15T19:30:00Z',
        'servings': 1,
        'title': 'explicit time test',
        'shared': []
    }, content_type='application/json')
    assert r.status_code == 201
    response = json.loads(r.content)
    with scopes_disabled():
        mp = MealPlan.objects.get(pk=response['id'])
    assert mp.from_date.hour == 19
    assert mp.from_date.minute == 30
