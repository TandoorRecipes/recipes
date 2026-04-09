"""
One-time migration: convert Food.onhand_users entries to InventoryEntry records.

For each food that has on-hand users, creates an InventoryEntry with amount=1,
no unit, in the first InventoryLocation found for that space.

Usage:
    conda run -n tandoor python manage.py migrate_onhand_to_inventory
    conda run -n tandoor python manage.py migrate_onhand_to_inventory --dry-run
"""
from django.core.management.base import BaseCommand
from django_scopes import scopes_disabled

from cookbook.models import Food, InventoryEntry, InventoryLocation


class Command(BaseCommand):
    help = 'Migrate Food.onhand_users to InventoryEntry records (amount=1, no unit)'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be created without writing')

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        with scopes_disabled():
            # Build a map of space_id -> first inventory location
            location_map = {}
            for loc in InventoryLocation.objects.order_by('id'):
                if loc.space_id not in location_map:
                    location_map[loc.space_id] = loc

            foods = Food.objects.filter(onhand_users__isnull=False).distinct().select_related('space')
            created = 0
            skipped_no_location = 0
            skipped_exists = 0

            for food in foods:
                location = location_map.get(food.space_id)
                if not location:
                    skipped_no_location += 1
                    if dry_run:
                        self.stdout.write(f'  SKIP (no location): {food.name} [space {food.space_id}]')
                    continue

                for user in food.onhand_users.all():
                    exists = InventoryEntry.objects.filter(
                        food=food, created_by=user, space=food.space
                    ).exists()
                    if exists:
                        skipped_exists += 1
                        if dry_run:
                            self.stdout.write(f'  SKIP (exists): {food.name} for {user.username}')
                        continue

                    if dry_run:
                        self.stdout.write(f'  CREATE: {food.name} -> {location.name} for {user.username}')
                    else:
                        InventoryEntry.objects.create(
                            food=food,
                            inventory_location=location,
                            amount=1,
                            unit=None,
                            created_by=user,
                            space=food.space,
                        )
                    created += 1

        prefix = '[DRY RUN] ' if dry_run else ''
        self.stdout.write(self.style.SUCCESS(
            f'{prefix}Done: {created} entries created, '
            f'{skipped_no_location} skipped (no location), '
            f'{skipped_exists} skipped (already exists)'
        ))
