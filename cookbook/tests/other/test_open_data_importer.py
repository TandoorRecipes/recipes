"""
Reproduction tests for open data importer bugs.

#4231 - French food names stay English after FR import
#3030 - UNIQUE constraint failure on existing space
#2972 - Inconsistent update behavior (fields not updated)
#939  - MP Tree performance (not tested here - requires benchmarking)
"""
import pytest
from unittest.mock import MagicMock

from django_scopes import scopes_disabled

from cookbook.helper.open_data_importer import OpenDataImporter
from cookbook.models import Food, SupermarketCategory, Unit
from cookbook.tests.factories import SpaceFactory


def _make_request(space, user=None):
    """Create a mock request with the given space."""
    request = MagicMock()
    request.space = space
    if user:
        request.user = user
    return request


def _make_open_data(foods=None, categories=None, units=None):
    """Build a minimal open data dict."""
    data = {}
    if foods is not None:
        data['food'] = foods
    if categories is not None:
        data['category'] = categories
    if units is not None:
        data['unit'] = units
    return data


def _food_entry(name, plural_name='', store_category='', fdc_id='', properties=None):
    return {
        'name': name,
        'plural_name': plural_name,
        'store_category': store_category,
        'fdc_id': fdc_id,
        'properties': properties or {'food_amount': 100, 'food_unit': '', 'type_values': []},
    }


def _import_with_scopes_disabled(importer, method_name):
    """Run an importer method with scopes disabled (test runs outside request context)."""
    with scopes_disabled():
        return getattr(importer, method_name)()


@pytest.mark.django_db
class TestIssue4231_FrenchFoodNamesStayEnglish:
    """
    #4231: After importing EN then FR open data, food names remain English.

    Root cause: When importing FR over existing EN foods, the slug matches
    but update_existing=False (default), so updates are skipped.
    """

    def test_import_en_then_fr_without_update_keeps_english_names(self, space_1):
        """Import EN data, then FR data without update_existing. Food names should stay English."""
        en_data = _make_open_data(
            foods={
                'food-syrup-agave': _food_entry('Agave syrup', 'Agave syrups'),
                'food-butter-unsalted': _food_entry('Unsalted Butter'),
            },
            categories={
                'category-sweeteners': {'name': 'Sweeteners'},
                'category-dairy': {'name': 'Dairy'},
            },
        )
        fr_data = _make_open_data(
            foods={
                'food-syrup-agave': _food_entry("Sirop d'agave", "Sirops d'agave"),
                'food-butter-unsalted': _food_entry('Beurre doux'),
            },
            categories={
                'category-sweeteners': {'name': 'Édulcorants'},
                'category-dairy': {'name': 'Produits laitiers'},
            },
        )

        request = _make_request(space_1)

        # Import English first
        en_importer = OpenDataImporter(request, en_data, update_existing=False)
        _import_with_scopes_disabled(en_importer, 'import_category')
        _import_with_scopes_disabled(en_importer, 'import_food')

        with scopes_disabled():
            agave = Food.objects.get(space=space_1, open_data_slug='food-syrup-agave')
            assert agave.name == 'Agave syrup'

        # Import French WITHOUT update_existing (default user behavior)
        fr_importer = OpenDataImporter(request, fr_data, update_existing=False)
        _import_with_scopes_disabled(fr_importer, 'import_category')
        _import_with_scopes_disabled(fr_importer, 'import_food')

        with scopes_disabled():
            agave = Food.objects.get(space=space_1, open_data_slug='food-syrup-agave')
            # BUG: name stays English because update_existing=False skips the update
            assert agave.name == 'Agave syrup', (
                f"Expected English name to persist (bug #4231), got '{agave.name}'"
            )

    def test_import_en_then_fr_with_update_changes_to_french(self, space_1):
        """Import EN data, then FR data WITH update_existing. Food names should become French."""
        en_data = _make_open_data(
            foods={
                'food-syrup-agave': _food_entry('Agave syrup'),
            },
        )
        fr_data = _make_open_data(
            foods={
                'food-syrup-agave': _food_entry("Sirop d'agave"),
            },
        )

        request = _make_request(space_1)

        en_importer = OpenDataImporter(request, en_data, update_existing=False)
        _import_with_scopes_disabled(en_importer, 'import_food')

        fr_importer = OpenDataImporter(request, fr_data, update_existing=True)
        _import_with_scopes_disabled(fr_importer, 'import_food')

        with scopes_disabled():
            agave = Food.objects.get(space=space_1, open_data_slug='food-syrup-agave')
            # This SHOULD work — update_existing=True should update the name
            assert agave.name == "Sirop d'agave", (
                f"Expected French name after update, got '{agave.name}'"
            )


