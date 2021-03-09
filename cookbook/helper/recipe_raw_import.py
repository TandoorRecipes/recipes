
# %%
import json

from bs4 import BeautifulSoup
# from cookbook.helper.ingredient_parser import parse as parse_ingredient
from cookbook.helper import recipe_url_import as helper
from django.http import JsonResponse
from django.utils.dateparse import parse_duration


# %%

# %%
def get_from_raw(raw_text):
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

    recipe_items = ['recipeIngredient', 'keywords', 'recipeInstructions', 'image',
                    'cookTime', 'prepTime', 'servings', 'name']
    extra_items = ['recipeYield', 'title', 'recipeCategory', 'recipeCuisine']

    soup = BeautifulSoup(raw_text, "html.parser")
    recipe_json = {}
    recipe_tree = []
    # first try finding ld+json as its most common
    for ld in soup.find_all('script', type='application/ld+json'):
        ld_json = helper.find_recipe_json(json.loads(ld.string), '')
        for item in recipe_items:
            if item in ld_json:
                recipe_json[item] = ld_json[item]
                recipe_items.remove(item)
                del ld_json[item]
        for k, v in ld_json.items():
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
            recipe_tree.append(node)
    # TODO put recipe_tree and json_recipe in the JSON response
    print(recipe_tree)
    return recipe_json, recipe_tree
