import json
import random
import re
from json import JSONDecodeError

import microdata
from bs4 import BeautifulSoup
from cookbook.helper.ingredient_parser import parse as parse_ingredient
from cookbook.models import Keyword
from django.http import JsonResponse
from django.utils.dateparse import parse_duration
from django.utils.translation import gettext as _


def get_from_html(html_text, url):
    soup = BeautifulSoup(html_text, "html.parser")

    # first try finding ld+json as its most common
    for ld in soup.find_all('script', type='application/ld+json'):
        try:
            ld_json = json.loads(ld.string.replace('\n', ''))
            if type(ld_json) != list:
                ld_json = [ld_json]

            for ld_json_item in ld_json:
                # recipes type might be wrapped in @graph type
                if '@graph' in ld_json_item:
                    for x in ld_json_item['@graph']:
                        if '@type' in x and x['@type'] == 'Recipe':
                            ld_json_item = x

                if ('@type' in ld_json_item
                        and ld_json_item['@type'] == 'Recipe'):
                    return JsonResponse(find_recipe_json(ld_json_item, url))
        except JSONDecodeError:
            return JsonResponse(
                {
                    'error': True,
                    'msg': _('The requested site provided malformed data and cannot be read.')  # noqa: E501
                },
                status=400)

    # now try to find microdata
    items = microdata.get_items(html_text)
    for i in items:
        md_json = json.loads(i.json())
        if 'schema.org/Recipe' in str(md_json['type']):
            return JsonResponse(find_recipe_json(md_json['properties'], url))

    return JsonResponse(
        {
            'error': True,
            'msg': _('The requested site does not provide any recognized data format to import the recipe from.')  # noqa: E501
        },
        status=400)


