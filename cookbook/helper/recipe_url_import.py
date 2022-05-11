import random
import re
from html import unescape
from unicodedata import decomposition

from django.utils.dateparse import parse_duration
from django.utils.translation import gettext as _
from isodate import parse_duration as iso_parse_duration
from isodate.isoerror import ISO8601Error
from recipe_scrapers._utils import get_minutes

from cookbook.helper import recipe_url_import as helper
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.models import Keyword


# from recipe_scrapers._utils import get_minutes  ## temporary until/unless upstream incorporates get_minutes() PR


def get_from_scraper(scrape, request):
    # converting the scrape_me object to the existing json format based on ld+json
    recipe_json = {}
    try:
        recipe_json['name'] = parse_name(scrape.title() or None)
    except Exception:
        recipe_json['name'] = None
    if not recipe_json['name']:
        try:
            recipe_json['name'] = scrape.schema.data.get('name') or ''
        except Exception:
            recipe_json['name'] = ''

    try:
        description = scrape.description() or None
    except Exception:
        description = None
    if not description:
        try:
            description = scrape.schema.data.get("description") or ''
        except Exception:
            description = ''

    recipe_json['internal'] = True

    try:
        servings = scrape.yields() or None
    except Exception:
        servings = None
    if not servings:
        try:
            servings = scrape.schema.data.get('recipeYield') or 1
        except Exception:
            servings = 1

    recipe_json['servings'] = parse_servings(servings)
    recipe_json['servings_text'] = parse_servings_text(servings)

    try:
        recipe_json['working_time'] = get_minutes(scrape.prep_time()) or 0
    except Exception:
        try:
            recipe_json['working_time'] = get_minutes(scrape.schema.data.get("prepTime")) or 0
        except Exception:
            recipe_json['working_time'] = 0
    try:
        recipe_json['waiting_time'] = get_minutes(scrape.cook_time()) or 0
    except Exception:
        try:
            recipe_json['waiting_time'] = get_minutes(scrape.schema.data.get("cookTime")) or 0
        except Exception:
            recipe_json['waiting_time'] = 0

    if recipe_json['working_time'] + recipe_json['waiting_time'] == 0:
        try:
            recipe_json['working_time'] = get_minutes(scrape.total_time()) or 0
        except Exception:
            try:
                recipe_json['working_time'] = get_minutes(scrape.schema.data.get("totalTime")) or 0
            except Exception:
                pass

    try:
        recipe_json['image'] = parse_image(scrape.image()) or None
    except Exception:
        recipe_json['image'] = None
    if not recipe_json['image']:
        try:
            recipe_json['image'] = parse_image(scrape.schema.data.get('image')) or ''
        except Exception:
            recipe_json['image'] = ''

    keywords = []
    try:
        if scrape.schema.data.get("keywords"):
            keywords += listify_keywords(scrape.schema.data.get("keywords"))
    except Exception:
        pass
    try:
        if scrape.category():
            keywords += listify_keywords(scrape.category())
    except Exception:
        try:
            if scrape.schema.data.get('recipeCategory'):
                keywords += listify_keywords(scrape.schema.data.get("recipeCategory"))
        except Exception:
            pass
    try:
        if scrape.cuisine():
            keywords += listify_keywords(scrape.cuisine())
    except Exception:
        try:
            if scrape.schema.data.get('recipeCuisine'):
                keywords += listify_keywords(scrape.schema.data.get("recipeCuisine"))
        except Exception:
            pass

    try:
        source_url = scrape.canonical_url()
    except Exception:
        try: 
            source_url = scrape.url
        except Exception:
            pass
    if source_url:
        recipe_json['source_url'] = source_url
        try:
            keywords.append(source_url.replace('http://', '').replace('https://', '').split('/')[0])
        except Exception:
            pass

    try:
        recipe_json['keywords'] = parse_keywords(list(set(map(str.casefold, keywords))), request.space)
    except AttributeError:
        recipe_json['keywords'] = keywords

    ingredient_parser = IngredientParser(request, True)

    recipe_json['steps'] = []
    try:
        for i in parse_instructions(scrape.instructions()):
            recipe_json['steps'].append({'instruction': i, 'ingredients': [], })
    except Exception:
        pass
    if len(recipe_json['steps']) == 0:
        recipe_json['steps'].append({'instruction': '', 'ingredients': [], })

    if len(parse_description(description)) > 256:  # split at 256 as long descriptions dont look good on recipe cards
        recipe_json['steps'][0]['instruction'] = f'*{parse_description(description)}*  \n\n' + recipe_json['steps'][0]['instruction']
    else:
        recipe_json['description'] = parse_description(description)[:512]

    try:
        for x in scrape.ingredients():
            try:
                amount, unit, ingredient, note = ingredient_parser.parse(x)
                ingredient = {
                    'amount': amount,
                    'food': {
                        'name': ingredient,
                    },
                    'unit': None,
                    'note': note,
                    'original_text': x
                }
                if unit:
                    ingredient['unit'] = {'name': unit, }
                recipe_json['steps'][0]['ingredients'].append(ingredient)
            except Exception:
                recipe_json['steps'][0]['ingredients'].append(
                    {
                        'amount': 0,
                        'unit': None,
                        'food': {
                            'name': x,
                        },
                        'note': '',
                        'original_text': x
                    }
                )
    except Exception:
        pass

    return recipe_json