@pytest.mark.django_db
class TestIssue3030_UniqueConstraintOnExistingSpace:
    """
    #3030: Open data food import fails with UNIQUE constraint on existing space.

    Root cause: When importing a new locale over existing data, bulk_update
    tries to rename a food to a name that already exists in the space
    (from a user-created food or a recipe import).
    """

    def test_import_fails_when_translated_name_collides_with_existing_food(self, space_1):
        """
        Space has EN open data food 'Cherry' (slug food-cherry) AND a user-created
        food 'Kers' (Dutch for cherry, no slug). Importing NL tries to rename
        food-cherry to 'Kers' → UNIQUE constraint violation.
        """
        with scopes_disabled():
            Food.add_root(
                name='Cherry',
                open_data_slug='food-cherry',
                space=space_1,
            )
            Food.add_root(
                name='Kers',
                space=space_1,
            )

        nl_data = _make_open_data(
            foods={
                'food-cherry': _food_entry('Kers'),
            },
        )

        request = _make_request(space_1)
        importer = OpenDataImporter(request, nl_data, update_existing=True)

        # BUG: This should handle the name collision gracefully, but raises IntegrityError
        try:
            result = _import_with_scopes_disabled(importer, 'import_food')
            with scopes_disabled():
                foods = Food.objects.filter(space=space_1, name='Kers')
                assert foods.count() == 1, f"Expected 1 food named 'Kers', got {foods.count()}"
        except Exception as e:
            pytest.fail(f"Bug #3030 reproduced: {type(e).__name__}: {e}")


@pytest.mark.django_db
class TestIssue2972_InconsistentUpdateBehavior:
    """
    #2972: Open data 'Update Existing Data' has inconsistent behavior.

    Root cause: import_food() field_list is ['name', 'open_data_slug'].
    Only these fields are compared and updated. plural_name,
    supermarket_category_id, fdc_id, etc. are never updated.
    """

    def test_changed_food_name_and_plural_name_are_both_restored(self, space_1):
        """
        Change both name and plural_name on an imported food, then re-import.
        Both should be restored because all obj_dict fields are in field_list.
        """
        original_data = _make_open_data(
            foods={
                'food-butter': _food_entry('Butter', plural_name='Butters'),
            },
        )

        request = _make_request(space_1)

        importer = OpenDataImporter(request, original_data, update_existing=False)
        _import_with_scopes_disabled(importer, 'import_food')

        with scopes_disabled():
            butter = Food.objects.get(space=space_1, open_data_slug='food-butter')
            butter.name = 'My Special Butter'
            butter.plural_name = 'My Special Butters'
            butter.save()

        importer2 = OpenDataImporter(request, original_data, update_existing=True)
        _import_with_scopes_disabled(importer2, 'import_food')

        with scopes_disabled():
            butter = Food.objects.get(space=space_1, open_data_slug='food-butter')
            assert butter.name == 'Butter', f"Expected name restored, got '{butter.name}'"
            assert butter.plural_name == 'Butters', (
                f"Expected plural_name restored, got '{butter.plural_name}'"
            )

    def test_changed_supermarket_category_is_restored(self, space_1):
        """
        Change the supermarket category on an imported food, then re-import.
        Category should be restored because supermarket_category_id is in field_list.
        """
        cat_data = {
            'category-dairy': {'name': 'Dairy'},
            'category-other': {'name': 'Other'},
        }
        food_data = {
            'food-butter': _food_entry('Butter', store_category='category-dairy'),
        }

        request = _make_request(space_1)

        data = _make_open_data(categories=cat_data, foods=food_data)
        importer = OpenDataImporter(request, data, update_existing=False)
        _import_with_scopes_disabled(importer, 'import_category')
        _import_with_scopes_disabled(importer, 'import_food')

        with scopes_disabled():
            butter = Food.objects.get(space=space_1, open_data_slug='food-butter')
            dairy_cat = SupermarketCategory.objects.get(space=space_1, name='Dairy')
            other_cat = SupermarketCategory.objects.get(space=space_1, name='Other')
            assert butter.supermarket_category_id == dairy_cat.id
            butter.supermarket_category = other_cat
            butter.save()

        importer2 = OpenDataImporter(request, data, update_existing=True)
        _import_with_scopes_disabled(importer2, 'import_category')
        _import_with_scopes_disabled(importer2, 'import_food')

        with scopes_disabled():
            butter = Food.objects.get(space=space_1, open_data_slug='food-butter')
            assert butter.supermarket_category_id == dairy_cat.id, (
                f"Expected supermarket_category restored to Dairy, "
                f"got category_id={butter.supermarket_category_id}"
            )

    def test_field_list_includes_all_obj_dict_fields(self):
        """
        Verify that import_food's field_list includes all mutable fields from obj_dict.
        Every field set in obj_dict (except space_id) must be in field_list so that
        _is_obj_identical compares them and bulk_update writes them.
        """
        expected_fields = {
            'name',
            'plural_name',
            'supermarket_category_id',
            'fdc_id',
            'open_data_slug',
            'properties_food_unit_id',
        }

        # Instantiate importer with minimal data to inspect field_list
        request = MagicMock()
        request.space = MagicMock()
        importer = OpenDataImporter(request, {'food': {}}, update_existing=False)

        # We can't easily extract field_list without calling import_food,
        # so just verify the expected set is correct by checking the source
        import inspect
        source = inspect.getsource(importer.import_food)
        # Find the field_list assignment
        for line in source.split('\n'):
            if 'field_list' in line and '=' in line and '[' in line:
                # Extract field names from the list literal
                import ast
                start = line.index('[')
                end = line.index(']') + 1
                actual_fields = set(ast.literal_eval(line[start:end]))
                assert actual_fields == expected_fields, (
                    f"field_list mismatch.\n"
                    f"  Missing: {expected_fields - actual_fields}\n"
                    f"  Extra: {actual_fields - expected_fields}"
                )
                return

        pytest.fail("Could not find field_list assignment in import_food source")


