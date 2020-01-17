from dal import autocomplete

from cookbook.models import Keyword, RecipeIngredients, Recipe


class KeywordAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Keyword.objects.none()

        qs = Keyword.objects.all()

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs


class IngredientsAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return RecipeIngredients.objects.none()

        qs = RecipeIngredients.objects.all()

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs


class RecipeAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Recipe.objects.none()

        qs = Recipe.objects.all()

        if self.q:
            qs = qs.filter(name__icontains=self.q)

        return qs
