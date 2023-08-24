# import random
import re
import traceback
from html import unescape

from django.core.cache import caches
from django.utils.dateparse import parse_duration
from django.utils.translation import gettext as _
from isodate import parse_duration as iso_parse_duration
from isodate.isoerror import ISO8601Error
from pytube import YouTube
from recipe_scrapers._utils import get_host_name, get_minutes

# from cookbook.helper import recipe_url_import as helper
from cookbook.helper.ingredient_parser import IngredientParser
from cookbook.models import Automation, Keyword, PropertyType


# from unicodedata import decomposition


# from recipe_scrapers._utils import get_minutes  ## temporary until/unless upstream incorporates get_minutes() PR


def get_from_scraper(scrape, request):
    # converting the scrape_me object to the existing json format based on ld+json
    recipe_json = {}
    try:
        recipe_json['name'] = parse_name(scrape.title()[:128] or None)
    except Exception:
        recipe_json['name'] = None
    if not recipe_json['name']:
        try:
            recipe_json['name'] = scrape.schema.data.get('name') or ''
        except Exception:
            recipe_json['name'] = ''

    if isinstance(recipe_json['name'], list) and len(recipe_json['name']) > 0:
        recipe_json['name'] = recipe_json['name'][0]

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
        servings = scrape.schema.data.get('recipeYield') or 1  # dont use scrape.yields() as this will always return "x servings" or "x items", should be improved in scrapers directly
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
            recipe_json['source_url'] = ''

    try:
        if scrape.author():
            keywords.append(scrape.author())
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
            recipe_json['steps'].append({'instruction': i, 'ingredients': [], 'show_ingredients_table': request.user.userpreference.show_step_ingredients,})
    except Exception:
        pass
    if len(recipe_json['steps']) == 0:
        recipe_json['steps'].append({'instruction': '', 'ingredients': [], })

    parsed_description = parse_description(description)
    # TODO notify user about limit if reached
    # limits exist to limit the attack surface for dos style attacks
    automations = Automation.objects.filter(type=Automation.DESCRIPTION_REPLACE, space=request.space, disabled=False).only('param_1', 'param_2', 'param_3').all().order_by('order')[:512]
    for a in automations:
        if re.match(a.param_1, (recipe_json['source_url'])[:512]):
            parsed_description = re.sub(a.param_2, a.param_3, parsed_description, count=1)

    if len(parsed_description) > 256:  # split at 256 as long descriptions don't look good on recipe cards
        recipe_json['steps'][0]['instruction'] = f'*{parsed_description}*  \n\n' + recipe_json['steps'][0]['instruction']
    else:
        recipe_json['description'] = parsed_description[:512]

    try:
        for x in scrape.ingredients():
            if x.strip() != '':
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

    try:
        recipe_json['properties'] = get_recipe_properties(request.space, scrape.schema.nutrients())
        print(recipe_json['properties'])
    except Exception:
        traceback.print_exc()
        pass

    if 'source_url' in recipe_json and recipe_json['source_url']:
        automations = Automation.objects.filter(type=Automation.INSTRUCTION_REPLACE, space=request.space, disabled=False).only('param_1', 'param_2', 'param_3').order_by('order').all()[:512]
        for a in automations:
            if re.match(a.param_1, (recipe_json['source_url'])[:512]):
                for s in recipe_json['steps']:
                    s['instruction'] = re.sub(a.param_2, a.param_3, s['instruction'])

    return recipe_json


def get_recipe_properties(space, property_data):
    # {'servingSize': '1', 'calories': '302 kcal', 'proteinContent': '7,66g', 'fatContent': '11,56g', 'carbohydrateContent': '41,33g'}
    properties = {
        "property-calories": "calories",
        "property-carbohydrates": "carbohydrateContent",
        "property-proteins": "proteinContent",
        "property-fats": "fatContent",
    }
    recipe_properties = []
    for pt in PropertyType.objects.filter(space=space, open_data_slug__in=list(properties.keys())).all():
        for p in list(properties.keys()):
            if pt.open_data_slug == p:
                if properties[p] in property_data:
                    recipe_properties.append({
                        'property_type': {
                            'id': pt.id,
                            'name': pt.name,
                        },
                        'property_amount': parse_servings(property_data[properties[p]]) / float(property_data['servingSize']),
                    })

    return recipe_properties


