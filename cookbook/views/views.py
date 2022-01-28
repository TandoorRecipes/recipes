import os
import re
from datetime import datetime
from uuid import UUID

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Avg, Q, Sum
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext as _
from django_scopes import scopes_disabled
from django_tables2 import RequestConfig
from rest_framework.authtoken.models import Token

from cookbook.filters import RecipeFilter
from cookbook.forms import (CommentForm, Recipe, SearchPreferenceForm, ShoppingPreferenceForm,
                            SpaceCreateForm, SpaceJoinForm, SpacePreferenceForm, User,
                            UserCreateForm, UserNameForm, UserPreference, UserPreferenceForm)
from cookbook.helper.permission_helper import group_required, has_group_permission, share_link_valid
from cookbook.models import (Comment, CookLog, Food, FoodInheritField, InviteLink, Keyword,
                             MealPlan, RecipeImport, SearchFields, SearchPreference, ShareLink,
                             ShoppingList, Space, Unit, UserFile, ViewLog)
from cookbook.tables import (CookLogTable, InviteLinkTable, RecipeTable, RecipeTableSmall,
                             ViewLogTable)
from cookbook.views.data import Object
from recipes.version import BUILD_REF, VERSION_NUMBER


def index(request):
    with scopes_disabled():
        if not request.user.is_authenticated:
            if User.objects.count() < 1 and 'django.contrib.auth.backends.RemoteUserBackend' not in settings.AUTHENTICATION_BACKENDS:
                return HttpResponseRedirect(reverse_lazy('view_setup'))
            return HttpResponseRedirect(reverse_lazy('view_search'))

    try:
        page_map = {
            UserPreference.SEARCH: reverse_lazy('view_search'),
            UserPreference.PLAN: reverse_lazy('view_plan'),
            UserPreference.BOOKS: reverse_lazy('view_books'),
        }

        return HttpResponseRedirect(page_map.get(request.user.userpreference.default_page))
    except UserPreference.DoesNotExist:
        return HttpResponseRedirect(reverse('view_search'))


# TODO need to deprecate
def search(request):
    if has_group_permission(request.user, ('guest',)):
        if request.user.userpreference.search_style == UserPreference.NEW:
            return search_v2(request)
        f = RecipeFilter(request.GET,
                         queryset=Recipe.objects.filter(space=request.user.userpreference.space).all().order_by('name'),
                         space=request.space)
        if request.user.userpreference.search_style == UserPreference.LARGE:
            table = RecipeTable(f.qs)
        else:
            table = RecipeTableSmall(f.qs)
        RequestConfig(request, paginate={'per_page': 25}).configure(table)

        if request.GET == {} and request.user.userpreference.show_recent:
            qs = Recipe.objects.filter(viewlog__created_by=request.user).filter(
                space=request.user.userpreference.space).order_by('-viewlog__created_at').all()

            recent_list = []
            for r in qs:
                if r not in recent_list:
                    recent_list.append(r)
                if len(recent_list) >= 5:
                    break

            last_viewed = RecipeTable(recent_list)
        else:
            last_viewed = None

        return render(request, 'index.html', {'recipes': table, 'filter': f, 'last_viewed': last_viewed})
    else:
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse('view_no_group'))
        else:
            return HttpResponseRedirect(reverse('account_login') + '?next=' + request.path)


@group_required('guest')
def search_v2(request):
    return render(request, 'search.html', {})


def no_groups(request):
    return render(request, 'no_groups_info.html')


