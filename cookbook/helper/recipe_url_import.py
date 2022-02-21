import random
import re
from html import unescape
from unicodedata import decomposition

from django.utils.dateparse import parse_duration
from isodate import parse_duration as iso_parse_duration
from isodate.isoerror import ISO8601Error

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
        description = scrape.schema.data.get("description") or ''
    except Exception:
        description = ''

    recipe_json['description'] = parse_description(description)
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
    if type(servings) != int:
        try:
            servings = int(re.findall(r'\b\d+\b', servings)[0])
        except Exception:
            servings = 1
    recipe_json['servings'] = max(servings, 1)

    try:
        recipe_json['working_time'] = get_minutes(scrape.schema.data.get("prepTime")) or 0
    except Exception:
        recipe_json['working_time'] = 0
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
        recipe_json['keywords'] = parse_keywords(list(set(map(str.casefold, keywords))), request.space)
    except AttributeError:
        recipe_json['keywords'] = keywords

    ingredient_parser = IngredientParser(request, True)

    recipe_json['steps'] = []

    for i in parse_instructions(scrape.instructions()):
        recipe_json['steps'].append({'instruction': i, 'ingredients': [], })
    if len(recipe_json['steps']) == 0:
        recipe_json['steps'].append({'instruction': '', 'ingredients': [], })

    try:
        for x in scrape.ingredients():
            try:
                amount, unit, ingredient, note = ingredient_parser.parse(x)
                recipe_json['steps'][0]['ingredients'].append(
                    {
                        'amount': amount,
                        'unit': {
                            'name': unit,
                        },
                        'food': {
                            'name': ingredient,
                        },
                        'note': note,
                        'original_text': x
                    }
                )
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

    if scrape.url:
        recipe_json['source_url'] = scrape.url
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


# TODO deprecate when merged into recipe_scapers


def get_minutes(time_text):
    if time_text is None:
        return 0
    TIME_REGEX = re.compile(
        r"(\D*(?P<hours>\d*.?(\s\d)?\/?\d+)\s*(hours|hrs|hr|h|óra))?(\D*(?P<minutes>\d+)\s*(minutes|mins|min|m|perc))?",
        re.IGNORECASE,
    )
    try:
        return int(time_text)
    except Exception:
        pass

    if time_text.startswith("P") and "T" in time_text:
        time_text = time_text.split("T", 2)[1]
    if "-" in time_text:
        time_text = time_text.split("-", 2)[
            1
        ]  # sometimes formats are like this: '12-15 minutes'
    if " to " in time_text:
        time_text = time_text.split("to", 2)[
            1
        ]  # sometimes formats are like this: '12 to 15 minutes'

    empty = ''
    for x in time_text:
        if 'fraction' in decomposition(x):
            f = decomposition(x[-1:]).split()
            empty += f" {f[1].replace('003', '')}/{f[3].replace('003', '')}"
        else:
            empty += x
    time_text = empty
    matched = TIME_REGEX.search(time_text)

    minutes = int(matched.groupdict().get("minutes") or 0)

    if "/" in (hours := matched.groupdict().get("hours") or ''):
        number = hours.split(" ")
        if len(number) == 2:
            minutes += 60 * int(number[0])
        fraction = number[-1:][0].split("/")
        minutes += 60 * float(int(fraction[0]) / int(fraction[1]))
    else:
        minutes += 60 * float(hours)

    return int(minutes)


def iso_duration_to_minutes(string):
    match = re.match(
        r'P((?P<years>\d+)Y)?((?P<months>\d+)M)?((?P<weeks>\d+)W)?((?P<days>\d+)D)?T((?P<hours>\d+)H)?((?P<minutes>\d+)M)?((?P<seconds>\d+)S)?',
        string
    ).groupdict()
    return int(match['days'] or 0) * 24 * 60 + int(match['hours'] or 0) * 60 + int(match['minutes'] or 0)