def get_from_youtube_scraper(url, request):
    """A YouTube Information Scraper."""
    kw, created = Keyword.objects.get_or_create(name='YouTube', space=request.space)
    default_recipe_json = {
        'name': '',
        'internal': True,
        'description': '',
        'servings': 1,
        'working_time': 0,
        'waiting_time': 0,
        'image': "",
        'keywords': [{'name': kw.name, 'label': kw.name, 'id': kw.pk}],
        'source_url': url,
        'steps': [
            {
                'ingredients': [],
                'instruction': ''
            }
        ]
    }

    try:
        video = YouTube(url=url)
        default_recipe_json['name'] = video.title
        default_recipe_json['image'] = video.thumbnail_url
        default_recipe_json['steps'][0]['instruction'] = video.description
    except Exception:
        pass

    return default_recipe_json


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
    # handle HTML tags that can be converted to markup
    normalized_string = instruction \
        .replace("<nobr>", "**") \
        .replace("</nobr>", "**") \
        .replace("<strong>", "**") \
        .replace("</strong>", "**")
    normalized_string = normalize_string(normalized_string)
    normalized_string = normalized_string.replace('\n', '  \n')
    normalized_string = normalized_string.replace('  \n  \n', '\n\n')

    # handle unsupported, special UTF8 character in Thermomix-specific instructions,
    # that happen in nearly every recipe on Cookidoo, Zaubertopf Club, Rezeptwelt
    # and in Thermomix-specific recipes on many other sites
    return normalized_string \
        .replace("", _('reverse rotation')) \
        .replace("", _('careful rotation')) \
        .replace("", _('knead')) \
        .replace("Andicken ", _('thicken')) \
        .replace("Erwärmen ", _('warm up')) \
        .replace("Fermentieren ", _('ferment')) \
        .replace("Sous-vide ", _("sous-vide"))


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
    if type(servings) == list:
        try:
            servings = parse_servings_text(servings[1])
        except Exception:
            pass
    return str(servings)[:32]


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
    keyword_aliases = {}
    # retrieve keyword automation cache if it exists, otherwise build from database
    KEYWORD_CACHE_KEY = f'automation_keyword_alias_{space.pk}'
    if c := caches['default'].get(KEYWORD_CACHE_KEY, None):
        keyword_aliases = c
        caches['default'].touch(KEYWORD_CACHE_KEY, 30)
    else:
        for a in Automation.objects.filter(space=space, disabled=False, type=Automation.KEYWORD_ALIAS).only('param_1', 'param_2').order_by('order').all():
            keyword_aliases[a.param_1] = a.param_2
        caches['default'].set(KEYWORD_CACHE_KEY, keyword_aliases, 30)

    # keywords as list
    for kw in keyword_json:
        kw = normalize_string(kw)
        # if alias exists use that instead

        if len(kw) != 0:
            if keyword_aliases:
                try:
                    kw = keyword_aliases[kw]
                except KeyError:
                    pass
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


def get_images_from_soup(soup, url):
    sources = ['src', 'srcset', 'data-src']
    images = []
    img_tags = soup.find_all('img')
    if url:
        site = get_host_name(url)
        prot = url.split(':')[0]

    urls = []
    for img in img_tags:
        for src in sources:
            try:
                urls.append(img[src])
            except KeyError:
                pass

    for u in urls:
        u = u.split('?')[0]
        filename = re.search(r'/([\w_-]+[.](jpg|jpeg|gif|png))$', u)
        if filename:
            if (('http' not in u) and (url)):
                # sometimes an image source can be relative
                # if it is provide the base url
                u = '{}://{}{}'.format(prot, site, u)
            if 'http' in u:
                images.append(u)
    return images


def clean_dict(input_dict, key):
    if type(input_dict) == dict:
        for x in list(input_dict):
            if x == key:
                del input_dict[x]
            elif type(input_dict[x]) == dict:
                input_dict[x] = clean_dict(input_dict[x], key)
            elif type(input_dict[x]) == list:
                temp_list = []
                for e in input_dict[x]:
                    temp_list.append(clean_dict(e, key))

    return input_dict