@pytest.mark.django_db
class TestErrorHandlingGranularity:
    """
    Tests that update and create errors are handled per-item, not per-batch.
    A single collision should not kill the entire batch.
    """

    def test_batch_update_name_collision_falls_back_to_per_item(self, space_1):
        """
        Two foods renamed to the same name via update: one succeeds, one errors.
        The successful update should still be counted.
        """
        with scopes_disabled():
            Food.add_root(name='Cherry', open_data_slug='food-cherry', space=space_1)
            Food.add_root(name='Kers', open_data_slug='food-kers', space=space_1)
            # User-created food that will collide with the rename
            Food.add_root(name='Kirsche', space=space_1)

        # Import tries to rename food-cherry→Kirsche (collides) and food-kers→Kers (no change needed)
        # Actually: food-cherry→Kirsche collides, food-kers→KersenFruit succeeds
        update_data = _make_open_data(
            foods={
                'food-cherry': _food_entry('Kirsche'),  # collides with existing user food
                'food-kers': _food_entry('KersenFruit'),  # safe rename
            },
        )

        request = _make_request(space_1)
        importer = OpenDataImporter(request, update_data, update_existing=True)
        result = _import_with_scopes_disabled(importer, 'import_food')

        assert result.total_updated >= 1, "At least one update should succeed"
        assert result.total_errored >= 1, "The collision should be counted as an error"

        with scopes_disabled():
            # The non-colliding food should have been updated
            assert Food.objects.filter(space=space_1, name='KersenFruit').exists()
            # The colliding food should retain its original name
            assert Food.objects.filter(space=space_1, name='Cherry').exists()
            # The user-created food should be untouched
            assert Food.objects.filter(space=space_1, name='Kirsche').exists()

    def test_create_name_collision_counts_errors(self, space_1):
        """
        Creating a food whose name collides with an existing food should count
        as an error, not silently swallow the entire batch.
        """
        with scopes_disabled():
            Food.add_root(name='Tomato', space=space_1)

        create_data = _make_open_data(
            foods={
                'food-tomato': _food_entry('Tomato'),  # collides with existing
                'food-onion': _food_entry('Onion'),  # should succeed
            },
        )

        request = _make_request(space_1)
        importer = OpenDataImporter(request, create_data, update_existing=False)
        result = _import_with_scopes_disabled(importer, 'import_food')

        assert result.total_created >= 1, "Non-colliding food should be created"
        assert result.total_errored >= 1, "Colliding food should be counted as error"

        with scopes_disabled():
            assert Food.objects.filter(space=space_1, name='Onion').exists()
            assert Food.objects.filter(space=space_1, name='Tomato').count() == 1
