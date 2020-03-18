import copy
import re
from datetime import datetime, timedelta

from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.shortcuts import render, get_object_or_404
from django_tables2 import RequestConfig
from django.utils.translation import gettext as _

from cookbook.filters import RecipeFilter
from cookbook.forms import *
from cookbook.tables import RecipeTable


def index(request):
    if request.user.is_authenticated:
        f = RecipeFilter(request.GET, queryset=Recipe.objects.all().order_by('name'))

        table = RecipeTable(f.qs)
        RequestConfig(request, paginate={'per_page': 25}).configure(table)

        return render(request, 'index.html', {'recipes': table, 'filter': f})
    else:
        return render(request, 'index.html')


@login_required
def recipe_view(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    ingredients = RecipeIngredient.objects.filter(recipe=recipe)
    comments = Comment.objects.filter(recipe=recipe)

    if request.method == "POST":
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

            bookmark.save()

            messages.add_message(request, messages.SUCCESS, _('Bookmark saved!'))

    comment_form = CommentForm()
    bookmark_form = RecipeBookEntryForm()

    return render(request, 'recipe_view.html',
                  {'recipe': recipe, 'ingredients': ingredients, 'comments': comments, 'comment_form': comment_form,
                   'bookmark_form': bookmark_form})


@login_required()
def books(request):
    book_list = []

    books = RecipeBook.objects.filter(user=request.user).all()

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


@login_required()
def meal_plan(request):
    js_week = datetime.now().strftime("%Y-W%V")
    if request.method == "POST":
        js_week = request.POST['week']

    year, week = js_week.split('-')
    first_day, last_day = get_start_end_from_week(year, week.replace('W', ''))

    surrounding_weeks = {'next': (last_day + timedelta(3)).strftime("%Y-W%V"), 'prev': (first_day - timedelta(3)).strftime("%Y-W%V")}

    days = get_days_from_week(first_day, last_day)
    days_dict = {}
    for d in days:
        days_dict[d] = []

    plan = {}
    for t in MealPlan.MEAL_TYPES:
        plan[t[0]] = {'type_name': t[1], 'days': copy.deepcopy(days_dict)}

    for d in days:
        plan_day = MealPlan.objects.filter(date=d).all()
        for p in plan_day:
            plan[p.meal]['days'][d].append(p)

    return render(request, 'meal_plan.html', {'js_week': js_week, 'plan': plan, 'days': days, 'surrounding_weeks': surrounding_weeks})


@login_required
def shopping_list(request):
    markdown_format = True

    if request.method == "POST":
        form = ShoppingForm(request.POST)
        if form.is_valid():
            recipes = form.cleaned_data['recipe']
            markdown_format = form.cleaned_data['markdown_format']
        else:
            recipes = []
    else:
        raw_list = request.GET.getlist('r')

        recipes = []
        for r in raw_list:
            if re.match(r'^([1-9])+$', r):
                if Recipe.objects.filter(pk=int(r)).exists():
                    recipes.append(int(r))

        form = ShoppingForm(initial={'recipe': recipes})

    ingredients = []

    for r in recipes:
        for ri in RecipeIngredient.objects.filter(recipe=r).all():
            index = None
            for x, ig in enumerate(ingredients):
                if ri.ingredient == ig.ingredient and ri.unit == ig.unit:
                    index = x

            if index:
                ingredients[index].amount = ingredients[index].amount + ri.amount
            else:
                ingredients.append(ri)

    return render(request, 'shopping_list.html', {'ingredients': ingredients, 'recipes': recipes, 'form': form, 'markdown_format': markdown_format})


@login_required
def settings(request):
    try:
        up = request.user.userpreference
    except UserPreference.DoesNotExist:
        up = None

    user_name_form = UserNameForm(instance=request.user)
    password_form = PasswordChangeForm(request.user)

    if request.method == "POST":
        if 'preference_form' in request.POST:
            form = UserPreferenceForm(request.POST, prefix='preference')
            if form.is_valid():
                if not up:
                    up = UserPreference(user=request.user)
                up.theme = form.cleaned_data['theme']
                up.nav_color = form.cleaned_data['nav_color']
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

    return render(request, 'settings.html', {'preference_form': preference_form, 'user_name_form': user_name_form, 'password_form': password_form})
