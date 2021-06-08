import os
import re
from datetime import datetime
from uuid import UUID

from allauth.account.forms import SignupForm
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import Avg, Q, Sum
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext as _
from django_scopes import scopes_disabled, scope
from django_tables2 import RequestConfig
from rest_framework.authtoken.models import Token

from cookbook.filters import RecipeFilter
from cookbook.forms import (CommentForm, Recipe, RecipeBookEntryForm, User,
                            UserCreateForm, UserNameForm, UserPreference,
                            UserPreferenceForm, SpaceJoinForm, SpaceCreateForm, AllAuthSignupForm)
from cookbook.helper.permission_helper import group_required, share_link_valid, has_group_permission
from cookbook.models import (Comment, CookLog, InviteLink, MealPlan,
                             RecipeBook, RecipeBookEntry, ViewLog, ShoppingList, Space, Keyword, RecipeImport, Unit,
                             Food, UserFile)
from cookbook.tables import (CookLogTable, RecipeTable, RecipeTableSmall,
                             ViewLogTable, InviteLinkTable)
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
                allow_files=settings.SPACE_DEFAULT_FILES,
                max_recipes=settings.SPACE_DEFAULT_MAX_RECIPES,
                max_users=settings.SPACE_DEFAULT_MAX_USERS,
            )
            request.user.userpreference.space = created_space
            request.user.userpreference.save()
            request.user.groups.add(Group.objects.filter(name='admin').get())

            messages.add_message(request, messages.SUCCESS, _('You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you.'))
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

        create_form = SpaceCreateForm()
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
    book_list = []

    recipe_books = RecipeBook.objects.filter(Q(created_by=request.user) | Q(shared=request.user),
                                             space=request.space).distinct().all()

    for b in recipe_books:
        book_list.append(
            {
                'book': b,
                'recipes': RecipeBookEntry.objects.filter(book=b).all()
            }
        )

    return render(request, 'books.html', {'book_list': book_list})


@group_required('user')
def meal_plan(request):
    return render(request, 'meal_plan.html', {})


@group_required('user')
def supermarket(request):
    return render(request, 'supermarket.html', {})


@group_required('user')
def files(request):
    current_file_size_mb = UserFile.objects.filter(space=request.space).aggregate(Sum('file_size_kb'))['file_size_kb__sum'] / 1000
    return render(request, 'files.html', {'current_file_size_mb': current_file_size_mb, 'max_file_size_mb': request.space.max_file_storage_mb})


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
def shopping_list(request, pk=None):
    html_list = request.GET.getlist('r')

    recipes = []
    for r in html_list:
        r = r.replace('[', '').replace(']', '')
        if re.match(r'^([0-9])+,([0-9])+[.]*([0-9])*$', r):
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

    user_name_form = UserNameForm(instance=request.user)
    password_form = PasswordChangeForm(request.user)
    password_form.fields['old_password'].widget.attrs.pop("autofocus", None)

    if request.method == "POST":
        if 'preference_form' in request.POST:
            form = UserPreferenceForm(request.POST, prefix='preference')
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
                up.sticky_navbar = form.cleaned_data['sticky_navbar']

                up.shopping_auto_sync = form.cleaned_data['shopping_auto_sync']
                if up.shopping_auto_sync < settings.SHOPPING_MIN_AUTOSYNC_INTERVAL:
                    up.shopping_auto_sync = settings.SHOPPING_MIN_AUTOSYNC_INTERVAL

                up.save()

        if 'user_name_form' in request.POST:
            user_name_form = UserNameForm(request.POST, prefix='name')
            if user_name_form.is_valid():
                request.user.first_name = user_name_form.cleaned_data['first_name']
                request.user.last_name = user_name_form.cleaned_data['last_name']
                request.user.save()

        if 'password_form' in request.POST:
            password_form = PasswordChangeForm(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)

    if up:
        preference_form = UserPreferenceForm(instance=up)
    else:
        preference_form = UserPreferenceForm()

    if (api_token := Token.objects.filter(user=request.user).first()) is None:
        api_token = Token.objects.create(user=request.user)

    return render(request, 'settings.html', {
        'preference_form': preference_form,
        'user_name_form': user_name_form,
        'password_form': password_form,
        'api_token': api_token,
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
                    messages.add_message(request, messages.WARNING, _('You are already member of a space and therefore cannot join this one.'))
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

    invite_links = InviteLinkTable(InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, space=request.space).all())
    RequestConfig(request, paginate={'per_page': 25}).configure(invite_links)

    return render(request, 'space.html', {'space_users': space_users, 'counts': counts, 'invite_links': invite_links})


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


def markdown_info(request):
    return render(request, 'markdown_info.html', {})


@group_required('guest')
def api_info(request):
    return render(request, 'api_info.html', {})


def offline(request):
    return render(request, 'offline.html', {})


def test(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))


def test2(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))
