
import inspect
from datetime import date
from decimal import Decimal

import factory
import pytest
from django.contrib.auth.models import Group, User
from django_scopes import scopes_disabled
from faker import Factory as FakerFactory
from pytest_factoryboy import register

from cookbook.models import UserSpace

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


@register
class SpaceFactory(factory.django.DjangoModelFactory):
    """Space factory."""
    name = factory.LazyAttribute(lambda x: faker.word())

    @classmethod
    def _create(cls, model_class, **kwargs):
        with scopes_disabled():
            return super()._create(model_class, **kwargs)

    class Meta:
        model = 'cookbook.Space'


@register
class UserFactory(factory.django.DjangoModelFactory):

    """User factory."""
    username = factory.LazyAttribute(
        lambda x: faker.simple_profile()['username'])
    first_name = factory.LazyAttribute(lambda x: faker.first_name())
    last_name = factory.LazyAttribute(lambda x: faker.last_name())
    email = factory.LazyAttribute(lambda x: faker.email())
    space = factory.SubFactory(SpaceFactory)

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            us = UserSpace.objects.create(
                space=self.space, user=self, active=True)
            us.groups.add(Group.objects.get(name=extracted))

    @factory.post_generation
    def userpreference(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for prefs in extracted:
                # intentionally break so it can be debugged later
                self.userpreference[prefs] = extracted[prefs] / 0

    class Meta:
        model = User
        django_get_or_create = ('username', 'space',)


@register
class SupermarketCategoryFactory(factory.django.DjangoModelFactory):
    """SupermarketCategory factory."""
    name = factory.LazyAttribute(lambda x: faker.word())
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.SupermarketCategory'
        django_get_or_create = ('name', 'space',)


@register
class FoodFactory(factory.django.DjangoModelFactory):
    """Food factory."""
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10)[:128])
    plural_name = factory.LazyAttribute(
        lambda x: faker.sentence(nb_words=3, variable_nb_words=False))
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    supermarket_category = factory.Maybe(
        factory.LazyAttribute(lambda x: x.has_category),
        yes_declaration=factory.SubFactory(
            SupermarketCategoryFactory, space=factory.SelfAttribute('..space')),
        no_declaration=None
    )
    recipe = factory.Maybe(
        factory.LazyAttribute(lambda x: x.has_recipe),
        yes_declaration=factory.SubFactory(
            'cookbook.tests.factories.RecipeFactory', space=factory.SelfAttribute('..space')),
        no_declaration=None
    )
    path = factory.LazyAttribute(lambda x: faker.numerify(text='%###'))
    space = factory.SubFactory(SpaceFactory)

    @factory.post_generation
    def users_onhand(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for user in extracted:
                self.onhand_users.add(user)

    class Params:
        has_category = False
        has_recipe = False

    class Meta:
        model = 'cookbook.Food'
        django_get_or_create = ('name', 'plural_name', 'path', 'space',)


@register
class RecipeBookFactory(factory.django.DjangoModelFactory):
    """RecipeBook factory."""
    name = factory.LazyAttribute(lambda x: faker.sentence(
        nb_words=3, variable_nb_words=False))
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    # shared = factory.SubFactory(UserFactory, space=factory.SelfAttribute('..space'))
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    filter = None
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.RecipeBook'
        django_get_or_create = ('name', 'space',)


@register
class RecipeBookEntryFactory(factory.django.DjangoModelFactory):
    """RecipeBookEntry factory."""
    book = factory.SubFactory(
        RecipeBookFactory, space=factory.SelfAttribute('..recipe.space'))
    recipe = None

    class Meta:
        model = 'cookbook.RecipeBookEntry'
        django_get_or_create = ('book', 'recipe',)


@register
class UnitFactory(factory.django.DjangoModelFactory):
    """Unit factory."""
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10)[:128])
    plural_name = factory.LazyAttribute(lambda x: faker.word())
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Unit'
        django_get_or_create = ('name', 'plural_name', 'space',)


@register
class KeywordFactory(factory.django.DjangoModelFactory):
    """Keyword factory."""
    name = factory.LazyAttribute(lambda x: faker.sentence(
        nb_words=2, variable_nb_words=False))
    # icon = models.CharField(max_length=16, blank=True, null=True)
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    space = factory.SubFactory(SpaceFactory)
    num = None  # used on upstream factories to generate num keywords

    class Params:
        num = None

    class Meta:
        model = 'cookbook.Keyword'
        django_get_or_create = ('name', 'space')
        exclude = ('num')


@register
class IngredientFactory(factory.django.DjangoModelFactory):
    """Ingredient factory."""
    food = factory.SubFactory(
        FoodFactory, space=factory.SelfAttribute('..space'))
    unit = factory.SubFactory(
        UnitFactory, space=factory.SelfAttribute('..space'))
    amount = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=10))
    note = factory.LazyAttribute(lambda x: faker.sentence(nb_words=8))
    is_header = False
    no_amount = False
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Ingredient'


