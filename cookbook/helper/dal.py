from cookbook.models import Food, Keyword, Recipe, Unit

from dal import autocomplete


class BaseAutocomplete(autocomplete.Select2QuerySetView):
    model = None

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return self.model.objects.none()

        qs = self.model.objects.all()

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs


class KeywordAutocomplete(BaseAutocomplete):
    model = Keyword


class IngredientsAutocomplete(BaseAutocomplete):
    model = Food


class RecipeAutocomplete(BaseAutocomplete):
    model = Recipe


class UnitAutocomplete(BaseAutocomplete):
    model = Unit