@login_required
def no_space(request):
    if request.user.userpreference.space:
        return HttpResponseRedirect(reverse('index'))

    if request.POST:
        create_form = SpaceCreateForm(request.POST, prefix='create')
        join_form = SpaceJoinForm(request.POST, prefix='join')
        if create_form.is_valid():
            created_space = Space.objects.create(
                name=create_form.cleaned_data['name'],
                created_by=request.user,
                max_file_storage_mb=settings.SPACE_DEFAULT_MAX_FILES,
                max_recipes=settings.SPACE_DEFAULT_MAX_RECIPES,
                max_users=settings.SPACE_DEFAULT_MAX_USERS,
                allow_sharing=settings.SPACE_DEFAULT_ALLOW_SHARING,
            )

            request.user.userpreference.space = created_space
            request.user.userpreference.save()
            request.user.groups.add(Group.objects.filter(name='admin').get())

            messages.add_message(request, messages.SUCCESS,
                                 _('You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you.'))
            return HttpResponseRedirect(reverse('index'))

        if join_form.is_valid():
            return HttpResponseRedirect(reverse('view_invite', args=[join_form.cleaned_data['token']]))
    else:
        if settings.SOCIAL_DEFAULT_ACCESS:
            request.user.userpreference.space = Space.objects.first()
            request.user.userpreference.save()
            request.user.groups.add(Group.objects.get(name=settings.SOCIAL_DEFAULT_GROUP))
            return HttpResponseRedirect(reverse('index'))
        if 'signup_token' in request.session:
            return HttpResponseRedirect(reverse('view_invite', args=[request.session.pop('signup_token', '')]))

        create_form = SpaceCreateForm(initial={'name': f'{request.user.username}\'s Space'})
        join_form = SpaceJoinForm()

    return render(request, 'no_space_info.html', {'create_form': create_form, 'join_form': join_form})


def no_perm(request):
    if not request.user.is_authenticated:
        messages.add_message(request, messages.ERROR, _('You are not logged in and therefore cannot view this page!'))
        return HttpResponseRedirect(reverse('account_login') + '?next=' + request.GET.get('next', '/search/'))
    return render(request, 'no_perm_info.html')


def recipe_view(request, pk, share=None):
    with scopes_disabled():
        recipe = get_object_or_404(Recipe, pk=pk)

        if not request.user.is_authenticated and not share_link_valid(recipe, share):
            messages.add_message(request, messages.ERROR,
                                 _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('account_login') + '?next=' + request.path)

        if not (has_group_permission(request.user,
                                     ('guest',)) and recipe.space == request.space) and not share_link_valid(recipe,
                                                                                                             share):
            messages.add_message(request, messages.ERROR,
                                 _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('index'))

        comments = Comment.objects.filter(recipe__space=request.space, recipe=recipe)

        if request.method == "POST":
            if not request.user.is_authenticated:
                messages.add_message(request, messages.ERROR,
                                     _('You do not have the required permissions to perform this action!'))
                return HttpResponseRedirect(reverse('view_recipe', kwargs={'pk': recipe.pk, 'share': share}))

            comment_form = CommentForm(request.POST, prefix='comment')
            if comment_form.is_valid():
                comment = Comment()
                comment.recipe = recipe
                comment.text = comment_form.cleaned_data['text']
                comment.created_by = request.user
                comment.save()

                messages.add_message(request, messages.SUCCESS, _('Comment saved!'))

        comment_form = CommentForm()

        user_servings = None
        if request.user.is_authenticated:
            user_servings = CookLog.objects.filter(
                recipe=recipe,
                created_by=request.user,
                servings__gt=0,
                space=request.space,
            ).all().aggregate(Avg('servings'))['servings__avg']

        if not user_servings:
            user_servings = 0

        if request.user.is_authenticated:
            if not ViewLog.objects.filter(recipe=recipe, created_by=request.user,
                                          created_at__gt=(timezone.now() - timezone.timedelta(minutes=5)),
                                          space=request.space).exists():
                ViewLog.objects.create(recipe=recipe, created_by=request.user, space=request.space)

        return render(request, 'recipe_view.html',
                      {'recipe': recipe, 'comments': comments, 'comment_form': comment_form, 'share': share,
                       'user_servings': user_servings})


@group_required('user')
def books(request):
    return render(request, 'books.html', {})


@group_required('user')
def meal_plan(request):
    return render(request, 'meal_plan.html', {})


@group_required('user')
def supermarket(request):
    return render(request, 'supermarket.html', {})


