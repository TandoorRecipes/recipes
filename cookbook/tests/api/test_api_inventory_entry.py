from decimal import Decimal
from types import SimpleNamespace

import pytest
from django.contrib import auth
from django_scopes import scopes_disabled
from rest_framework.exceptions import ValidationError

from cookbook.models import InventoryEntry, InventoryLog
from cookbook.serializer import InventoryEntrySerializer
from cookbook.tests.factories import FoodFactory, InventoryEntryFactory, InventoryLocationFactory, UnitFactory


def build_inventory_entry_serializer(user, space, data):
    request = SimpleNamespace(user=user, space=space)
    return InventoryEntrySerializer(data=data, context={'request': request})


def test_create_duplicate_code_increments_existing_entry(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        unit = UnitFactory(space=space_1)
        inventory_location = InventoryLocationFactory(space=space_1, created_by=user)
        existing = InventoryEntryFactory(
            space=space_1,
            created_by=user,
            inventory_location=inventory_location,
            food=food,
            unit=unit,
            code='ABC123',
            amount=Decimal('2.5'),
        )

    serializer = build_inventory_entry_serializer(user, space_1, {
        'inventory_location': inventory_location.id,
        'food': food.id,
        'unit': unit.id,
        'code': 'ABC123',
        'amount': '3.25',
    })

    with scopes_disabled():
        assert serializer.is_valid(), serializer.errors
        result = serializer.save()

    assert result.id == existing.id

    with scopes_disabled():
        existing.refresh_from_db()
        assert InventoryEntry.objects.filter(space=space_1, code='ABC123').count() == 1
        assert existing.amount == Decimal('5.75')


def test_create_duplicate_code_adds_inventory_log(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        unit = UnitFactory(space=space_1)
        inventory_location = InventoryLocationFactory(space=space_1, created_by=user)
        existing = InventoryEntryFactory(
            space=space_1,
            created_by=user,
            inventory_location=inventory_location,
            food=food,
            unit=unit,
            code='ABC123',
            amount=Decimal('2.5'),
        )

    serializer = build_inventory_entry_serializer(user, space_1, {
        'inventory_location': inventory_location.id,
        'food': food.id,
        'unit': unit.id,
        'code': 'ABC123',
        'amount': '3.25',
    })

    with scopes_disabled():
        assert serializer.is_valid(), serializer.errors
        serializer.save()

    with scopes_disabled():
        log = InventoryLog.objects.get(entry=existing)
        assert log.booking_type == InventoryLog.B_ADD
        assert log.old_amount == Decimal('2.5')
        assert log.new_amount == Decimal('5.75')
        assert log.old_inventory_location == inventory_location
        assert log.new_inventory_location == inventory_location


def test_create_duplicate_code_with_different_unit_raises_validation_error(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        unit = UnitFactory(space=space_1)
        different_unit = UnitFactory(space=space_1)
        inventory_location = InventoryLocationFactory(space=space_1, created_by=user)
        existing = InventoryEntryFactory(
            space=space_1,
            created_by=user,
            inventory_location=inventory_location,
            food=food,
            unit=unit,
            code='ABC123',
            amount=Decimal('2.5'),
        )

    serializer = build_inventory_entry_serializer(user, space_1, {
        'inventory_location': inventory_location.id,
        'food': food.id,
        'unit': different_unit.id,
        'code': 'ABC123',
        'amount': '3.25',
    })

    with scopes_disabled():
        assert serializer.is_valid(), serializer.errors
        with pytest.raises(ValidationError) as exc_info:
            serializer.save()
        assert 'unit' in exc_info.value.detail

        existing.refresh_from_db()
        assert existing.amount == Decimal('2.5')


def test_create_duplicate_code_preserves_existing_entry_details(u1_s1, space_1):
    user = auth.get_user(u1_s1)
    with scopes_disabled():
        food = FoodFactory(space=space_1)
        new_food = FoodFactory(space=space_1)
        unit = UnitFactory(space=space_1)
        inventory_location = InventoryLocationFactory(space=space_1, created_by=user)
        new_inventory_location = InventoryLocationFactory(space=space_1, created_by=user)
        existing = InventoryEntryFactory(
            space=space_1,
            created_by=user,
            inventory_location=inventory_location,
            sub_location='Pantry shelf',
            food=food,
            unit=unit,
            code='ABC123',
            amount=Decimal('2.5'),
        )

    serializer = build_inventory_entry_serializer(user, space_1, {
        'inventory_location': new_inventory_location.id,
        'sub_location': 'Other shelf',
        'food': new_food.id,
        'unit': unit.id,
        'code': 'ABC123',
        'amount': '3.25',
    })

    with scopes_disabled():
        assert serializer.is_valid(), serializer.errors
        serializer.save()

        existing.refresh_from_db()
        assert existing.amount == Decimal('5.75')
        assert existing.inventory_location == inventory_location
        assert existing.sub_location == 'Pantry shelf'
        assert existing.food == food
        assert existing.unit == unit
