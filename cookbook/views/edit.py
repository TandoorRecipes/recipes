from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from cookbook.forms import RecipeForm, EditRecipeForm
from cookbook.models import Recipe


@login_required
def recipe(request, recipe_id):
    if request.method == "POST":
        form = RecipeForm(request.POST)
        if form.is_valid():
            recipe_obj = form.save(commit=False)
            recipe_obj.created_by = request.user.id
            recipe_obj.save()
            form.save_m2m()
            return redirect('edit_recipe/' + recipe_id)
    else:
        recipe_obj = Recipe.objects.get(id=recipe_id)
        form = EditRecipeForm(instance=recipe_obj)

    return render(request, 'new_recipe.html', {'from': form})


@login_required
def category(request, category_id):
    return render(request, 'index.html')


@login_required
def keyword(request, keyword_id):
    return render(request, 'index.html')