@group_required('user')
def meal_plan_entry(request, pk):
    plan = MealPlan.objects.filter(space=request.space).get(pk=pk)

    if plan.created_by != request.user and plan.shared != request.user:
        messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
        return HttpResponseRedirect(reverse_lazy('index'))

    same_day_plan = MealPlan.objects \
        .filter(date=plan.date, space=request.space) \
        .exclude(pk=plan.pk) \
        .filter(Q(created_by=request.user) | Q(shared=request.user)) \
        .order_by('meal_type').all()

    return render(request, 'meal_plan_entry.html', {'plan': plan, 'same_day_plan': same_day_plan})


@group_required('user')
def latest_shopping_list(request):
    sl = ShoppingList.objects.filter(Q(created_by=request.user) | Q(shared=request.user)).filter(finished=False,
                                                                                                 space=request.space).order_by(
        '-created_at').first()

    if sl:
        return HttpResponseRedirect(reverse('view_shopping', kwargs={'pk': sl.pk}) + '?edit=true')
    else:
        return HttpResponseRedirect(reverse('view_shopping') + '?edit=true')


@group_required('user')
def shopping_list(request, pk=None):  # TODO deprecate
    html_list = request.GET.getlist('r')

    recipes = []
    for r in html_list:
        r = r.replace('[', '').replace(']', '')
        if re.match(r'^([0-9])+,([0-9])+[.]*([0-9])*$', r):  # vulnerable to DoS
            rid, multiplier = r.split(',')
            if recipe := Recipe.objects.filter(pk=int(rid), space=request.space).first():
                recipes.append({'recipe': recipe.id, 'multiplier': multiplier})

    edit = True if 'edit' in request.GET and request.GET['edit'] == 'true' else False

    return render(request, 'shopping_list.html', {'shopping_list_id': pk, 'recipes': recipes, 'edit': edit})


