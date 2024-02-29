from django.contrib import auth
from django.test import RequestFactory
from django_scopes import scope

from cookbook.helper.ingredient_parser import IngredientParser


def test_ingredient_parser(u1_s1):
    expectations = {
        "2¼ l Wasser": (2.25, "l", "Wasser", ""),
        "3¼l Wasser": (3.25, "l", "Wasser", ""),
        "¼ l Wasser": (0.25, "l", "Wasser", ""),
        "3l Wasser": (3, "l", "Wasser", ""),
        "4 l Wasser": (4, "l", "Wasser", ""),
        "½l Wasser": (0.5, "l", "Wasser", ""),
        "⅛ Liter Sauerrahm": (0.125, "Liter", "Sauerrahm", ""),
        "5 Zwiebeln": (5, None, "Zwiebeln", ""),
        "3 Zwiebeln, gehackt": (3, None, "Zwiebeln", "gehackt"),
        "5 Zwiebeln (gehackt)": (5, None, "Zwiebeln", "gehackt"),
        "1 Zwiebel(n)": (1, None, "Zwiebel(n)", ""),
        "4 1/2 Zwiebeln": (4.5, None, "Zwiebeln", ""),
        "4 ½ Zwiebeln": (4.5, None, "Zwiebeln", ""),
        "1/2 EL Mehl": (0.5, "EL", "Mehl", ""),
        "1/2 Zwiebel": (0.5, None, "Zwiebel", ""),
        "1/5g Mehl, gesiebt": (0.2, "g", "Mehl", "gesiebt"),
        "1/2 Zitrone, ausgepresst": (0.5, None, "Zitrone", "ausgepresst"),
        "etwas Mehl": (0, None, "etwas Mehl", ""),
        "Öl zum Anbraten": (0, None, "Öl zum Anbraten", ""),
        "n. B. Knoblauch, zerdrückt": (0, None, "n. B. Knoblauch", "zerdrückt"),
        "Kräuter, mediterrane (Oregano, Rosmarin, Basilikum)": (
            0, None, "Kräuter, mediterrane", "Oregano, Rosmarin, Basilikum"),
        "600 g Kürbisfleisch (Hokkaido), geschält, entkernt und geraspelt": (
            600, "g", "Kürbisfleisch (Hokkaido)", "geschält, entkernt und geraspelt"),
        "Muskat": (0, None, "Muskat", ""),
        "200 g Mehl, glattes": (200, "g", "Mehl", "glattes"),
        "1 Ei(er)": (1, None, "Ei(er)", ""),
        "1 Prise(n) Salz": (1, "Prise(n)", "Salz", ""),
        "etwas Wasser, lauwarmes": (0, None, "etwas Wasser", "lauwarmes"),
        "Strudelblätter, fertige, für zwei Strudel": (0, None, "Strudelblätter", "fertige, für zwei Strudel"),
        "barrel-aged Bourbon": (0, None, "barrel-aged Bourbon", ""),
        "golden syrup": (0, None, "golden syrup", ""),
        "unsalted butter, for greasing": (0, None, "unsalted butter", "for greasing"),
        "unsalted butter , for greasing": (0, None, "unsalted butter", "for greasing"),  # trim
        "1 small sprig of fresh rosemary": (1, "small", "sprig of fresh rosemary", ""),
        # does not always work perfectly!
        "75 g fresh breadcrumbs": (75, "g", "fresh breadcrumbs", ""),
        "4 acorn squash , or onion squash (600-800g)": (4, "acorn", "squash, or onion squash", "600-800g"),
        "1 x 250 g packet of cooked mixed grains , such as spelt and wild rice": (
            1, "x", "250 g packet of cooked mixed grains", "such as spelt and wild rice"),
        "1 big bunch of fresh mint , (60g)": (1, "big", "bunch of fresh mint,", "60g"),
        "1 large red onion": (1, "large", "red onion", ""),
        # "2-3 TL Curry": (), # idk what it should use here either
        "1 Zwiebel gehackt": (1, "Zwiebel", "gehackt", ""),
        "1 EL Kokosöl": (1, "EL", "Kokosöl", ""),
        "0.5 paket jäst (à 50 g)": (0.5, "paket", "jäst", "à 50 g"),
        "ägg": (0, None, "ägg", ""),
        "50 g smör eller margarin": (50, "g", "smör eller margarin", ""),
        "3,5 l Wasser": (3.5, "l", "Wasser", ""),
        "3.5 l Wasser": (3.5, "l", "Wasser", ""),
        "400 g Karotte(n)": (400, "g", "Karotte(n)", ""),
        "400g unsalted butter": (400, "g", "unsalted butter", ""),
        "2L Wasser": (2, "L", "Wasser", ""),
        "1 (16 ounce) package dry lentils, rinsed": (1, "package", "dry lentils, rinsed", "16 ounce"),
        "2-3 c Water": (2, "c", "Water", "2-3"),
        "Pane (raffermo o secco) 80 g": (80, "g", "Pane", "raffermo o secco"),
        "1 Knoblauchzehe(n), gehackt oder gepresst": (1.0, None, 'Knoblauchzehe(n)', 'gehackt oder gepresst'),
        "1 Porreestange(n) , ca. 200 g": (1.0, None, 'Porreestange(n)', 'ca. 200 g'),  # leading space before comma
        # test for over long food entries to get properly split into the note field
        "1 Lorem ipsum dolor sit amet consetetur sadipscing elitr sed diam nonumy eirmod tempor invidunt ut l Lorem ipsum dolor sit amet consetetur sadipscing elitr sed diam nonumy eirmod tempor invidunt ut l": (
            1.0, 'Lorem', 'ipsum', 'dolor sit amet consetetur sadipscing elitr sed diam nonumy eirmod tempor invidunt ut l Lorem ipsum dolor sit amet consetetur sadipscing elitr sed diam nonumy eirmod tempor invidunt ut l'),
        "1 LoremipsumdolorsitametconsetetursadipscingelitrseddiamnonumyeirmodtemporinviduntutlLoremipsumdolorsitametconsetetursadipscingelitrseddiamnonumyeirmodtemporinviduntutl": (
            1.0, None, 'LoremipsumdolorsitametconsetetursadipscingelitrseddiamnonumyeirmodtemporinviduntutlLoremipsumdolorsitametconsetetursadipscingeli',
            'LoremipsumdolorsitametconsetetursadipscingelitrseddiamnonumyeirmodtemporinviduntutlLoremipsumdolorsitametconsetetursadipscingelitrseddiamnonumyeirmodtemporinviduntutl'),
        "砂糖 50g": (50, "g", "砂糖", ""),
        "卵 4個": (4, "個", "卵", "")

    }
    # for German you could say that if an ingredient does not have
    # an amount # and it starts with a lowercase letter, then that
    # is a unit ("etwas", "evtl.") does not apply to English tho

    # TODO maybe add/improve support for weired stuff like this https://www.rainbownourishments.com/vegan-lemon-tart/#recipe

    user = auth.get_user(u1_s1)
    space = user.userspace_set.first().space
    request = RequestFactory()
    request.user = user
    request.space = space
    ingredient_parser = IngredientParser(request, False, ignore_automations=True)

    count = 0
    with scope(space=space):
        for key, val in expectations.items():
            count += 1
            parsed = ingredient_parser.parse(key)
            print(f'testing if {key} becomes {val}')
            assert parsed == val