@register
class MealTypeFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    order = 0
    # icon =
    color = factory.LazyAttribute(lambda x: faker.safe_hex_color())
    default = False
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.MealType'


@register
class MealPlanFactory(factory.django.DjangoModelFactory):
    recipe = factory.Maybe(
        factory.LazyAttribute(lambda x: x.has_recipe),
        yes_declaration=factory.SubFactory(
            'cookbook.tests.factories.RecipeFactory', space=factory.SelfAttribute('..space')),
        no_declaration=None
    )
    servings = factory.LazyAttribute(
        lambda x: Decimal(faker.random_int(min=1, max=1000) / 100))
    title = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    meal_type = factory.SubFactory(
        MealTypeFactory, space=factory.SelfAttribute('..space'))
    note = factory.LazyAttribute(lambda x: faker.paragraph())
    from_date = factory.LazyAttribute(lambda x: faker.future_date())
    to_date = factory.LazyAttribute(lambda x: faker.future_date())
    space = factory.SubFactory(SpaceFactory)

    class Params:
        has_recipe = True

    class Meta:
        model = 'cookbook.MealPlan'


@register
class ShoppingListRecipeFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    recipe = factory.Maybe(
        factory.LazyAttribute(lambda x: x.has_recipe),
        yes_declaration=factory.SubFactory(
            'cookbook.tests.factories.RecipeFactory', space=factory.SelfAttribute('..space')),
        no_declaration=None
    )
    servings = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=10))
    mealplan = factory.SubFactory(
        MealPlanFactory, space=factory.SelfAttribute('..space'))
    space = factory.SubFactory(SpaceFactory)

    class Params:
        has_recipe = False

    class Meta:
        model = 'cookbook.ShoppingListRecipe'


@register
class ShoppingListEntryFactory(factory.django.DjangoModelFactory):
    """ShoppingListEntry factory."""

    list_recipe = factory.Maybe(
        factory.LazyAttribute(lambda x: x.has_mealplan),
        yes_declaration=factory.SubFactory(
            ShoppingListRecipeFactory, space=factory.SelfAttribute('..space')),
        no_declaration=None
    )
    food = factory.SubFactory(
        FoodFactory, space=factory.SelfAttribute('..space'))
    unit = factory.SubFactory(
        UnitFactory, space=factory.SelfAttribute('..space'))
    # # ingredient = factory.SubFactory(IngredientFactory)
    amount = factory.LazyAttribute(
        lambda x: Decimal(faker.random_int(min=1, max=100)) / 10)
    order = factory.Sequence(int)
    checked = False
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    created_at = factory.LazyAttribute(lambda x: faker.past_date())
    completed_at = None
    delay_until = None
    space = factory.SubFactory(SpaceFactory)

    @classmethod
    # override create to prevent auto_add_now from changing the created_at date
    def _create(cls, target_class, *args, **kwargs):
        created_at = kwargs.pop('created_at', None)
        obj = super(ShoppingListEntryFactory, cls)._create(
            target_class, *args, **kwargs)
        if created_at is not None:
            obj.created_at = created_at
            obj.save()
            return obj

    class Params:
        has_mealplan = False

    class Meta:
        model = 'cookbook.ShoppingListEntry'


@register
class StepFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=5))
    instruction = factory.LazyAttribute(
        lambda x: ''.join(faker.paragraphs(nb=5)))
    # TODO add optional recipe food, make dependent on recipe, make number of recipes a Params
    ingredients__count = 10  # default number of ingredients to add
    ingredients__header = 0
    time = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=1000))
    order = factory.Sequence(lambda x: x)
    # file = models.ForeignKey('UserFile', on_delete=models.PROTECT, null=True, blank=True)
    show_as_header = True
    # TODO: need to update to fetch from User's preferences
    show_ingredients_table = True
    step_recipe__has_recipe = False
    ingredients__food_recipe_count = 0
    space = factory.SubFactory(SpaceFactory)

    @factory.post_generation
    def step_recipe(self, create, extracted, **kwargs):
        if not create:
            return
        if kwargs.get('has_recipe', False):
            self.step_recipe = RecipeFactory(space=self.space)
        elif extracted:
            self.step_recipe = extracted

    @factory.post_generation
    def ingredients(self, create, extracted, **kwargs):
        if not create:
            return

        num_ing = kwargs.get('count', 0)
        num_food_recipe = kwargs.get('food_recipe_count', 0)
        if num_ing > 0:
            for i in range(num_ing):
                if num_food_recipe > 0:
                    has_recipe = True
                    num_food_recipe = num_food_recipe - 1
                else:
                    has_recipe = False
                self.ingredients.add(IngredientFactory(
                    space=self.space, food__has_recipe=has_recipe))
        num_header = kwargs.get('header', 0)
        if num_header > 0:
            for i in range(num_header):
                self.ingredients.add(IngredientFactory(
                    food=None, unit=None, amount=0, is_header=True, space=self.space))
        elif extracted:
            for ing in extracted:
                self.ingredients.add(ing)

    class Meta:
        model = 'cookbook.Step'