@group_required('guest')
def user_settings(request):
    if request.space.demo:
        messages.add_message(request, messages.ERROR, _('This feature is not available in the demo version!'))
        return redirect('index')

    up = request.user.userpreference
    sp = request.user.searchpreference
    search_error = False
    active_tab = 'account'

    user_name_form = UserNameForm(instance=request.user)

    if request.method == "POST":
        if 'preference_form' in request.POST:
            active_tab = 'preferences'
            form = UserPreferenceForm(request.POST, prefix='preference', space=request.space)
            if form.is_valid():
                if not up:
                    up = UserPreference(user=request.user)

                up.theme = form.cleaned_data['theme']
                up.nav_color = form.cleaned_data['nav_color']
                up.default_unit = form.cleaned_data['default_unit']
                up.default_page = form.cleaned_data['default_page']
                up.show_recent = form.cleaned_data['show_recent']
                up.search_style = form.cleaned_data['search_style']
                up.plan_share.set(form.cleaned_data['plan_share'])
                up.ingredient_decimals = form.cleaned_data['ingredient_decimals']  # noqa: E501
                up.comments = form.cleaned_data['comments']
                up.use_fractions = form.cleaned_data['use_fractions']
                up.use_kj = form.cleaned_data['use_kj']
                up.sticky_navbar = form.cleaned_data['sticky_navbar']

                up.save()

        elif 'user_name_form' in request.POST:
            user_name_form = UserNameForm(request.POST, prefix='name')
            if user_name_form.is_valid():
                request.user.first_name = user_name_form.cleaned_data['first_name']
                request.user.last_name = user_name_form.cleaned_data['last_name']
                request.user.save()

        elif 'password_form' in request.POST:
            password_form = PasswordChangeForm(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)

        elif 'search_form' in request.POST:
            active_tab = 'search'
            search_form = SearchPreferenceForm(request.POST, prefix='search')
            if search_form.is_valid():
                if not sp:
                    sp = SearchPreferenceForm(user=request.user)
                fields_searched = (
                    len(search_form.cleaned_data['icontains'])
                    + len(search_form.cleaned_data['istartswith'])
                    + len(search_form.cleaned_data['trigram'])
                    + len(search_form.cleaned_data['fulltext'])
                )
                if fields_searched == 0:
                    search_form.add_error(None, _('You must select at least one field to search!'))
                    search_error = True
                elif search_form.cleaned_data['search'] in ['websearch', 'raw'] and len(
                        search_form.cleaned_data['fulltext']) == 0:
                    search_form.add_error('search',
                                          _('To use this search method you must select at least one full text search field!'))
                    search_error = True
                elif search_form.cleaned_data['search'] in ['websearch', 'raw'] and len(
                        search_form.cleaned_data['trigram']) > 0:
                    search_form.add_error(None, _('Fuzzy search is not compatible with this search method!'))
                    search_error = True
                else:
                    sp.search = search_form.cleaned_data['search']
                    sp.lookup = search_form.cleaned_data['lookup']
                    sp.unaccent.set(search_form.cleaned_data['unaccent'])
                    sp.icontains.set(search_form.cleaned_data['icontains'])
                    sp.istartswith.set(search_form.cleaned_data['istartswith'])
                    sp.trigram.set(search_form.cleaned_data['trigram'])
                    sp.fulltext.set(search_form.cleaned_data['fulltext'])
                    sp.trigram_threshold = search_form.cleaned_data['trigram_threshold']

                    if search_form.cleaned_data['preset'] == 'fuzzy':
                        sp.search = SearchPreference.SIMPLE
                        sp.lookup = True
                        sp.unaccent.set([SearchFields.objects.get(name='Name')])
                        sp.icontains.set([SearchFields.objects.get(name='Name')])
                        sp.istartswith.clear()
                        sp.trigram.set([SearchFields.objects.get(name='Name')])
                        sp.fulltext.clear()
                        sp.trigram_threshold = 0.1

                    if search_form.cleaned_data['preset'] == 'precise':
                        sp.search = SearchPreference.WEB
                        sp.lookup = True
                        sp.unaccent.set(SearchFields.objects.all())
                        sp.icontains.clear()
                        sp.istartswith.set([SearchFields.objects.get(name='Name')])
                        sp.trigram.clear()
                        sp.fulltext.set(SearchFields.objects.all())
                        sp.trigram_threshold = 0.1

                    sp.save()
        elif 'shopping_form' in request.POST:
            shopping_form = ShoppingPreferenceForm(request.POST, prefix='shopping')
            if shopping_form.is_valid():
                if not up:
                    up = UserPreference(user=request.user)

                up.shopping_share.set(shopping_form.cleaned_data['shopping_share'])
                up.mealplan_autoadd_shopping = shopping_form.cleaned_data['mealplan_autoadd_shopping']
                up.mealplan_autoexclude_onhand = shopping_form.cleaned_data['mealplan_autoexclude_onhand']
                up.mealplan_autoinclude_related = shopping_form.cleaned_data['mealplan_autoinclude_related']
                up.shopping_auto_sync = shopping_form.cleaned_data['shopping_auto_sync']
                up.filter_to_supermarket = shopping_form.cleaned_data['filter_to_supermarket']
                up.default_delay = shopping_form.cleaned_data['default_delay']
                up.shopping_recent_days = shopping_form.cleaned_data['shopping_recent_days']
                up.shopping_add_onhand = shopping_form.cleaned_data['shopping_add_onhand']
                up.csv_delim = shopping_form.cleaned_data['csv_delim']
                up.csv_prefix = shopping_form.cleaned_data['csv_prefix']
                if up.shopping_auto_sync < settings.SHOPPING_MIN_AUTOSYNC_INTERVAL:
                    up.shopping_auto_sync = settings.SHOPPING_MIN_AUTOSYNC_INTERVAL
                up.save()
    if up:
        preference_form = UserPreferenceForm(instance=up)
        shopping_form = ShoppingPreferenceForm(instance=up)
    else:
        preference_form = UserPreferenceForm(space=request.space)
        shopping_form = ShoppingPreferenceForm(space=request.space)

    fields_searched = len(sp.icontains.all()) + len(sp.istartswith.all()) + len(sp.trigram.all()) + len(
        sp.fulltext.all())
    if sp and not search_error and fields_searched > 0:
        search_form = SearchPreferenceForm(instance=sp)
    elif not search_error:
        search_form = SearchPreferenceForm()

    if (api_token := Token.objects.filter(user=request.user).first()) is None:
        api_token = Token.objects.create(user=request.user)

    # these fields require postgresql - just disable them if postgresql isn't available
    if not settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2',
                                                       'django.db.backends.postgresql']:
        search_form.fields['search'].disabled = True
        search_form.fields['lookup'].disabled = True
        search_form.fields['trigram'].disabled = True
        search_form.fields['fulltext'].disabled = True

    return render(request, 'settings.html', {
        'preference_form': preference_form,
        'user_name_form': user_name_form,
        'api_token': api_token,
        'search_form': search_form,
        'shopping_form': shopping_form,
        'active_tab': active_tab
    })


