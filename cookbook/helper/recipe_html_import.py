import json
from json.decoder import JSONDecodeError

from bs4 import BeautifulSoup
from bs4.element import Tag
# from cookbook.helper.ingredient_parser import parse as parse_ingredient
from cookbook.helper import recipe_url_import as helper


# %%

# %%
def get_from_raw(text):
    def build_node(k, v):
        if isinstance(v, dict):
            node = {
                'name': k,
                'value': k,
                'children': get_children_dict(v)
            }
        elif isinstance(v, list):
            node = {
                'name': k,
                'value': k,
                'children': get_children_list(v)
            }
        else:
            node = {
                'name': k + ": " + str(v),
                'value': str(v)
            }
        return node

    def get_children_dict(children):
        kid_list = []
        for k, v in children.items():
            kid_list.append(build_node(k, v))
        return kid_list

    def get_children_list(children):
        kid_list = []
        for kid in children:
            if type(kid) == list:
                node = {
                    'name': "unknown list",
                    'value': "unknown list",
                    'children': get_children_list(kid)
                }
                kid_list.append(node)
            elif type(kid) == dict:
                for k, v in kid.items():
                    kid_list.append(build_node(k, v))
            else:
                kid_list.append({
                    'name': kid,
                    'value': kid
                })
        return kid_list

    recipe_json = {
                'name': '',
                'description': '',
                'image': '',
                'keywords': [],
                'recipeIngredient': [],
                'recipeInstructions': '',
                'servings': '',
                'prepTime': '',
                'cookTime': ''
                }
    recipe_tree = []
    temp_tree = []
    parse_list = []

    try:
        parse_list.append(json.loads(text))
    except JSONDecodeError:
        soup = BeautifulSoup(text, "html.parser")
        for el in soup.find_all('script', type='application/ld+json'):
            parse_list.append(el)
        for el in soup.find_all(type='application/json'):
            parse_list.append(el)

    # first try finding ld+json as its most common
    for el in parse_list:

        if isinstance(el, Tag):
            el = json.loads(el.string)
            
        for k, v in el.items():
            if isinstance(v, dict):
                node = {
                    'name': k,
                    'value': k,
                    'children': get_children_dict(v)
                }
            elif isinstance(v, list):
                node = {
                    'name': k,
                    'value': k,
                    'children': get_children_list(v)
                }
            else:
                node = {
                    'name': k + ": " + str(v),
                    'value': str(v)
                }
            temp_tree.append(node)
        if ('@type' in el and el['@type'] == 'Recipe'):
            recipe_json = helper.find_recipe_json(el, None)
            recipe_tree += [{'name': 'ld+json', 'children': temp_tree}]
        else:
            recipe_tree += [{'name': 'json', 'children': temp_tree}]

        temp_tree = []

    # overide keyword structure from dict to list
    kws = []
    for kw in recipe_json['keywords']:
        kws.append(kw['text'])
    recipe_json['keywords'] = kws

    return recipe_json, recipe_tree
