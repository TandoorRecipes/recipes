import logging

from django.conf import settings
from django.contrib.auth.models import Group, User
from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django_scopes import scopes_disabled

from cookbook.models import Space, UserSpace

logger = logging.getLogger(__name__)


def ensure_default_access(user):
    """Assign users without memberships to the configured shared space, never a new space."""
    if not settings.SOCIAL_DEFAULT_ACCESS:
        return None

    with scopes_disabled(), transaction.atomic():
        # Serialize provisioning for this user and preserve existing memberships/groups.
        User.objects.select_for_update().get(pk=user.pk)
        membership = UserSpace.objects.filter(user=user).order_by('-active', 'pk').first()
        if membership:
            return membership

        space_id = settings.SOCIAL_DEFAULT_SPACE_ID
        if space_id:
            try:
                space = Space.objects.filter(pk=int(space_id)).first()
            except (TypeError, ValueError):
                raise ImproperlyConfigured('SOCIAL_DEFAULT_SPACE_ID must be a numeric space ID.')
            if space is None:
                raise ImproperlyConfigured(f'SOCIAL_DEFAULT_SPACE_ID={space_id!r} does not reference an existing space.')
        else:
            space = Space.objects.order_by('pk').first()

        group = Group.objects.filter(name=settings.SOCIAL_DEFAULT_GROUP).first()
        if not space or not group:
            logger.warning('Cannot assign default access: no space exists or SOCIAL_DEFAULT_GROUP=%r is invalid.', settings.SOCIAL_DEFAULT_GROUP)
            return None

        membership = UserSpace.objects.create(user=user, space=space, active=True)
        membership.groups.add(group)
        return membership