def find_recipe_json(ld_json, url):
    if type(ld_json['name']) == list:
        try:
            ld_json['name'] = ld_json['name'][0]
        except Exception:
            ld_json['name'] = 'ERROR'

    # some sites use ingredients instead of recipeIngredients
    if 'recipeIngredient' not in ld_json and 'ingredients' in ld_json:
        ld_json['recipeIngredient'] = ld_json['ingredients']

    if 'recipeIngredient' in ld_json:
        # some pages have comma separated ingredients in a single array entry
        if (len(ld_json['recipeIngredient']) == 1
                and len(ld_json['recipeIngredient'][0]) > 30):
            ld_json['recipeIngredient'] = ld_json['recipeIngredient'][0].split(',')  # noqa: E501

        for x in ld_json['recipeIngredient']:
            if '\n' in x:
                ld_json['recipeIngredient'].remove(x)
                for i in x.split('\n'):
                    ld_json['recipeIngredient'].insert(0, i)

        ingredients = []

        for x in ld_json['recipeIngredient']:
            if x.replace(' ', '') != '':
                try:
                    amount, unit, ingredient, note = parse_ingredient(x)
                    if ingredient:
                        ingredients.append(
                            {
                                'amount': amount,
                                'unit': {
                                    'text': unit,
                                    'id': random.randrange(10000, 99999)
                                },
                                'ingredient': {
                                    'text': ingredient,
                                    'id': random.randrange(10000, 99999)
                                },
                                'note': note,
                                'original': x
                            }
                        )
                except Exception:
                    ingredients.append(
                        {
                            'amount': 0,
                            'unit': {
                                'text': '',
                                'id': random.randrange(10000, 99999)
                            },
                            'ingredient': {
                                'text': x,
                                'id': random.randrange(10000, 99999)
                            },
                            'note': '',
                            'original': x
                        }
                    )

        ld_json['recipeIngredient'] = ingredients
    else:
        ld_json['recipeIngredient'] = []

    if 'keywords' in ld_json:
        keywords = []

        # keywords as string
        if type(ld_json['keywords']) == str:
            ld_json['keywords'] = ld_json['keywords'].split(',')

        # keywords as string in list
        if (type(ld_json['keywords']) == list
                and len(ld_json['keywords']) == 1
                and ',' in ld_json['keywords'][0]):
            ld_json['keywords'] = ld_json['keywords'][0].split(',')

        # keywords as list
        for kw in ld_json['keywords']:
            if k := Keyword.objects.filter(name=kw).first():
                keywords.append({'id': str(k.id), 'text': str(k).strip()})
            else:
                keywords.append({'id': random.randrange(1111111, 9999999, 1), 'text': kw.strip()})

        ld_json['keywords'] = keywords
    else:
        ld_json['keywords'] = []

    if 'recipeInstructions' in ld_json:
        instructions = ''

        # flatten instructions if they are in a list
        if type(ld_json['recipeInstructions']) == list:
            for i in ld_json['recipeInstructions']:
                if type(i) == str:
                    instructions += i
                else:
                    if 'text' in i:
                        instructions += i['text'] + '\n\n'
                    elif 'itemListElement' in i:
                        for ile in i['itemListElement']:
                            if type(ile) == str:
                                instructions += ile + '\n\n'
                            elif 'text' in ile:
                                instructions += ile['text'] + '\n\n'
                    else:
                        instructions += str(i)
            ld_json['recipeInstructions'] = instructions

        ld_json['recipeInstructions'] = re.sub(r'\n\s*\n', '\n\n', ld_json['recipeInstructions'])  # noqa: E501
        ld_json['recipeInstructions'] = re.sub(' +', ' ', ld_json['recipeInstructions'])  # noqa: E501
        ld_json['recipeInstructions'] = ld_json['recipeInstructions'].replace('<p>', '')  # noqa: E501
        ld_json['recipeInstructions'] = ld_json['recipeInstructions'].replace('</p>', '')  # noqa: E501
    else:
        ld_json['recipeInstructions'] = ''

    if url != '':
        ld_json['recipeInstructions'] += '\n\n' + _('Imported from') + ' ' + url

    if 'image' in ld_json:
        # check if list of images is returned, take first if so
        if (type(ld_json['image'])) == list:
            if type(ld_json['image'][0]) == str:
                ld_json['image'] = ld_json['image'][0]
            elif 'url' in ld_json['image'][0]:
                ld_json['image'] = ld_json['image'][0]['url']

        # ignore relative image paths
        if 'http' not in ld_json['image']:
            ld_json['image'] = ''

    if 'cookTime' in ld_json:
        try:
            if (type(ld_json['cookTime']) == list
                    and len(ld_json['cookTime']) > 0):
                ld_json['cookTime'] = ld_json['cookTime'][0]
            ld_json['cookTime'] = round(
                parse_duration(
                    ld_json['cookTime']
                ).seconds / 60
            )
        except TypeError:
            ld_json['cookTime'] = 0
    else:
        ld_json['cookTime'] = 0

    if 'prepTime' in ld_json:
        try:
            if (type(ld_json['prepTime']) == list
                    and len(ld_json['prepTime']) > 0):
                ld_json['prepTime'] = ld_json['prepTime'][0]
            ld_json['prepTime'] = round(
                parse_duration(
                    ld_json['prepTime']
                ).seconds / 60
            )
        except TypeError:
            ld_json['prepTime'] = 0
    else:
        ld_json['prepTime'] = 0

    try:
        if 'recipeYield' in ld_json:
            if type(ld_json['recipeYield']) == str:
                ld_json['servings'] = int(re.findall(r'\b\d+\b', ld_json['recipeYield'])[0])
            elif type(ld_json['recipeYield']) == list:
                ld_json['servings'] = int(re.findall(r'\b\d+\b', ld_json['recipeYield'][0])[0])
    except Exception as e:
        print(e)
        ld_json['servings'] = 1

    for key in list(ld_json):
        if key not in [
            'prepTime', 'cookTime', 'image', 'recipeInstructions',
            'keywords', 'name', 'recipeIngredient', 'servings'
        ]:
            ld_json.pop(key, None)

    return ld_json
