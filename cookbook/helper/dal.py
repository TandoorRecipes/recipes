from dal import autocomplete

from cookbook.models import Keyword


class KeywordAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Keyword.objects.none()

        qs = Keyword.objects.all()

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs
