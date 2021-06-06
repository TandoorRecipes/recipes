from datetime import datetime, timedelta
from functools import reduce

from recipes import settings
from django.contrib.postgres.aggregates import StringAgg
from django.contrib.postgres.search import (
    SearchQuery, SearchRank, SearchVector, TrigramSimilarity,
)
from django.db.models import Q
from django.utils import translation


DICTIONARY = {
    # TODO find custom dictionaries - maybe from here https://www.postgresql.org/message-id/CAF4Au4x6X_wSXFwsQYE8q5o0aQZANrvYjZJ8uOnsiHDnOVPPEg%40mail.gmail.com
    # 'hy': 'Armenian',
    # 'ca': 'Catalan',
    # 'cs': 'Czech',
    'nl': 'dutch',
    'en': 'english',
    'fr': 'french',
    'de': 'german',
    'it': 'italian',
    # 'lv': 'Latvian',
    'es': 'spanish',
}


def search_recipes(queryset, params):
    search_string = params.get('query', '').strip()
    search_keywords = params.getlist('keywords', [])
    search_foods = params.getlist('foods', [])
    search_books = params.getlist('books', [])

    search_keywords_or = params.get('keywords_or', True)
    search_foods_or = params.get('foods_or', True)
    search_books_or = params.get('books_or', True)

    search_internal = params.get('internal', None)
    search_random = params.get('random', False)
    search_last_viewed = int(params.get('last_viewed', 0))

    if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql'] and search_string != '':
        # queryset = queryset.annotate(similarity=TrigramSimilarity('name', search_string), )
        # .filter(Q(similarity__gt=0.1) | Q(name__unaccent__icontains=search_string)).order_by('-similarity')
        language = DICTIONARY.get(translation.get_language(), 'simple')
        search_query = SearchQuery(
            search_string,
            search_type="websearch",
            config=language,
        )
        # TODO create user options to add/remove query elements from search so that they can fine tune their own experience
        # trigrams, icontains, unaccent and startswith all impact results and performance significantly
        search_vectors = (
            SearchVector('search_vector')
            # searching instruction is extremely slow
            # TODO add search vector field, GIN index and save signal to update the vector on step save
            # + SearchVector('steps__instruction', weight='D', config=language)
            + SearchVector(StringAgg('steps__ingredients__food__name__unaccent', delimiter=' '), weight='B', config=language)
            + SearchVector(StringAgg('keywords__name__unaccent', delimiter=' '), weight='B', config=language))
        trigram = (
            TrigramSimilarity('name__unaccent', search_string)
            + TrigramSimilarity('description__unaccent', search_string)
            # adding trigrams to ingredients and keywords causes duplicate results that can't be made unique
            # + TrigramSimilarity('steps__ingredients__food__name__unaccent', search_string)
            # + TrigramSimilarity('keywords__name__unaccent', search_string)
        )
        search_rank = SearchRank(search_vectors, search_query)
        queryset = (
            queryset.annotate(
                vector=search_vectors,
                rank=search_rank + trigram,
                trigram=trigram
            )
            .filter(
                # vector=search_query
                Q(vector=search_query)
                # adding trigrams to ingredients causes duplicate results that can't be made unique
                # | Q(trigram__gt=0.2)
                | Q(name__istartswith=search_string)
            )
            .order_by('-rank'))
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

    queryset = queryset.distinct()

    if search_internal == 'true':
        queryset = queryset.filter(internal=True)

    if search_random == 'true':
        queryset = queryset.order_by("?")

    return queryset