@register
class RecipeFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=7))
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    servings = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=20))
    # TODO generate list of expected servings text that can be iterated through
    servings_text = factory.LazyAttribute(lambda x: faker.sentence(nb_words=1))
    keywords__count = 5  # default number of keywords to generate
    steps__count = 1  # default number of steps to create
    steps__recipe_count = 0  # default number of step recipes to create
    # by default, don't create food recipes, to override {'steps__food_recipe_count': {'step': 0, 'count': 1}}
    steps__food_recipe_count = {}
    working_time = factory.LazyAttribute(
        lambda x: faker.random_int(min=0, max=360))
    waiting_time = factory.LazyAttribute(
        lambda x: faker.random_int(min=0, max=360))
    internal = False
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    created_at = factory.LazyAttribute(lambda x: faker.date_between_dates(
        date_start=date(2000, 1, 1), date_end=date(2020, 12, 31)))
    space = factory.SubFactory(SpaceFactory)

    @classmethod
    # override create to prevent auto_add_now from changing the created_at date
    def _create(cls, target_class, *args, **kwargs):
        created_at = kwargs.pop('created_at', None)
        # updated_at = kwargs.pop('updated_at', None)
        obj = super(RecipeFactory, cls)._create(target_class, *args, **kwargs)
        if created_at is not None:
            obj.created_at = created_at
            obj.save()
            return obj

    @factory.post_generation
    def keywords(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        num_kw = kwargs.get('count', 0)
        if num_kw > 0:
            for i in range(num_kw):
                self.keywords.add(KeywordFactory(space=self.space))
        elif extracted:
            for kw in extracted:
                self.keywords.add(kw)

    @factory.post_generation
    def steps(self, create, extracted, **kwargs):
        if not create:
            return

        food_recipe_count = kwargs.get('food_recipe_count', {})
        num_steps = kwargs.get('count', 0)
        num_recipe_steps = kwargs.get('recipe_count', 0)
        num_ing_headers = kwargs.get('ingredients__header', 0)
        if num_steps > 0:
            for i in range(num_steps):
                ing_recipe_count = 0
                if food_recipe_count.get('step', None) == i:
                    ing_recipe_count = food_recipe_count.get('count', 0)
                self.steps.add(StepFactory(
                    space=self.space, ingredients__food_recipe_count=ing_recipe_count, ingredients__header=num_ing_headers))
                num_ing_headers + - 1
        if num_recipe_steps > 0:
            for j in range(num_recipe_steps):
                self.steps.add(StepFactory(
                    space=self.space, step_recipe__has_recipe=True, ingredients__count=0))
        if extracted and (num_steps + num_recipe_steps == 0):
            for step in extracted:
                self.steps.add(step)

    class Meta:
        model = 'cookbook.Recipe'


@register
class CookLogFactory(factory.django.DjangoModelFactory):
    """CookLog factory."""
    recipe = factory.SubFactory(
        RecipeFactory, space=factory.SelfAttribute('..space'))
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    created_at = factory.LazyAttribute(lambda x: faker.date_this_decade())
    rating = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=5))
    servings = factory.LazyAttribute(lambda x: faker.random_int(min=1, max=32))
    space = factory.SubFactory(SpaceFactory)

    @classmethod
    # override create to prevent auto_add_now from changing the created_at date
    def _create(cls, target_class, *args, **kwargs):
        created_at = kwargs.pop('created_at', None)
        obj = super(CookLogFactory, cls)._create(target_class, *args, **kwargs)
        if created_at is not None:
            obj.created_at = created_at
            obj.save()
            return obj

    class Meta:
        model = 'cookbook.CookLog'


@register
class ViewLogFactory(factory.django.DjangoModelFactory):
    """ViewLog factory."""
    recipe = factory.SubFactory(
        RecipeFactory, space=factory.SelfAttribute('..space'))
    created_by = factory.SubFactory(
        UserFactory, space=factory.SelfAttribute('..space'))
    created_at = factory.LazyAttribute(
        lambda x: faker.past_datetime(start_date='-365d'))
    space = factory.SubFactory(SpaceFactory)

    @classmethod
    # override create to prevent auto_add_now from changing the created_at date
    def _create(cls, target_class, *args, **kwargs):
        created_at = kwargs.pop('created_at', None)
        obj = super(ViewLogFactory, cls)._create(target_class, *args, **kwargs)
        if created_at is not None:
            obj.created_at = created_at
            obj.save()
            return obj

    class Meta:
        model = 'cookbook.ViewLog'
