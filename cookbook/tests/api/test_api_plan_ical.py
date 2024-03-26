# from datetime import datetime, timedelta
#
# import pytest
# from django.contrib import auth
# from django.urls import reverse
# from icalendar import Calendar
#
# from cookbook.models import MealPlan, MealType
#
# BOUND_URL = 'api_get_plan_ical'
# FROM_URL = 'api_get_plan_ical'
# FUTURE_URL = 'api_get_plan_ical'
#
#
# @pytest.fixture()
# def meal_type(space_1, u1_s1):
#     return MealType.objects.get_or_create(name='test', space=space_1, created_by=auth.get_user(u1_s1))[0]
#
#
# @pytest.fixture()
# def obj_1(space_1, recipe_1_s1, meal_type, u1_s1):
#     return MealPlan.objects.create(recipe=recipe_1_s1, space=space_1, meal_type=meal_type, from_date=datetime.now(), to_date=datetime.now(),
#                                    created_by=auth.get_user(u1_s1))
#
#
# @pytest.fixture
# def obj_2(space_1, recipe_1_s1, meal_type, u1_s1):
#     return MealPlan.objects.create(recipe=recipe_1_s1, space=space_1, meal_type=meal_type, from_date=datetime.now()+timedelta(days=30), to_date=datetime.now()+timedelta(days=30),
#                                    created_by=auth.get_user(u1_s1))
#
# @pytest.fixture
# def obj_3(space_1, recipe_1_s1, meal_type, u1_s1):
#     return MealPlan.objects.create(recipe=recipe_1_s1, space=space_1, meal_type=meal_type, from_date=datetime.now()+timedelta(days=-30), to_date=datetime.now()+timedelta(days=-1),
#                                    created_by=auth.get_user(u1_s1))
#
#
# @pytest.mark.parametrize("arg", [
#     ['a_u', 403],
#     ['g1_s1', 403],
#     ['u1_s1', 200],
#     ['a1_s1', 200],
# ])
# def test_permissions(arg, request):
#     c = request.getfixturevalue(arg[0])
#     assert c.get(reverse(FUTURE_URL)).status_code == arg[1]
#
# def test_future(obj_1, obj_2, obj_3, u1_s1):
#     r = u1_s1.get(reverse(FUTURE_URL))
#     assert r.status_code == 200
#
#     cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
#     events = cal.walk('VEVENT')
#     assert len(events) == 2
#
# def test_from(obj_1, obj_2, obj_3, u1_s1):
#     from_date_slug = (datetime.now()+timedelta(days=1)).strftime("%Y-%m-%d")
#     r = u1_s1.get(reverse(FROM_URL, kwargs={'from_date': from_date_slug}))
#     assert r.status_code == 200
#
#     cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
#     events = cal.walk('VEVENT')
#     assert len(events) == 1
#
# def test_bound(obj_1, obj_2, obj_3, u1_s1):
#     from_date_slug = (datetime.now()+timedelta(days=-1)).strftime("%Y-%m-%d")
#     to_date_slug = (datetime.now()+timedelta(days=1)).strftime("%Y-%m-%d")
#     r = u1_s1.get(reverse(BOUND_URL, kwargs={'from_date': from_date_slug, 'to_date': to_date_slug}))
#     assert r.status_code == 200
#
#     cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
#     events = cal.walk('VEVENT')
#     assert len(events) == 1
#
# def test_event(obj_1, u1_s1):
#     from_date_slug = (datetime.now()+timedelta(days=-1)).strftime("%Y-%m-%d")
#     to_date_slug = (datetime.now()+timedelta(days=1)).strftime("%Y-%m-%d")
#     r = u1_s1.get(reverse(BOUND_URL, kwargs={'from_date': from_date_slug, 'to_date': to_date_slug}))
#
#     cal = Calendar.from_ical(r.getvalue().decode('UTF-8'))
#     events = cal.walk('VEVENT')
#     assert len(events) == 1
#
#     event = events[0]
#     assert int(event['uid']) == obj_1.id
#     assert event['summary'] == f'{obj_1.meal_type.name}: {obj_1.get_label()}'
#     assert event['description'] == obj_1.note
#     assert event.decoded('dtstart') == datetime.now().date()
#     assert event.decoded('dtend') == datetime.now().date()
