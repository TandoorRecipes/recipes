import random
import re
from isodate import parse_duration as iso_parse_duration
from isodate.isoerror import ISO8601Error
from recipe_scrapers._exceptions import ElementNotFoundInHtml

from cookbook.helper.ingredient_parser import parse as parse_single_ingredient
from cookbook.models import Keyword
from django.utils.dateparse import parse_duration
from html import unescape
from recipe_scrapers._schemaorg import SchemaOrgException
from recipe_scrapers._utils import get_minutes


def get_from_scraper(scrape, space):
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
        description = scrape.schema.data.get("description") or ''
    except Exception:
        description = ''

    recipe_json['description'] = parse_description(description)

    try:
        servings = scrape.yields() or None
    except Exception:
        servings = None
    if not servings:
        try:
            servings = scrape.schema.data.get('recipeYield') or 1
        except Exception:
            servings = 1
    if type(servings) != int:
        try:
            servings = int(re.findall(r'\b\d+\b', servings)[0])
        except Exception:
            servings = 1
    recipe_json['servings'] = max(servings, 1)

    try:
        recipe_json['prepTime'] = get_minutes(scrape.schema.data.get("prepTime")) or 0
    except Exception:
        recipe_json['prepTime'] = 0
    try:
        recipe_json['cookTime'] = get_minutes(scrape.schema.data.get("cookTime")) or 0
    except Exception:
        recipe_json['cookTime'] = 0
    if recipe_json['cookTime'] + recipe_json['prepTime'] == 0:
        try:
            recipe_json['prepTime'] = get_minutes(scrape.total_time()) or 0
        except Exception:
            try:
                get_minutes(scrape.schema.data.get("totalTime")) or 0
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
        if scrape.schema.data.get('recipeCategory'):
            keywords += listify_keywords(scrape.schema.data.get("recipeCategory"))
    except Exception:
        pass
    try:
        if scrape.schema.data.get('recipeCuisine'):
            keywords += listify_keywords(scrape.schema.data.get("recipeCuisine"))
    except Exception:
        pass
    try:
        recipe_json['keywords'] = parse_keywords(list(set(map(str.casefold, keywords))), space)
    except AttributeError:
        recipe_json['keywords'] = keywords

    try:
        ingredients = []
        for x in scrape.ingredients():
            try:
                amount, unit, ingredient, note = parse_single_ingredient(x)
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
        recipe_json['recipeIngredient'] = ingredients
    except Exception:
        recipe_json['recipeIngredient'] = ingredients

    try:
        recipe_json['recipeInstructions'] = parse_instructions(scrape.instructions())
    except Exception:
        recipe_json['recipeInstructions'] = ""

    if scrape.url:
        recipe_json['url'] = scrape.url
        recipe_json['recipeInstructions'] += "\n\nImported from " + scrape.url
    return recipe_json


def parse_name(name):
    if type(name) == list:
        try:
            name = name[0]
        except Exception:
            name = 'ERROR'
    return normalize_string(name)


def parse_ingredients(ingredients):
    # some pages have comma separated ingredients in a single array entry
    try:
        if type(ingredients[0]) == dict:
            return ingredients
    except (KeyError, IndexError):
        pass

    if (len(ingredients) == 1 and type(ingredients) == list):
        ingredients = ingredients[0].split(',')
    elif type(ingredients) == str:
        ingredients = ingredients.split(',')

    for x in ingredients:
        if '\n' in x:
            ingredients.remove(x)
            for i in x.split('\n'):
                ingredients.insert(0, i)

    ingredient_list = []

    for x in ingredients:
        if x.replace(' ', '') != '':
            x = x.replace('&frac12;', "0.5").replace('&frac14;', "0.25").replace('&frac34;', "0.75")
            try:
                amount, unit, ingredient, note = parse_single_ingredient(x)
                if ingredient:
                    ingredient_list.append(
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
                ingredient_list.append(
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

            ingredients = ingredient_list
        else:
            ingredients = []
    return ingredients


def parse_description(description):
    return normalize_string(description)


def parse_instructions(instructions):
    instruction_text = ''

    # flatten instructions if they are in a list
    if type(instructions) == list:
        for i in instructions:
            if type(i) == str:
                instruction_text += i
            else:
                if 'text' in i:
                    instruction_text += i['text'] + '\n\n'
                elif 'itemListElement' in i:
                    for ile in i['itemListElement']:
                        if type(ile) == str:
                            instruction_text += ile + '\n\n'
                        elif 'text' in ile:
                            instruction_text += ile['text'] + '\n\n'
                else:
                    instruction_text += str(i)
        instructions = instruction_text

    return normalize_string(instructions)


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


def parse_cooktime(cooktime):
    if type(cooktime) not in [int, float]:
        try:
            cooktime = float(re.search(r'\d+', cooktime).group())
        except (ValueError, AttributeError):
            try:
                cooktime = round(iso_parse_duration(cooktime).seconds / 60)
            except ISO8601Error:
                try:
                    if (type(cooktime) == list and len(cooktime) > 0):
                        cooktime = cooktime[0]
                    cooktime = round(parse_duration(cooktime).seconds / 60)
                except AttributeError:
                    cooktime = 0

    return cooktime


def parse_preptime(preptime):
    if type(preptime) not in [int, float]:
        try:
            preptime = float(re.search(r'\d+', preptime).group())
        except ValueError:
            try:
                preptime = round(iso_parse_duration(preptime).seconds / 60)
            except ISO8601Error:
                try:
                    if (type(preptime) == list and len(preptime) > 0):
                        preptime = preptime[0]
                    preptime = round(parse_duration(preptime).seconds / 60)
                except AttributeError:
                    preptime = 0

    return preptime


def parse_keywords(keyword_json, space):
    keywords = []
    # keywords as list
    for kw in keyword_json:
        kw = normalize_string(kw)
        if len(kw) != 0:
            if k := Keyword.objects.filter(name=kw, space=space).first():
                keywords.append({'id': str(k.id), 'text': str(k)})
            else:
                keywords.append({'id': random.randrange(1111111, 9999999, 1), 'text': kw})

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