@group_required('guest')
def history(request):
    view_log = ViewLogTable(
        ViewLog.objects.filter(
            created_by=request.user, space=request.space
        ).order_by('-created_at').all()
    )
    cook_log = CookLogTable(
        CookLog.objects.filter(
            created_by=request.user
        ).order_by('-created_at').all()
    )
    return render(request, 'history.html', {'view_log': view_log, 'cook_log': cook_log})


@group_required('admin')
def system(request):
    postgres = False if (
            settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql_psycopg2'  # noqa: E501
            or settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'  # noqa: E501
    ) else True

    secret_key = False if os.getenv('SECRET_KEY') else True

    return render(request, 'system.html', {
        'gunicorn_media': settings.GUNICORN_MEDIA,
        'debug': settings.DEBUG,
        'postgres': postgres,
        'version': VERSION_NUMBER,
        'ref': BUILD_REF,
        'secret_key': secret_key
    })


def setup(request):
    with scopes_disabled():
        if User.objects.count() > 0 or 'django.contrib.auth.backends.RemoteUserBackend' in settings.AUTHENTICATION_BACKENDS:
            messages.add_message(request, messages.ERROR,
                                 _('The setup page can only be used to create the first user! If you have forgotten your superuser credentials please consult the django documentation on how to reset passwords.'))
            return HttpResponseRedirect(reverse('account_login'))

        if request.method == 'POST':
            form = UserCreateForm(request.POST)
            if form.is_valid():
                if form.cleaned_data['password'] != form.cleaned_data['password_confirm']:
                    form.add_error('password', _('Passwords dont match!'))
                else:
                    user = User(username=form.cleaned_data['name'], is_superuser=True, is_staff=True)
                    try:
                        validate_password(form.cleaned_data['password'], user=user)
                        user.set_password(form.cleaned_data['password'])
                        user.save()

                        user.groups.add(Group.objects.get(name='admin'))

                        user.userpreference.space = Space.objects.first()
                        user.userpreference.save()

                        for x in Space.objects.all():
                            x.created_by = user
                            x.save()
                        messages.add_message(request, messages.SUCCESS, _('User has been created, please login!'))
                        return HttpResponseRedirect(reverse('account_login'))
                    except ValidationError as e:
                        for m in e:
                            form.add_error('password', m)
        else:
            form = UserCreateForm()

        return render(request, 'setup.html', {'form': form})


def invite_link(request, token):
    with scopes_disabled():
        try:
            token = UUID(token, version=4)
        except ValueError:
            messages.add_message(request, messages.ERROR, _('Malformed Invite Link supplied!'))
            return HttpResponseRedirect(reverse('index'))

        if link := InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, uuid=token).first():
            if request.user.is_authenticated:
                if request.user.userpreference.space:
                    messages.add_message(request, messages.WARNING,
                                         _('You are already member of a space and therefore cannot join this one.'))
                    return HttpResponseRedirect(reverse('index'))

                link.used_by = request.user
                link.save()
                request.user.groups.clear()
                request.user.groups.add(link.group)

                request.user.userpreference.space = link.space
                request.user.userpreference.save()

                messages.add_message(request, messages.SUCCESS, _('Successfully joined space.'))
                return HttpResponseRedirect(reverse('index'))
            else:
                request.session['signup_token'] = str(token)
                return HttpResponseRedirect(reverse('account_signup'))

    messages.add_message(request, messages.ERROR, _('Invite Link not valid or already used!'))
    return HttpResponseRedirect(reverse('index'))


