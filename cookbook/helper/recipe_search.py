from collections import Counter
from datetime import timedelta

from recipes import settings
from django.contrib.postgres.search import (
    SearchQuery, SearchRank, TrigramSimilarity
)
from django.db.models import Avg, Case, Count, Func, Max, Q, Subquery, Value, When
from django.utils import timezone, translation

from cookbook.managers import DICTIONARY
from cookbook.models import Food, Keyword, ViewLog


class Round(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 0)'


# TODO create extensive tests to make sure ORs ANDs and various filters, sorting, etc work as expected
# TODO consider creating a simpleListRecipe API that only includes minimum of recipe info and minimal filtering
def search_recipes(request, queryset, params):
    search_prefs = request.user.searchpreference
    search_string = params.get('query', '')
    search_rating = int(params.get('rating', 0))
    search_keywords = params.getlist('keywords', [])
    search_foods = params.getlist('foods', [])
    search_books = params.getlist('books', [])
    search_units = params.get('units', None)

    # TODO I think default behavior should be 'AND' which is how most sites operate with facet/filters based on results
    search_keywords_or = params.get('keywords_or', True)
    search_foods_or = params.get('foods_or', True)
    search_books_or = params.get('books_or', True)

    search_internal = params.get('internal', None)
    search_random = params.get('random', False)
    search_new = params.get('new', False)
    search_last_viewed = int(params.get('last_viewed', 0))
    orderby = []

    # only sort by recent not otherwise filtering/sorting
    if search_last_viewed > 0:
        last_viewed_recipes = ViewLog.objects.filter(
            created_by=request.user, space=request.space,
            created_at__gte=timezone.now() - timedelta(days=14)  # TODO make recent days a setting
        ).order_by('-pk').values_list('recipe__pk', flat=True)
        last_viewed_recipes = list(dict.fromkeys(last_viewed_recipes))[:search_last_viewed]  # removes duplicates from list prior to slicing

        # return queryset.annotate(last_view=Max('viewlog__pk')).annotate(new=Case(When(pk__in=last_viewed_recipes, then=('last_view')), default=Value(0))).filter(new__gt=0).order_by('-new')
        # queryset that only annotates most recent view (higher pk = lastest view)
        queryset = queryset.annotate(last_view=Max('viewlog__pk')).annotate(recent=Case(When(pk__in=last_viewed_recipes, then=('last_view')), default=Value(0)))
        orderby += ['-recent']

    # TODO create setting for default ordering - most cooked, rating,
    # TODO create options for live sorting
    # TODO make days of new recipe a setting
    if search_new == 'true':
        queryset = (
            queryset.annotate(new_recipe=Case(
                When(created_at__gte=(timezone.now() - timedelta(days=7)), then=('pk')), default=Value(0), ))
        )
        # only sort by new recipes if not otherwise filtering/sorting
        orderby += ['-new_recipe']

    search_type = search_prefs.search or 'plain'
    if len(search_string) > 0:
        unaccent_include = search_prefs.unaccent.values_list('field', flat=True)

        icontains_include = [x + '__unaccent' if x in unaccent_include else x for x in search_prefs.icontains.values_list('field', flat=True)]
        istartswith_include = [x + '__unaccent' if x in unaccent_include else x for x in search_prefs.istartswith.values_list('field', flat=True)]
        trigram_include = [x + '__unaccent' if x in unaccent_include else x for x in search_prefs.trigram.values_list('field', flat=True)]
        fulltext_include = search_prefs.fulltext.values_list('field', flat=True)  # fulltext doesn't use field name directly

        # if no filters are configured use name__icontains as default
        if len(icontains_include) + len(istartswith_include) + len(trigram_include) + len(fulltext_include) == 0:
            filters = [Q(**{"name__icontains": search_string})]
        else:
            filters = []

        # dynamically build array of filters that will be applied
        for f in icontains_include:
            filters += [Q(**{"%s__icontains" % f: search_string})]

        for f in istartswith_include:
            filters += [Q(**{"%s__istartswith" % f: search_string})]

        if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']:
            language = DICTIONARY.get(translation.get_language(), 'simple')
            # django full text search https://docs.djangoproject.com/en/3.2/ref/contrib/postgres/search/#searchquery
            # TODO can options install this extension to further enhance search query language https://github.com/caub/pg-tsquery
            # trigram breaks full text search 'websearch' and 'raw' capabilities and will be ignored if those methods are chosen
            if search_type in ['websearch', 'raw']:
                search_trigram = False
            else:
                search_trigram = True
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
                        trigram += TrigramSimilarity(f, search_string)
                    else:
                        trigram = TrigramSimilarity(f, search_string)
                queryset.annotate(simularity=trigram)
                # TODO allow user to play with trigram scores
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

            # TODO add order by user settings - only do search rank and annotation if rank order is configured
            search_rank = (
                    SearchRank('name_search_vector', search_query, cover_density=True)
                    + SearchRank('desc_search_vector', search_query, cover_density=True)
                    + SearchRank('steps__search_vector', search_query, cover_density=True)
            )
            queryset = queryset.filter(query_filter).annotate(rank=search_rank)
            orderby += ['-rank']
        else:
            queryset = queryset.filter(name__icontains=search_string)

    if len(search_keywords) > 0:
        if search_keywords_or == 'true':
            # TODO creating setting to include descendants of keywords a setting
            # for kw in Keyword.objects.filter(pk__in=search_keywords):
            #     search_keywords += list(kw.get_descendants().values_list('pk', flat=True))
            queryset = queryset.filter(keywords__id__in=search_keywords)
        else:
            # when performing an 'and' search returned recipes should include a parent OR any of its descedants
            # AND other keywords selected so filters are appended using keyword__id__in the list of keywords and descendants
            for kw in Keyword.objects.filter(pk__in=search_keywords):
                queryset = queryset.filter(keywords__id__in=list(kw.get_descendants_and_self().values_list('pk', flat=True)))

    if len(search_foods) > 0:
        if search_foods_or == 'true':
            # TODO creating setting to include descendants of food a setting
            queryset = queryset.filter(steps__ingredients__food__id__in=search_foods)
        else:
            # when performing an 'and' search returned recipes should include a parent OR any of its descedants
            # AND other foods selected so filters are appended using steps__ingredients__food__id__in the list of foods and descendants
            for fd in Food.objects.filter(pk__in=search_foods):
                queryset = queryset.filter(steps__ingredients__food__id__in=list(fd.get_descendants_and_self().values_list('pk', flat=True)))

    if len(search_books) > 0:
        if search_books_or == 'true':
            queryset = queryset.filter(recipebookentry__book__id__in=search_books)
        else:
            for k in search_books:
                queryset = queryset.filter(recipebookentry__book__id=k)

    if search_rating:
        queryset = queryset.annotate(rating=Round(Avg(Case(When(cooklog__created_by=request.user, then='cooklog__rating'), default=Value(0)))))
        if search_rating == -1:
            queryset = queryset.filter(rating=0)
        else:
            queryset = queryset.filter(rating__gte=search_rating)

    # probably only useful in Unit list view, so keeping it simple
    if search_units:
        queryset = queryset.filter(steps__ingredients__unit__id=search_units)

    if search_internal == 'true':
        queryset = queryset.filter(internal=True)

    queryset = queryset.distinct()

    if search_random == 'true':
        queryset = queryset.order_by("?")
    else:
        # TODO add order by user settings
        # orderby += ['name']
        queryset = queryset.order_by(*orderby)
    return queryset