def parse_name(name):
    if type(name) == list:
        try:
            name = name[0]
        except Exception:
            name = 'ERROR'
    return normalize_string(name)


def parse_description(description):
    return normalize_string(description)


def clean_instruction_string(instruction):
    normalized_string = normalize_string(instruction)
    normalized_string = normalized_string.replace('\n', '  \n')
    normalized_string = normalized_string.replace('  \n  \n', '\n\n')
    return normalized_string


def parse_instructions(instructions):
    """
    Convert arbitrary instructions object from website import and turn it into a flat list of strings
    :param instructions: any instructions object from import
    :return: list of strings (from one to many elements depending on website)
    """
    instruction_list = []

    if type(instructions) == list:
        for i in instructions:
            if type(i) == str:
                instruction_list.append(clean_instruction_string(i))
            else:
                if 'text' in i:
                    instruction_list.append(clean_instruction_string(i['text']))
                elif 'itemListElement' in i:
                    for ile in i['itemListElement']:
                        if type(ile) == str:
                            instruction_list.append(clean_instruction_string(ile))
                        elif 'text' in ile:
                            instruction_list.append(clean_instruction_string(ile['text']))
                else:
                    instruction_list.append(clean_instruction_string(str(i)))
    else:
        instruction_list.append(clean_instruction_string(instructions))

    return instruction_list


def parse_image(image):
    # check if list of images is returned, take first if so
    if not image:
        return None
    if type(image) == list:
        for pic in image:
            if (type(pic) == str) and (pic[:4] == 'http'):
                image = pic
            elif 'url' in pic:
                image = pic['url']
    elif type(image) == dict:
        if 'url' in image:
            image = image['url']

    # ignore relative image paths
    if image[:4] != 'http':
        image = ''
    return image


def parse_servings(servings):
    if type(servings) == str:
        try:
            servings = int(re.search(r'\d+', servings).group())
        except AttributeError:
            servings = 1
    elif type(servings) == list:
        try:
            servings = int(re.findall(r'\b\d+\b', servings[0])[0])
        except KeyError:
            servings = 1
    return servings


def parse_servings_text(servings):
    if type(servings) == str:
        try:
            servings = re.sub("\d+", '', servings).strip()
        except Exception:
            servings = ''
    return servings


def parse_time(recipe_time):
    if type(recipe_time) not in [int, float]:
        try:
            recipe_time = float(re.search(r'\d+', recipe_time).group())
        except (ValueError, AttributeError):
            try:
                recipe_time = round(iso_parse_duration(recipe_time).seconds / 60)
            except ISO8601Error:
                try:
                    if (type(recipe_time) == list and len(recipe_time) > 0):
                        recipe_time = recipe_time[0]
                    recipe_time = round(parse_duration(recipe_time).seconds / 60)
                except AttributeError:
                    recipe_time = 0

    return recipe_time


def parse_keywords(keyword_json, space):
    keywords = []
    # keywords as list
    for kw in keyword_json:
        kw = normalize_string(kw)
        if len(kw) != 0:
            if k := Keyword.objects.filter(name=kw, space=space).first():
                keywords.append({'label': str(k), 'name': k.name, 'id': k.id})
            else:
                keywords.append({'label': kw, 'name': kw})

    return keywords


def listify_keywords(keyword_list):
    # keywords as string
    try:
        if type(keyword_list[0]) == dict:
            return keyword_list
    except (KeyError, IndexError):
        pass
    if type(keyword_list) == str:
        keyword_list = keyword_list.split(',')

    # keywords as string in list
    if (type(keyword_list) == list and len(keyword_list) == 1 and ',' in keyword_list[0]):
        keyword_list = keyword_list[0].split(',')
    return [x.strip() for x in keyword_list]


def normalize_string(string):
    # Convert all named and numeric character references (e.g. &gt;, &#62;)
    unescaped_string = unescape(string)
    unescaped_string = re.sub('<[^<]+?>', '', unescaped_string)
    unescaped_string = re.sub(' +', ' ', unescaped_string)
    unescaped_string = re.sub('</p>', '\n', unescaped_string)
    unescaped_string = re.sub(r'\n\s*\n', '\n\n', unescaped_string)
    unescaped_string = unescaped_string.replace("\xa0", " ").replace("\t", " ").strip()
    return unescaped_string


def iso_duration_to_minutes(string):
    match = re.match(
        r'P((?P<years>\d+)Y)?((?P<months>\d+)M)?((?P<weeks>\d+)W)?((?P<days>\d+)D)?T((?P<hours>\d+)H)?((?P<minutes>\d+)M)?((?P<seconds>\d+)S)?',
        string
    ).groupdict()
    return int(match['days'] or 0) * 24 * 60 + int(match['hours'] or 0) * 60 + int(match['minutes'] or 0)