# TODO deprecated with 0.16.2 remove at some point
def signup(request, token):
    return HttpResponseRedirect(reverse('view_invite', args=[token]))


@group_required('admin')
def space(request):
    space_users = UserPreference.objects.filter(space=request.space).all()

    counts = Object()
    counts.recipes = Recipe.objects.filter(space=request.space).count()
    counts.keywords = Keyword.objects.filter(space=request.space).count()
    counts.recipe_import = RecipeImport.objects.filter(space=request.space).count()
    counts.units = Unit.objects.filter(space=request.space).count()
    counts.ingredients = Food.objects.filter(space=request.space).count()
    counts.comments = Comment.objects.filter(recipe__space=request.space).count()

    counts.recipes_internal = Recipe.objects.filter(internal=True, space=request.space).count()
    counts.recipes_external = counts.recipes - counts.recipes_internal

    counts.recipes_no_keyword = Recipe.objects.filter(keywords=None, space=request.space).count()

    invite_links = InviteLinkTable(
        InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(invite_links)

    space_form = SpacePreferenceForm(instance=request.space)

    space_form.base_fields['food_inherit'].queryset = Food.inheritable_fields
    if request.method == "POST" and 'space_form' in request.POST:
        form = SpacePreferenceForm(request.POST, prefix='space')
        if form.is_valid():
            request.space.food_inherit.set(form.cleaned_data['food_inherit'])
            request.space.show_facet_count = form.cleaned_data['show_facet_count']
            request.space.save()
            if form.cleaned_data['reset_food_inherit']:
                Food.reset_inheritance(space=request.space)

    return render(request, 'space.html', {
        'space_users': space_users,
        'counts': counts,
        'invite_links': invite_links,
        'space_form': space_form
    })


# TODO super hacky and quick solution, safe but needs rework
# TODO move group settings to space to prevent permissions from one space to move to another
@group_required('admin')
def space_change_member(request, user_id, space_id, group):
    m_space = get_object_or_404(Space, pk=space_id)
    m_user = get_object_or_404(User, pk=user_id)
    if request.user == m_space.created_by and m_user != m_space.created_by:
        if m_user.userpreference.space == m_space:
            if group == 'admin':
                m_user.groups.clear()
                m_user.groups.add(Group.objects.get(name='admin'))
                return HttpResponseRedirect(reverse('view_space'))
            if group == 'user':
                m_user.groups.clear()
                m_user.groups.add(Group.objects.get(name='user'))
                return HttpResponseRedirect(reverse('view_space'))
            if group == 'guest':
                m_user.groups.clear()
                m_user.groups.add(Group.objects.get(name='guest'))
                return HttpResponseRedirect(reverse('view_space'))
            if group == 'remove':
                m_user.groups.clear()
                m_user.userpreference.space = None
                m_user.userpreference.save()
                return HttpResponseRedirect(reverse('view_space'))
    return HttpResponseRedirect(reverse('view_space'))


def report_share_abuse(request, token):
    if not settings.SHARING_ABUSE:
        messages.add_message(request, messages.WARNING,
                             _('Reporting share links is not enabled for this instance. Please notify the page administrator to report problems.'))
    else:
        if link := ShareLink.objects.filter(uuid=token).first():
            link.abuse_blocked = True
            link.save()
            messages.add_message(request, messages.WARNING,
                                 _('Recipe sharing link has been disabled! For additional information please contact the page administrator.'))
    return HttpResponseRedirect(reverse('index'))


def markdown_info(request):
    return render(request, 'markdown_info.html', {})


def search_info(request):
    return render(request, 'search_info.html', {})


@group_required('guest')
def api_info(request):
    return render(request, 'api_info.html', {})


def offline(request):
    return render(request, 'offline.html', {})


def test(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))

    with scopes_disabled():
        result = ShoppingList.objects.filter(
            Q(created_by=request.user) | Q(shared=request.user)).filter(
            space=request.space).values().distinct()
    return JsonResponse(list(result), safe=False, json_dumps_params={'indent': 2})


def test2(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))
