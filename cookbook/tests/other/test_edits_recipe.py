import json

from cookbook.helper.recipe_url_import import get_from_html
from cookbook.tests.test_setup import TestBase


class TestEditsRecipe(TestBase):

    def test_ld_json(self):
        test_list = [
            {'file': 'cookbook/tests/resources/websites/ld_json_1.html', 'result_length': 3128},
            {'file': 'cookbook/tests/resources/websites/ld_json_2.html', 'result_length': 1450},
            {'file': 'cookbook/tests/resources/websites/ld_json_3.html', 'result_length': 1545},
            {'file': 'cookbook/tests/resources/websites/ld_json_4.html', 'result_length': 1657},
            {'file': 'cookbook/tests/resources/websites/ld_json_invalid.html', 'result_length': 115},
            {'file': 'cookbook/tests/resources/websites/ld_json_itemList.html', 'result_length': 3131},
            {'file': 'cookbook/tests/resources/websites/ld_json_multiple.html', 'result_length': 1546},
            {'file': 'cookbook/tests/resources/websites/micro_data_1.html', 'result_length': 1022},
            {'file': 'cookbook/tests/resources/websites/micro_data_2.html', 'result_length': 1384},
            {'file': 'cookbook/tests/resources/websites/micro_data_3.html', 'result_length': 1100},
            {'file': 'cookbook/tests/resources/websites/micro_data_4.html', 'result_length': 4231},
        ]

        for test in test_list:
            with open(test['file'], 'rb') as file:
                parsed_content = json.loads(get_from_html(file.read(), 'test_url').content)
                self.assertEqual(len(str(parsed_content)), test['result_length'])
                file.close()
