from django.db.models import Q
from django.utils import timezone

from cookbook.models import UserPreference


def shopping_helper(qs, request):
    today_start = timezone.now().replace(hour=0, minute=0, second=0)
    qs = qs.filter(Q(shoppinglist__created_by=request.user) | Q(shoppinglist__shared=request.user)).filter(shoppinglist__space=request.space)
    qs = qs.filter(Q(checked=False) | Q(completed_at__gte=today_start))
    return qs
