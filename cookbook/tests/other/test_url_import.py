import json
import pytest
from django.urls import reverse

from ._recipes import (AMERICAS_TEST_KITCHEN)


IMPORT_SOURCE_URL = 'data_import_source'
# These were chosen arbitrarily from:
# Top 10 recipe websites listed here https://www.similarweb.com/top-websites/category/food-and-drink/cooking-and-recipes/
# plus the test that previously existed
# custom scraper that was created
# TODO thoughtfully add recipes that test specific scenerios



@pytest.mark.parametrize("arg", [
    ['a_u', 403],
    ['g1_s1', 404],
    ['u1_s1', 200],
    ['a1_s1', 404],
    ['g1_s2', 404],
    ['u1_s2', 404],
    ['a1_s2', 404],
])
def test_import_permission(arg, request):
    c = request.getfixturevalue(arg[0])
    assert c.get(reverse(IMPORT_SOURCE_URL)).status_code == arg[1]
# TODO this test is really bad, need to find a better solution, also pytest does not like those paths
# def test_ld_json():
#     with scopes_disabled():
#         test_list = [
#             {'file': 'resources/websites/ld_json_1.html', 'result_length': 3237},
#             {'file': 'resources/websites/ld_json_2.html', 'result_length': 1525},
#             {'file': 'resources/websites/ld_json_3.html', 'result_length': 1644},
#             {'file': 'resources/websites/ld_json_4.html', 'result_length': 1744},
#             {'file': 'resources/websites/ld_json_itemList.html', 'result_length': 3222},
#             {'file': 'resources/websites/ld_json_multiple.html', 'result_length': 1621},
#             {'file': 'resources/websites/micro_data_1.html', 'result_length': 1094},
#             {'file': 'resources/websites/micro_data_2.html', 'result_length': 1453},
#             {'file': 'resources/websites/micro_data_3.html', 'result_length': 1163},
#             {'file': 'resources/websites/micro_data_4.html', 'result_length': 4411},
#         ]
#
#         for test in test_list:
#             with open(test['file'], 'rb') as file:
#                 print(f'Testing {test["file"]} expecting length {test["result_length"]}')
#                 parsed_content = json.loads(get_from_html(file.read(), 'test_url', None).content)
#                 assert len(str(parsed_content)) == test['result_length']
#                 file.close()
