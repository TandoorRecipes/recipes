from django.http import JsonResponse

from cookbook.models import Keyword


def find_ld_json(ld_json):
    # recipes type might be wrapped in @graph type
    if '@graph' in ld_json:
        for x in ld_json['@graph']:
            if '@type' in x and x['@type'] == 'Recipe':
                ld_json = x

    if '@type' in ld_json and ld_json['@type'] == 'Recipe':

        if 'recipeIngredient' in ld_json:
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
            if type(ld_json['keywords']) == str:
                ld_json['keywords'] = ld_json['keywords'].split(',')

            for kw in ld_json['keywords']:
                if k := Keyword.objects.filter(name=kw).first():
                    keywords.append({'id': str(k.id), 'text': str(k).strip()})
                else:
                    keywords.append({'id': "null", 'text': kw.strip()})

            ld_json['keywords'] = keywords

        if 'recipeInstructions' in ld_json:
            instructions = ''
            if type(ld_json['recipeInstructions']) == list:
                for i in ld_json['recipeInstructions']:
                    if type(i) == str:
                        instructions += i
                    else:
                        instructions += i['text'] + '\n\n'
                ld_json['recipeInstructions'] = instructions

        if 'image' in ld_json:
            if (type(ld_json['image'])) == list:
                if type(ld_json['image'][0]) == str:
                    ld_json['image'] = ld_json['image'][0]
                elif 'url' in ld_json['image'][0]:
                    ld_json['image'] = ld_json['image'][0]['url']

        return JsonResponse(ld_json)
