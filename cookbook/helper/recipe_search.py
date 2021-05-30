from datetime import datetime, timedelta

from recipes import settings
from django.contrib.postgres.search import (
    SearchQuery, SearchRank, TrigramSimilarity
)
from django.db.models import Q, Subquery, Case, When, Value
from django.utils import translation

from cookbook.managers import DICTIONARY
from cookbook.models import Food, Keyword, ViewLog


def search_recipes(request, queryset, params):
    fields = {
        'name': 'name',
        'description': 'description',
        'instructions': 'steps__instruction',
        'foods': 'steps__ingredients__food__name',
        'keywords': 'keywords__name'
    }

    search_string = params.get('query', '')
    search_keywords = params.getlist('keywords', [])
    search_foods = params.getlist('foods', [])
    search_books = params.getlist('books', [])

    search_keywords_or = params.get('keywords_or', True)
    search_foods_or = params.get('foods_or', True)
    search_books_or = params.get('books_or', True)

    search_internal = params.get('internal', None)
    search_random = params.get('random', False)
    search_last_viewed = int(params.get('last_viewed', 0))

    if search_last_viewed > 0:
        last_viewed_recipes = ViewLog.objects.filter(
            created_by=request.user, space=request.space,
            created_at__gte=datetime.now() - timedelta(days=14)).values_list(
            'recipe__pk', flat=True).distinct()
        return queryset.filter(pk__in=list(set(last_viewed_recipes))[-search_last_viewed:])

    queryset = queryset.annotate(
        new_recipe=Case(When(
            created_at__gte=(datetime.now() - timedelta(days=7)), then=Value(100)),
            default=Value(0), )).order_by('-new_recipe', 'name')

    search_type = None
    search_sort = None
    if len(search_string) > 0:
        # TODO move all of these to settings somewhere - probably user settings

        unaccent_include = ['name', 'description', 'instructions', 'keywords', 'foods']  # can also contain: description, instructions, keywords, foods
        # TODO when setting up settings length of arrays below must be >=1

        icontains_include = []  # can contain: name, description, instructions, keywords, foods
        istartswith_include = ['name']  # can also contain: description, instructions, keywords, foods
        trigram_include = ['name', 'description', 'instructions']  # only these choices - keywords and foods are really, really, really slow maybe add to subquery?
        fulltext_include = ['name', 'description', 'instructions', 'foods', 'keywords']

        # END OF SETTINGS SECTION
        for f in unaccent_include:
            fields[f] += '__unaccent'

        filters = []
        for f in icontains_include:
            filters += [Q(**{"%s__icontains" % fields[f]: search_string})]

        for f in istartswith_include:
            filters += [Q(**{"%s__istartswith" % fields[f]: search_string})]

        if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']:
            language = DICTIONARY.get(translation.get_language(), 'simple')
            # django full text search https://docs.djangoproject.com/en/3.2/ref/contrib/postgres/search/#searchquery
            search_type = 'websearch'  # other postgress options are phrase or plain or raw (websearch and trigrams are mutually exclusive)
            search_trigram = False
            search_query = SearchQuery(
                search_string,
                search_type=search_type,
                config=language,
            )

            # iterate through fields to use in trigrams generating a single trigram
            if search_trigram & len(trigram_include) > 1:
                trigram = None
                for f in trigram_include:
                    if trigram:
                        trigram += TrigramSimilarity(fields[f], search_string)
                    else:
                        trigram = TrigramSimilarity(fields[f], search_string)
                queryset.annotate(simularity=trigram)
                filters += [Q(simularity__gt=0.5)]

            if 'name' in fulltext_include:
                filters += [Q(name_search_vector=search_query)]
            if 'description' in fulltext_include:
                filters += [Q(desc_search_vector=search_query)]
            if 'instructions' in fulltext_include:
                filters += [Q(steps__search_vector=search_query)]
            if 'keywords' in fulltext_include:
                filters += [Q(keywords__in=Subquery(Keyword.objects.filter(name__search=search_query).values_list('id', flat=True)))]
            if 'foods' in fulltext_include:
                filters += [Q(steps__ingredients__food__in=Subquery(Food.objects.filter(name__search=search_query).values_list('id', flat=True)))]
            query_filter = None
            for f in filters:
                if query_filter:
                    query_filter |= f
                else:
                    query_filter = f

            # TODO this is kind of a dumb method to sort.  create settings to choose rank vs most often made, date created or rating
            search_rank = (
                SearchRank('name_search_vector', search_query, cover_density=True)
                + SearchRank('desc_search_vector', search_query, cover_density=True)
                + SearchRank('steps__search_vector', search_query, cover_density=True)
            )
            queryset = queryset.filter(query_filter).annotate(rank=search_rank)
        else:
            queryset = queryset.filter(query_filter)

    if len(search_keywords) > 0:
        if search_keywords_or == 'true':
            queryset = queryset.filter(keywords__id__in=search_keywords)
        else:
            for k in search_keywords:
                queryset = queryset.filter(keywords__id=k)

    if len(search_foods) > 0:
        if search_foods_or == 'true':
            queryset = queryset.filter(steps__ingredients__food__id__in=search_foods)
        else:
            for k in search_foods:
                queryset = queryset.filter(steps__ingredients__food__id=k)

    if len(search_books) > 0:
        if search_books_or == 'true':
            queryset = queryset.filter(recipebookentry__book__id__in=search_books)
        else:
            for k in search_books:
                queryset = queryset.filter(recipebookentry__book__id=k)

    if search_internal == 'true':
        queryset = queryset.filter(internal=True)

    queryset = queryset.distinct()

    if search_random == 'true':
        queryset = queryset.order_by("?")
    elif search_sort == 'rank':
        queryset = queryset.order_by('-rank')

    return queryset
