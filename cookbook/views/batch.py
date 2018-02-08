from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from cookbook.forms import ImportForm, BatchEditForm
from cookbook.helper import dropbox
from cookbook.models import Recipe, Category


@login_required
def batch_import(request):
    if request.method == "POST":
        form = ImportForm(request.POST)
        if form.is_valid():
            dropbox.import_all(form.cleaned_data['path'])
            return redirect('index')
    else:
        form = ImportForm()

    return render(request, 'batch/import.html', {'form': form})


@login_required
def batch_edit(request):
    if request.method == "POST":
        form = BatchEditForm(request.POST)
        if form.is_valid():
            word = form.cleaned_data['search']
            category = form.cleaned_data['category']
            keyword = form.cleaned_data['keyword']

            recipes = Recipe.objects.filter(name__contains=word)
            for recipe in recipes:
                if category is not None:
                    recipe.category = Category.objects.get(name=category)
                if keyword.__sizeof__() > 0:
                    recipe.keywords.add(*list(keyword))

                recipe.save()

            return redirect('batch_edit')
    else:
        form = BatchEditForm()

    return render(request, 'batch/edit.html', {'form': form})
