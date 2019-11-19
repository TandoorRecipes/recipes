from dal import autocomplete

from cookbook.models import Keyword, RecipeIngredients


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
