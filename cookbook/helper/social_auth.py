from django.conf import settings
from django.contrib.auth.models import Group
from django_scopes import scopes_disabled

from cookbook.models import Space, UserSpace


def assign_social_default_access(user, active):
    """Assign a user to the configured social-auth space and group."""
    with scopes_disabled():
        if settings.SOCIAL_DEFAULT_SPACE:
            space = Space.objects.filter(pk=settings.SOCIAL_DEFAULT_SPACE).first()
        else:
            space = Space.objects.first()

        group = Group.objects.filter(name=settings.SOCIAL_DEFAULT_GROUP).first()
        if space and group:
            user_space = UserSpace.objects.create(space=space, user=user, active=active)
            user_space.groups.add(group)
            return user_space

        if not space:
            if settings.SOCIAL_DEFAULT_SPACE:
                print(
                    f'WARNING: SOCIAL_DEFAULT_SPACE={settings.SOCIAL_DEFAULT_SPACE!r} does not match any Space. '
                    f'Cannot auto-assign user {user}.'
                )
            else:
                print(f'WARNING: SOCIAL_DEFAULT_ACCESS is enabled but no Space exists. Cannot auto-assign user {user}.')
        if not group:
            print(
                f'WARNING: SOCIAL_DEFAULT_GROUP={settings.SOCIAL_DEFAULT_GROUP!r} does not match any Group. '
                f'Cannot auto-assign user {user}.'
            )

        return None
