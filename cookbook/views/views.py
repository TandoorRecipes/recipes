import os
from datetime import datetime
from uuid import UUID

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import Avg, Q
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext as _
from django_tables2 import RequestConfig
from rest_framework.authtoken.models import Token

from cookbook.filters import RecipeFilter
from cookbook.forms import *
from cookbook.helper.permission_helper import group_required, share_link_valid
from cookbook.tables import (CookLogTable, RecipeTable, RecipeTableSmall,
                             ViewLogTable)
from recipes.version import *


def index(request):
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
        return HttpResponseRedirect(reverse('login') + '?next=' + request.path)


def search(request):
    if request.user.is_authenticated:
        f = RecipeFilter(request.GET, queryset=Recipe.objects.all().order_by('name'))

        if request.user.userpreference.search_style == UserPreference.LARGE:
            table = RecipeTable(f.qs)
        else:
            table = RecipeTableSmall(f.qs)
        RequestConfig(request, paginate={'per_page': 25}).configure(table)

        if request.GET == {} and request.user.userpreference.show_recent:
            qs = Recipe.objects.filter(viewlog__created_by=request.user).order_by('-viewlog__created_at').all()

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
        return HttpResponseRedirect(reverse('login') + '?next=' + request.path)


def recipe_view(request, pk, share=None):
    recipe = get_object_or_404(Recipe, pk=pk)

    if not request.user.is_authenticated and not share_link_valid(recipe, share):
        messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
        return HttpResponseRedirect(reverse('login') + '?next=' + request.path)

    comments = Comment.objects.filter(recipe=recipe)

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

        bookmark_form = RecipeBookEntryForm(request.POST, prefix='bookmark')
        if bookmark_form.is_valid():
            bookmark = RecipeBookEntry()
            bookmark.recipe = recipe
            bookmark.book = bookmark_form.cleaned_data['book']

            try:
                bookmark.save()
            except IntegrityError as e:
                if 'UNIQUE constraint' in str(e.args):
                    messages.add_message(request, messages.ERROR, _('This recipe is already linked to the book!'))
            else:
                messages.add_message(request, messages.SUCCESS, _('Bookmark saved!'))

    comment_form = CommentForm()
    bookmark_form = RecipeBookEntryForm()

    user_servings = None
    if request.user.is_authenticated:
        user_servings = CookLog.objects.filter(recipe=recipe, created_by=request.user,
                                               servings__gt=0).all().aggregate(Avg('servings'))['servings__avg']

    if request.user.is_authenticated:
        if not ViewLog.objects.filter(recipe=recipe).filter(created_by=request.user).filter(
                created_at__gt=(timezone.now() - timezone.timedelta(minutes=5))).exists():
            ViewLog.objects.create(recipe=recipe, created_by=request.user)

    return render(request, 'recipe_view.html',
                  {'recipe': recipe, 'comments': comments, 'comment_form': comment_form,
                   'bookmark_form': bookmark_form, 'share': share, 'user_servings': user_servings
                   })


@group_required('user')
def books(request):
    book_list = []

    books = RecipeBook.objects.filter(Q(created_by=request.user) | Q(shared=request.user)).distinct().all()

    for b in books:
        book_list.append({'book': b, 'recipes': RecipeBookEntry.objects.filter(book=b).all()})

    return render(request, 'books.html', {'book_list': book_list})


def get_start_end_from_week(p_year, p_week):
    first_day_of_week = datetime.strptime(f'{p_year}-W{int(p_week) - 1}-1', "%Y-W%W-%w").date()
    last_day_of_week = first_day_of_week + timedelta(days=6.9)
    return first_day_of_week, last_day_of_week


def get_days_from_week(start, end):
    delta = end - start
    days = []
    for i in range(delta.days + 1):
        days.append(start + timedelta(days=i))
    return days


@group_required('user')
def meal_plan(request):
    return render(request, 'meal_plan.html', {})


@group_required('user')
def meal_plan_entry(request, pk):
    plan = MealPlan.objects.get(pk=pk)

    if plan.created_by != request.user and plan.shared != request.user:
        messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
        return HttpResponseRedirect(reverse_lazy('index'))

    same_day_plan = MealPlan.objects.filter(date=plan.date).exclude(pk=plan.pk).filter(
        Q(created_by=request.user) | Q(shared=request.user)).order_by('meal_type').all()

    return render(request, 'meal_plan_entry.html', {'plan': plan, 'same_day_plan': same_day_plan})


