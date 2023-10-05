from django.contrib.postgres.aggregates import StringAgg
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.db import models
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
    'sv': 'swedish',
}


# TODO add schedule index rebuild
class RecipeSearchManager(models.Manager):
    def search(self, search_text, space):
        language = DICTIONARY.get(translation.get_language(), 'simple')
        search_query = SearchQuery(
            search_text,
            config=language,
            search_type="websearch"
        )
        search_vectors = (
            SearchVector('search_vector')
            + SearchVector(StringAgg('steps__ingredients__food__name__unaccent', delimiter=' '), weight='B', config=language)
            + SearchVector(StringAgg('keywords__name__unaccent', delimiter=' '), weight='B', config=language))
        search_rank = SearchRank(search_vectors, search_query)

        return (
            self.get_queryset()
            .annotate(
                search=search_vectors,
                rank=search_rank,
            )
            .filter(
                Q(search=search_query)
            )
            .order_by('-rank'))
