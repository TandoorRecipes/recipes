import json

import pytest

from django.contrib import auth
from django.urls import reverse

LIST_URL = 'api:username-list'
DETAIL_URL = 'api:username-detail'


def test_forbidden_methods(u1_s1):
    r = u1_s1.post(
        reverse(LIST_URL))
    assert r.status_code == 405

    r = u1_s1.put(
        reverse(
            DETAIL_URL,
            args=[auth.get_user(u1_s1).pk])
    )
    assert r.status_code == 405

    r = u1_s1.delete(
        reverse(
            DETAIL_URL,
            args=[auth.get_user(u1_s1).pk]
        )
    )
    assert r.status_code == 405


@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 200],
    ['u1_s1', 200],
    ['a1_s1', 200],
])
def test_list(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(LIST_URL)).status_code == arg[1]


def test_list_filter(u1_s1, u2_s1, u1_s2, u2_s2):
    r = u1_s1.get(reverse(LIST_URL))
    assert r.status_code == 200
    response = json.loads(r.content)
    assert len(response) == 2

    obj_u2_s1 = auth.get_user(u2_s1)
    obj_u2_s2 = auth.get_user(u2_s2)

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?filter_list=[{obj_u2_s1.pk},{obj_u2_s2.pk}]').content)
    assert len(response) == 1

    response = json.loads(u1_s1.get(f'{reverse(LIST_URL)}?filter_list=[]').content)
    assert len(response) == 0


def test_list_space(u1_s1, u2_s1, u1_s2, space_2):
    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 2
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 1

    u = auth.get_user(u2_s1)
    u.userpreference.space = space_2
    u.userpreference.save()

    assert len(json.loads(u1_s1.get(reverse(LIST_URL)).content)) == 1
    assert len(json.loads(u1_s2.get(reverse(LIST_URL)).content)) == 2
