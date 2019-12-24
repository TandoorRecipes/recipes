from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
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
    ingredients = RecipeIngredients.objects.filter(recipe=recipe)
    comments = Comment.objects.filter(recipe=recipe)

    if request.method == "POST":
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = Comment()
            comment.recipe = recipe
            comment.text = form.cleaned_data['text']
            comment.created_by = request.user

            comment.save()

            messages.add_message(request, messages.SUCCESS, _('Comment saved!'))
            return HttpResponseRedirect(reverse('view_recipe', args=[pk]))
        else:
            messages.add_message(request, messages.ERROR, _('There was an error saving this comment!'))
    else:
        form = CommentForm()

    return render(request, 'recipe_view.html',
                  {'recipe': recipe, 'ingredients': ingredients, 'comments': comments, 'form': form})


@login_required()
def books(request):
    book_list = []

    books = RecipeBook.objects.filter(user=request.user).all()

    for b in books:
        book_list.append( {'book': b, 'recipes': RecipeBookEntry.objects.filter(book=b).all()})

    return render(request, 'books.html', {'book_list': book_list})
