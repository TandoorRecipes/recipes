import factory
import pytest
from django.contrib import auth
from django.contrib.auth.models import User
from django_scopes import scopes_disabled
from faker import Factory as FakerFactory

faker = FakerFactory.create()


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass


@pytest.hookimpl(hookwrapper=True)
def pytest_fixture_setup(fixturedef, request):
    if inspect.isgeneratorfunction(fixturedef.func):
        yield
    else:
        with scopes_disabled():
            yield


class SpaceFactory(factory.django.DjangoModelFactory):
    """Space factory."""
    name = factory.LazyAttribute(lambda x: faker.word())

    @classmethod
    def _create(cls, model_class, **kwargs):
        with scopes_disabled():
            return super()._create(model_class, **kwargs)

    class Meta:
        model = 'cookbook.Space'


class UserFactory(factory.django.DjangoModelFactory):
    """User factory."""
    username = factory.LazyAttribute(lambda x: faker.word())
    first_name = factory.LazyAttribute(lambda x: faker.first_name())
    last_name = factory.LazyAttribute(lambda x: faker.last_name())
    email = factory.LazyAttribute(lambda x: faker.email())
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = User


class SupermarketCategoryFactory(factory.django.DjangoModelFactory):
    """SupermarketCategory factory."""
    name = factory.LazyAttribute(lambda x: faker.word())
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.SupermarketCategory'


# @factory.django.mute_signals(post_save)
class FoodFactory(factory.django.DjangoModelFactory):
    """Food factory."""
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=3))
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    supermarket_category = factory.Maybe(
        factory.LazyAttribute(
            lambda x:
            x.add_categories),
        yes_declaration=factory.SubFactory(SupermarketCategoryFactory),
        no_declaration=None
    )
    space = factory.SubFactory(SpaceFactory)

    # this code will run immediately prior to creating the model object useful when you want a reverse relationship
    # log = factory.RelatedFactory(
    #     UserLogFactory,
    #     factory_related_name='user',
    #     action=models.UserLog.ACTION_CREATE,
    # )

    class Params:
        add_categories = False

    class Meta:
        model = 'cookbook.Food'


class UnitFactory(factory.django.DjangoModelFactory):
    """Unit factory."""
    name = factory.LazyAttribute(lambda x: faker.word())
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Unit'


class IngredientFactory(factory.django.DjangoModelFactory):
    """Ingredient factory."""
    food = factory.SubFactory(FoodFactory)
    unit = factory.SubFactory(UnitFactory)
    amount = 1
    note = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Ingredient'


class ShoppingListEntryFactory(factory.django.DjangoModelFactory):
    """ShoppingListEntry factory."""
    # list_recipe = models.ForeignKey(ShoppingListRecipe, on_delete=models.CASCADE, null=True, blank=True, related_name='entries')
    food = factory.SubFactory(FoodFactory)
    unit = factory.SubFactory(UnitFactory)
    ingredient = factory.SubFactory(IngredientFactory)
    amount = 1
    order = 0
    checked = False
    created_by = factory.SubFactory(UserFactory)
    # created_at = models.DateTimeField(auto_now_add=True)
    # completed_at = models.DateTimeField(null=True, blank=True)
    # delay_until = models.DateTimeField(null=True, blank=True)
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.ShoppingListEntry'