def get_facet(qs, request):
    # NOTE facet counts for tree models include self AND descendants
    facets = {}
    keyword_list = request.query_params.getlist('keywords', [])
    food_list = request.query_params.getlist('foods', [])
    book_list = request.query_params.getlist('book', [])
    search_keywords_or = request.query_params.get('keywords_or', True)
    search_foods_or = request.query_params.get('foods_or', True)
    search_books_or = request.query_params.get('books_or', True)

    # if using an OR search, will annotate all keywords, otherwise, just those that appear in results
    if search_keywords_or:
        keywords = Keyword.objects.filter(space=request.space).annotate(recipe_count=Count('recipe'))
    else:
        keywords = Keyword.objects.filter(recipe__in=qs, space=request.space).annotate(recipe_count=Count('recipe'))
    # custom django-tree function annotates a queryset to make building a tree easier.
    # see https://django-treebeard.readthedocs.io/en/latest/api.html#treebeard.models.Node.get_annotated_list_qs for details
    kw_a = annotated_qs(keywords, root=True, fill=True)

    # if using an OR search, will annotate all keywords, otherwise, just those that appear in results
    if search_foods_or:
        foods = Food.objects.filter(space=request.space).annotate(recipe_count=Count('ingredient'))
    else:
        foods = Food.objects.filter(ingredient__step__recipe__in=list(qs.values_list('id', flat=True)), space=request.space).annotate(recipe_count=Count('ingredient'))
    food_a = annotated_qs(foods, root=True, fill=True)

    rating_qs = qs.annotate(rating=Round(Avg(Case(When(cooklog__created_by=request.user, then='cooklog__rating'), default=Value(0)))))

    # TODO add rating facet
    facets['Ratings'] = dict(Counter(r.rating for r in rating_qs))
    facets['Keywords'] = fill_annotated_parents(kw_a, keyword_list)
    facets['Foods'] = fill_annotated_parents(food_a, food_list)
    # TODO add book facet
    facets['Books'] = []
    facets['Recent'] = ViewLog.objects.filter(
        created_by=request.user, space=request.space,
        created_at__gte=timezone.now() - timedelta(days=14)  # TODO make days of recent recipe a setting
    ).values_list('recipe__pk', flat=True)
    return facets


