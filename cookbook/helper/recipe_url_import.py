import re

from django.http import JsonResponse

from cookbook.models import Keyword


def find_recipe_json(ld_json):
    ld_json['org'] = str(ld_json)

    # some sites use ingredients instead of recipeIngredients
    if 'recipeIngredient' not in ld_json and 'ingredients' in ld_json:
        ld_json['recipeIngredient'] = ld_json['ingredients']

    if 'recipeIngredient' in ld_json:
        # some pages have comma separated ingredients in a single array entry
        if len(ld_json['recipeIngredient']) == 1 and len(ld_json['recipeIngredient'][0]) > 30:
            ld_json['recipeIngredient'] = ld_json['recipeIngredient'][0].split(',')

        ingredients = []

        for x in ld_json['recipeIngredient']:
            ingredient_split = x.split()
            if len(ingredient_split) > 2:
                ingredients.append({'amount': ingredient_split[0], 'unit': ingredient_split[1], 'ingredient': " ".join(ingredient_split[2:])})
            if len(ingredient_split) == 2:
                ingredients.append({'amount': ingredient_split[0], 'unit': '', 'ingredient': " ".join(ingredient_split[1:])})
            if len(ingredient_split) == 1:
                ingredients.append({'amount': 0, 'unit': '', 'ingredient': " ".join(ingredient_split)})

        ld_json['recipeIngredient'] = ingredients

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

    return JsonResponse(ld_json)
