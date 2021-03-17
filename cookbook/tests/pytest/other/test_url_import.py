import json

from django_scopes import scopes_disabled

from cookbook.helper.ingredient_parser import parse
from cookbook.helper.recipe_url_import import get_from_html
from cookbook.tests.test_setup import TestBase


def test_ld_json():
    with scopes_disabled():
        test_list = [
            {'file': '../resources/websites/ld_json_1.html', 'result_length': 3237},
            {'file': '../resources/websites/ld_json_2.html', 'result_length': 1525},
            {'file': '../resources/websites/ld_json_3.html', 'result_length': 1644},
            {'file': '../resources/websites/ld_json_4.html', 'result_length': 1744},
            {'file': '../resources/websites/ld_json_itemList.html', 'result_length': 3222},
            {'file': '../resources/websites/ld_json_multiple.html', 'result_length': 1621},
            {'file': '../resources/websites/micro_data_1.html', 'result_length': 1094},
            {'file': '../resources/websites/micro_data_2.html', 'result_length': 1453},
            {'file': '../resources/websites/micro_data_3.html', 'result_length': 1163},
            {'file': '../resources/websites/micro_data_4.html', 'result_length': 4411},
        ]

        for test in test_list:
            with open(test['file'], 'rb') as file:
                print(f'Testing {test["file"]} expecting length {test["result_length"]}')
                parsed_content = json.loads(get_from_html(file.read(), 'test_url', None).content)
                assert len(str(parsed_content)) == test['result_length']
                file.close()