def fill_annotated_parents(annotation, filters):
    tree_list = []
    parent = []
    i = 0
    level = -1
    for r in annotation:
        expand = False

        annotation[i][1]['id'] = r[0].id
        annotation[i][1]['name'] = r[0].name
        annotation[i][1]['count'] = getattr(r[0], 'recipe_count', 0)
        annotation[i][1]['isDefaultExpanded'] = False

        if str(r[0].id) in filters:
            expand = True
        if r[1]['level'] < level:
            parent = parent[:r[1]['level'] - level]
            parent[-1] = i
            level = r[1]['level']
        elif r[1]['level'] > level:
            parent.extend([i])
            level = r[1]['level']
        else:
            parent[-1] = i
        j = 0

        while j < level:
            # this causes some double counting when a recipe has both a child and an ancestor
            annotation[parent[j]][1]['count'] += getattr(r[0], 'recipe_count', 0)
            if expand:
                annotation[parent[j]][1]['isDefaultExpanded'] = True
            j += 1
        if level == 0:
            tree_list.append(annotation[i][1])
        elif level > 0:
            annotation[parent[level - 1]][1].setdefault('children', []).append(annotation[i][1])
        i += 1
    return tree_list


def annotated_qs(qs, root=False, fill=False):
    """
    Gets an annotated list from a queryset.
    :param root:

        Will backfill in annotation to include all parents to root node.

    :param fill:
        Will fill in gaps in annotation where nodes between children
        and ancestors are not included in the queryset.
    """

    result, info = [], {}
    start_depth, prev_depth = (None, None)
    nodes_list = list(qs.values_list('pk', flat=True))
    for node in qs.order_by('path'):
        node_queue = [node]
        while len(node_queue) > 0:
            dirty = False
            current_node = node_queue[-1]
            depth = current_node.get_depth()
            # TODO if node is at the wrong depth for some reason this fails
            # either create a 'fix node' page, or automatically move the node to the root
            parent_id = current_node.parent
            if root and depth > 1 and parent_id not in nodes_list:
                parent_id = current_node.parent
                nodes_list.append(parent_id)
                node_queue.append(current_node.__class__.objects.get(pk=parent_id))
                dirty = True

            if fill and depth > 1 and prev_depth and depth > prev_depth and parent_id not in nodes_list:
                nodes_list.append(parent_id)
                node_queue.append(current_node.__class__.objects.get(pk=parent_id))
                dirty = True

            if not dirty:
                working_node = node_queue.pop()
                if start_depth is None:
                    start_depth = depth
                open = (depth and (prev_depth is None or depth > prev_depth))
                if prev_depth is not None and depth < prev_depth:
                    info['close'] = list(range(0, prev_depth - depth))
                info = {'open': open, 'close': [], 'level': depth - start_depth}
                result.append((working_node, info,))
                prev_depth = depth
    if start_depth and start_depth > 0:
        info['close'] = list(range(0, prev_depth - start_depth + 1))
    return result
