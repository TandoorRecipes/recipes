import json

from cookbook.helper.ingredient_parser import parse
from cookbook.helper.recipe_url_import import get_from_html
from cookbook.tests.test_setup import TestBase


class TestEditsRecipe(TestBase):

    def test_ld_json(self):
        test_list = [
            {'file': 'cookbook/tests/resources/websites/ld_json_1.html', 'result_length': 3218},
            {'file': 'cookbook/tests/resources/websites/ld_json_2.html', 'result_length': 1510},
            {'file': 'cookbook/tests/resources/websites/ld_json_3.html', 'result_length': 1629},
            {'file': 'cookbook/tests/resources/websites/ld_json_4.html', 'result_length': 1729},
            {'file': 'cookbook/tests/resources/websites/ld_json_itemList.html', 'result_length': 3200},
            {'file': 'cookbook/tests/resources/websites/ld_json_multiple.html', 'result_length': 1606},
            {'file': 'cookbook/tests/resources/websites/micro_data_1.html', 'result_length': 1079},
            {'file': 'cookbook/tests/resources/websites/micro_data_2.html', 'result_length': 1429},
            {'file': 'cookbook/tests/resources/websites/micro_data_3.html', 'result_length': 1148},
            {'file': 'cookbook/tests/resources/websites/micro_data_4.html', 'result_length': 4396},
        ]

        for test in test_list:
            with open(test['file'], 'rb') as file:
                print(f'Testing {test["file"]} expecting length {test["result_length"]}')
                parsed_content = json.loads(get_from_html(file.read(), 'test_url').content)
                self.assertEqual(len(str(parsed_content)), test['result_length'])
                file.close()

    def test_ingredient_parser(self):
        expectations = {
            "2¼ l Wasser": (2.25, "l", "Wasser", ""),
            "2¼l Wasser": (2.25, "l", "Wasser", ""),
            "3l Wasser": (3, "l", "Wasser", ""),
            "4 l Wasser": (4, "l", "Wasser", ""),
            "½l Wasser": (0.5, "l", "Wasser", ""),
            "⅛ Liter Sauerrahm": (0.125, "Liter", "Sauerrahm", ""),
            "5 Zwiebeln": (5, "", "Zwiebeln", ""),
            "3 Zwiebeln, gehackt": (3, "", "Zwiebeln", "gehackt"),
            "5 Zwiebeln (gehackt)": (5, "", "Zwiebeln", "gehackt"),
            "1 Zwiebel(n)": (1, "", "Zwiebel(n)", ""),
            "4 1/2 Zwiebeln": (4.5, "", "Zwiebeln", ""),
            "4 ½ Zwiebeln": (4.5, "", "Zwiebeln", ""),
            "etwas Mehl": (0, "", "etwas Mehl", ""),
            "Öl zum Anbraten": (0, "", "Öl zum Anbraten", ""),
            "n. B. Knoblauch, zerdrückt": (0, "", "n. B. Knoblauch", "zerdrückt"),
            "Kräuter, mediterrane (Oregano, Rosmarin, Basilikum)": (
                0, "", "Kräuter, mediterrane", "Oregano, Rosmarin, Basilikum"),
            "600 g Kürbisfleisch (Hokkaido), geschält, entkernt und geraspelt": (
                600, "g", "Kürbisfleisch (Hokkaido)", "geschält, entkernt und geraspelt"),
            "Muskat": (0, "", "Muskat", ""),
            "200 g Mehl, glattes": (200, "g", "Mehl", "glattes"),
            "1 Ei(er)": (1, "", "Ei(er)", ""),
            "1 Prise(n) Salz": (1, "Prise(n)", "Salz", ""),
            "etwas Wasser, lauwarmes": (0, "", "etwas Wasser", "lauwarmes"),
            "Strudelblätter, fertige, für zwei Strudel": (0, "", "Strudelblätter", "fertige, für zwei Strudel"),
            "barrel-aged Bourbon": (0, "", "barrel-aged Bourbon", ""),
            "golden syrup": (0, "", "golden syrup", ""),
            "unsalted butter, for greasing": (0, "", "unsalted butter", "for greasing"),
            "unsalted butter , for greasing": (0, "", "unsalted butter", "for greasing"),  # trim
            "1 small sprig of fresh rosemary": (1, "small", "sprig of fresh rosemary", ""),
            # does not always work perfectly!
            "75 g fresh breadcrumbs": (75, "g", "fresh breadcrumbs", ""),
            "4 acorn squash , or onion squash (600-800g)": (4, "acorn", "squash , or onion squash", "600-800g"),
            "1 x 250 g packet of cooked mixed grains , such as spelt and wild rice": (
                1, "x", "250 g packet of cooked mixed grains", "such as spelt and wild rice"),
            "1 big bunch of fresh mint , (60g)": (1, "big", "bunch of fresh mint ,", "60g"),
            "1 large red onion": (1, "large", "red onion", ""),
            # "2-3 TL Curry": (), # idk what it should use here either
            "1 Zwiebel gehackt": (1, "Zwiebel", "gehackt", ""),
            "1 EL Kokosöl": (1, "EL", "Kokosöl", ""),
            "0.5 paket jäst (à 50 g)": (0.5, "paket", "jäst", "à 50 g"),
            "ägg": (0, "", "ägg", ""),
            "50 g smör eller margarin": (50, "g", "smör eller margarin", ""),
            "3,5 l Wasser": (3.5, "l", "Wasser", ""),
            "3.5 l Wasser": (3.5, "l", "Wasser", ""),
            "400 g Karotte(n)": (400, "g", "Karotte(n)", "")
        }
        # for German you could say that if an ingredient does not have an amount and it starts with a lowercase letter, then that is a unit ("etwas", "evtl.")
        # does not apply to English tho

        errors = 0
        count = 0
        for key, val in expectations.items():
            count += 1
            parsed = parse(key)
            self.assertEqual(val, parsed)
