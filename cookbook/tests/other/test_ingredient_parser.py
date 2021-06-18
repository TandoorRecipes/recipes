from cookbook.helper.ingredient_parser import parse


def test_ingredient_parser():
    expectations = {
        "2¼ l Wasser": (2.25, "l", "Wasser", ""),
        "2¼l Wasser": (2.25, "l", "Wasser", ""),
        "¼ l Wasser": (0.25, "l", "Wasser", ""),
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
        "1/2 EL Mehl": (0.5, "EL", "Mehl", ""),
        "1/2 Zwiebel": (0.5, "", "Zwiebel", ""),
        "1/5g Mehl, gesiebt": (0.2, "g", "Mehl", "gesiebt"),
        "1/2 Zitrone, ausgepresst": (0.5, "", "Zitrone", "ausgepresst"),
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
        "400 g Karotte(n)": (400, "g", "Karotte(n)", ""),
        "400g unsalted butter": (400, "g", "butter", "unsalted"),
        "2L Wasser": (2, "L", "Wasser", ""),
        "1 (16 ounce) package dry lentils, rinsed": (1, "package", "dry lentils, rinsed", "16 ounce"),
    }
    # for German you could say that if an ingredient does not have
    # an amount # and it starts with a lowercase letter, then that
    # is a unit ("etwas", "evtl.") does not apply to English tho

    count = 0
    for key, val in expectations.items():
        count += 1
        parsed = parse(key)
        assert val == parsed
