from datetime import datetime, timedelta

from recipes import settings
from django.contrib.postgres.aggregates import StringAgg
from django.contrib.postgres.search import (
    SearchQuery, SearchRank, SearchVector,
)
from django.db.models import Q, Case, When, Value, Count, Sum
from django.utils import translation

from cookbook.models import ViewLog


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


def search_recipes(request, queryset, params):
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

    rank_results = False
    if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql'] and search_string != '':
        rank_results = True
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
            # SearchVector('search_vector') <-- this can be searched like a field
            SearchVector(StringAgg('steps__ingredients__food__name__unaccent', delimiter=' '), weight='B')
            + SearchVector(StringAgg('keywords__name__unaccent', delimiter=' '), weight='B')
        )
        # trigrams don't seem to add anything and severely limit accuracy of results.
        # TODO add trigrams as an on/off feature
        # trigram = (
        #     TrigramSimilarity('name__unaccent', search_string)
        #     + TrigramSimilarity('description__unaccent', search_string)
        #     # adding trigrams to ingredients and keywords causes duplicate results that can't be made unique
        #     + TrigramSimilarity('steps__ingredients__food__name__unaccent', search_string)
        #     + TrigramSimilarity('keywords__name__unaccent', search_string)
        # )
        search_rank = (
            SearchRank('name_search_vector', search_query)
            + SearchRank('desc_search_vector', search_query)
            + SearchRank('steps__search_vector', search_query)
            + SearchRank(search_vectors, search_query)
        )
        queryset = (
            queryset.annotate(
                vector=search_vectors
            )
            .filter(
                # vector=search_query
                Q(name_search_vector=search_query)
                | Q(desc_search_vector=search_query)
                | Q(steps__search_vector=search_query)
                | Q(vector=search_query)
                | Q(name__istartswith=search_string)
            ).annotate(rank=search_rank)
        )
    else:
        queryset = queryset.filter(name__icontains=search_string)

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
    elif rank_results:
        queryset = queryset.order_by('-rank')

    return queryset
