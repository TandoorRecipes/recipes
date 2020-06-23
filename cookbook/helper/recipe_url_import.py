import re
from random import random

from django.http import JsonResponse
from django.utils.dateparse import parse_duration
from django.utils.translation import gettext as _

from cookbook.models import Keyword


def find_recipe_json(ld_json, url):
    ld_json['org'] = str(ld_json)

    if type(ld_json['name']) == list:
        try:
            ld_json['name'] = ld_json['name'][0]
        except:
            ld_json['name'] = 'ERROR'

    # some sites use ingredients instead of recipeIngredients
    if 'recipeIngredient' not in ld_json and 'ingredients' in ld_json:
        ld_json['recipeIngredient'] = ld_json['ingredients']

    if 'recipeIngredient' in ld_json:
        # some pages have comma separated ingredients in a single array entry
        if len(ld_json['recipeIngredient']) == 1 and len(ld_json['recipeIngredient'][0]) > 30:
            ld_json['recipeIngredient'] = ld_json['recipeIngredient'][0].split(',')

        for x in ld_json['recipeIngredient']:
            if '\n' in x:
                ld_json['recipeIngredient'].remove(x)
                for i in x.split('\n'):
                    ld_json['recipeIngredient'].insert(0, i)

        ingredients = []

        for x in ld_json['recipeIngredient']:
            ingredient_split = x.split()
            ingredient = None
            amount = 0
            unit = ''
            if len(ingredient_split) > 2:
                ingredient = " ".join(ingredient_split[2:])
                unit = ingredient_split[1]
                try:
                    amount = float(ingredient_split[0].replace(',', '.'))
                except ValueError:
                    amount = 0
                    ingredient = " ".join(ingredient_split)
            if len(ingredient_split) == 2:
                ingredient = " ".join(ingredient_split[1:])
                unit = ''
                try:
                    amount = float(ingredient_split[0].replace(',', '.'))
                except ValueError:
                    amount = 0
                    ingredient = " ".join(ingredient_split)
            if len(ingredient_split) == 1:
                ingredient = " ".join(ingredient_split)

            if ingredient:
                ingredients.append({'amount': amount, 'unit': {'text': unit, 'id': round(random() * 1000)}, 'ingredient': {'text': ingredient, 'id': round(random() * 1000)}, 'original': x})

        ld_json['recipeIngredient'] = ingredients
    else:
        ld_json['recipeIngredient'] = []

    if 'keywords' in ld_json:
        keywords = []

        # keywords as string
        if type(ld_json['keywords']) == str:
            ld_json['keywords'] = ld_json['keywords'].split(',')

        # keywords as string in list
        if type(ld_json['keywords']) == list and len(ld_json['keywords']) == 1 and ',' in ld_json['keywords'][0]:
            ld_json['keywords'] = ld_json['keywords'][0].split(',')

        # keywords as list
        for kw in ld_json['keywords']:
            if k := Keyword.objects.filter(name=kw).first():
                keywords.append({'id': str(k.id), 'text': str(k).strip()})
            else:
                keywords.append({'id': "null", 'text': kw.strip()})

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
                    instructions += i['text'] + '\n\n'
            ld_json['recipeInstructions'] = instructions

        ld_json['recipeInstructions'] = re.sub(r'\n\s*\n', '\n\n', ld_json['recipeInstructions'])
        ld_json['recipeInstructions'] = re.sub(' +', ' ', ld_json['recipeInstructions'])
        ld_json['recipeInstructions'] = ld_json['recipeInstructions'].replace('<p>', '')
        ld_json['recipeInstructions'] = ld_json['recipeInstructions'].replace('</p>', '')
    else:
        ld_json['recipeInstructions'] = ''

    ld_json['recipeInstructions'] += '\n\n' + _('Imported from ') + url

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
        if type(ld_json['cookTime']) == list and len(ld_json['cookTime']) > 0:
            ld_json['cookTime'] = ld_json['cookTime'][0]
        ld_json['cookTime'] = round(parse_duration(ld_json['cookTime']).seconds / 60)
    else:
        ld_json['cookTime'] = 0

    if 'prepTime' in ld_json:
        if type(ld_json['prepTime']) == list and len(ld_json['prepTime']) > 0:
            ld_json['prepTime'] = ld_json['prepTime'][0]
        ld_json['prepTime'] = round(parse_duration(ld_json['prepTime']).seconds / 60)
    else:
        ld_json['prepTime'] = 0

    return JsonResponse(ld_json)
