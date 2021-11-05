
from decimal import Decimal

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
        factory.LazyAttribute(lambda x:  x.has_category),
        yes_declaration=factory.SubFactory(SupermarketCategoryFactory),
        no_declaration=None
    )
    recipe = factory.Maybe(
        factory.LazyAttribute(lambda x:  x.has_recipe),
        yes_declaration=factory.SubFactory('cookbook.tests.factories.RecipeFactory'),
        no_declaration=None
    )
    space = factory.SubFactory(SpaceFactory)

    class Params:
        has_category = False
        has_recipe = False

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
    amount = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=10))
    note = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Ingredient'


class MealTypeFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    order = 0
    # icon =
    color = factory.LazyAttribute(lambda x: faker.safe_hex_color())
    default = False
    created_by = factory.SubFactory(UserFactory)
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.MealType'


class MealPlanFactory(factory.django.DjangoModelFactory):
    recipe = factory.Maybe(
        factory.LazyAttribute(lambda x:  x.has_recipe),
        yes_declaration=factory.SubFactory('cookbook.tests.factories.RecipeFactory'),
        no_declaration=None
    )
    servings = factory.LazyAttribute(lambda x: Decimal(faker.random_int(min=1, max=1000)/100))
    title = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    created_by = factory.SubFactory(UserFactory)
    meal_type = factory.SubFactory(MealTypeFactory)
    note = factory.LazyAttribute(lambda x: faker.paragraph())
    date = factory.LazyAttribute(lambda x: faker.future_date())
    space = factory.SubFactory(SpaceFactory)

    class Params:
        has_recipe = False

    class Meta:
        model = 'cookbook.MealPlan'


class ShoppingListRecipeFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    recipe = factory.Maybe(
        factory.LazyAttribute(lambda x:  x.has_recipe),
        yes_declaration=factory.SubFactory('cookbook.tests.factories.RecipeFactory'),
        no_declaration=None
    )
    servings = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=10))
    mealplan = factory.SubFactory(MealPlanFactory)

    class Params:
        has_recipe = False

    class Meta:
        model = 'cookbook.ShoppingListRecipe'


class ShoppingListEntryFactory(factory.django.DjangoModelFactory):
    """ShoppingListEntry factory."""
    list_recipe = factory.Maybe(
        factory.LazyAttribute(lambda x:  x.has_mealplan),
        yes_declaration=factory.SubFactory(ShoppingListRecipeFactory),
        no_declaration=None
    )
    food = factory.SubFactory(FoodFactory)
    unit = factory.SubFactory(UnitFactory)
    ingredient = factory.SubFactory(IngredientFactory)
    amount = factory.LazyAttribute(lambda x: Decimal(faker.random_int(min=1, max=10))/100)
    order = 0
    checked = False
    created_by = factory.SubFactory(UserFactory)
    created_at = factory.LazyAttribute(lambda x: faker.past_date())
    completed_at = None
    delay_until = None
    space = factory.SubFactory(SpaceFactory)

    class Params:
        has_mealplan = False

    class Meta:
        model = 'cookbook.ShoppingListEntry'


class StepFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    # type = models.CharField(
    #     choices=((TEXT, _('Text')), (TIME, _('Time')), (FILE, _('File')), (RECIPE, _('Recipe')),),
    #     default=TEXT,
    #     max_length=16
    # )
    instruction = factory.LazyAttribute(lambda x: ''.join(faker.paragraphs(nb=5)))
    ingredients = factory.SubFactory(IngredientFactory)
    time = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=1000))
    order = 0
    # file = models.ForeignKey('UserFile', on_delete=models.PROTECT, null=True, blank=True)
    show_as_header = True
    step_recipe = factory.Maybe(
        factory.LazyAttribute(lambda x:  x.has_recipe),
        yes_declaration=factory.SubFactory('cookbook.tests.factories.RecipeFactory'),
        no_declaration=None
    )
    space = factory.SubFactory(SpaceFactory)

    class Params:
        has_recipe = False

    class Meta:
        model = 'cookbook.Step'


class RecipeFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=7))
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    servings = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=20))
    servings_text = factory.LazyAttribute(lambda x: faker.sentence(nb_words=1))
    # image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    # storage = models.ForeignKey(
    #     Storage, on_delete=models.PROTECT, blank=True, null=True
    # )
    # file_uid = models.CharField(max_length=256, default="", blank=True)
    # file_path = models.CharField(max_length=512, default="", blank=True)
    # link = models.CharField(max_length=512, null=True, blank=True)
    # cors_link = models.CharField(max_length=1024, null=True, blank=True)
    # keywords = factory.SubFactory(KeywordFactory)
    steps = factory.SubFactory(StepFactory)
    working_time = factory.LazyAttribute(lambda x: faker.random_int(min=0, max=360))
    waiting_time = factory.LazyAttribute(lambda x: faker.random_int(min=0, max=360))
    internal = False
    # nutrition = models.ForeignKey(
    #     NutritionInformation, blank=True, null=True, on_delete=models.CASCADE
    # )
    created_by = factory.SubFactory(UserFactory)
    created_at = factory.LazyAttribute(lambda x: faker.date_this_decade())
    # updated_at = models.DateTimeField(auto_now=True)
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Recipe'

    # this code will run immediately prior to creating the model object useful when you want a reverse relationship
    # log = factory.RelatedFactory(
    #     UserLogFactory,
    #     factory_related_name='user',
    #     action=models.UserLog.ACTION_CREATE,
    # )