@group_required('user')
def shopping_list(request, pk=None):
    raw_list = request.GET.getlist('r')

    recipes = []
    for r in raw_list:
        r = r.replace('[', '').replace(']', '')
        if re.match(r'^([0-9])+,([0-9])+[.]*([0-9])*$', r):
            rid, multiplier = r.split(',')
            if recipe := Recipe.objects.filter(pk=int(rid)).first():
                recipes.append({'recipe': recipe.id, 'multiplier': multiplier})

    return render(request, 'shopping_list.html', {'shopping_list_id': pk, 'recipes': recipes})


@group_required('guest')
def user_settings(request):
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
                up.ingredient_decimals = form.cleaned_data['ingredient_decimals']
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

    return render(request, 'settings.html',
                  {'preference_form': preference_form, 'user_name_form': user_name_form, 'password_form': password_form,
                   'api_token': api_token
                   })


@group_required('guest')
def history(request):
    view_log = ViewLogTable(ViewLog.objects.filter(created_by=request.user).order_by('-created_at').all())
    cook_log = CookLogTable(CookLog.objects.filter(created_by=request.user).order_by('-created_at').all())
    return render(request, 'history.html', {'view_log': view_log, 'cook_log': cook_log})


@group_required('admin')
def system(request):
    postgres = False if (settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql_psycopg2' or
                         settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql') else True

    secret_key = False if os.getenv('SECRET_KEY') else True

    return render(request, 'system.html',
                  {'gunicorn_media': settings.GUNICORN_MEDIA, 'debug': settings.DEBUG, 'postgres': postgres,
                   'version': VERSION_NUMBER, 'ref': BUILD_REF, 'secret_key': secret_key
                   })


def setup(request):
    if User.objects.count() > 0 or 'django.contrib.auth.backends.RemoteUserBackend' in settings.AUTHENTICATION_BACKENDS:
        messages.add_message(request, messages.ERROR, _(
            'The setup page can only be used to create the first user! If you have forgotten your superuser credentials please consult the django documentation on how to reset passwords.'))
        return HttpResponseRedirect(reverse('login'))

    if request.method == 'POST':
        form = UserCreateForm(request.POST)
        if form.is_valid():
            if form.cleaned_data['password'] != form.cleaned_data['password_confirm']:
                form.add_error('password', _('Passwords dont match!'))
            else:
                user = User(
                    username=form.cleaned_data['name'],
                    is_superuser=True,
                    is_staff=True
                )
                try:
                    validate_password(form.cleaned_data['password'], user=user)
                    user.set_password(form.cleaned_data['password'])
                    user.save()
                    messages.add_message(request, messages.SUCCESS, _('User has been created, please login!'))
                    return HttpResponseRedirect(reverse('login'))
                except ValidationError as e:
                    for m in e:
                        form.add_error('password', m)
    else:
        form = UserCreateForm()

    return render(request, 'setup.html', {'form': form})


def signup(request, token):
    try:
        token = UUID(token, version=4)
    except ValueError:
        messages.add_message(request, messages.ERROR, _('Malformed Invite Link supplied!'))
        return HttpResponseRedirect(reverse('index'))

    if link := InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, uuid=token).first():
        if request.method == 'POST':

            form = UserCreateForm(request.POST)
            if link.username != '':
                data = dict(form.data)
                data['name'] = link.username
                form.data = data

            if form.is_valid():
                if form.cleaned_data['password'] != form.cleaned_data['password_confirm']:
                    form.add_error('password', _('Passwords dont match!'))
                else:
                    user = User(
                        username=form.cleaned_data['name'],
                    )
                    try:
                        validate_password(form.cleaned_data['password'], user=user)
                        user.set_password(form.cleaned_data['password'])
                        user.save()
                        messages.add_message(request, messages.SUCCESS, _('User has been created, please login!'))

                        link.used_by = user
                        link.save()
                        user.groups.add(link.group)
                        return HttpResponseRedirect(reverse('login'))
                    except ValidationError as e:
                        for m in e:
                            form.add_error('password', m)
        else:
            form = UserCreateForm()

        if link.username != '':
            form.fields['name'].initial = link.username
            form.fields['name'].disabled = True
        return render(request, 'registration/signup.html', {'form': form, 'link': link})

    messages.add_message(request, messages.ERROR, _('Invite Link not valid or already used!'))
    return HttpResponseRedirect(reverse('index'))


def markdown_info(request):
    return render(request, 'markdown_info.html', {})


@group_required('guest')
def api_info(request):
    return render(request, 'api_info.html', {})


def test(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))

    return render(request, 'test.html', {'test': None})
