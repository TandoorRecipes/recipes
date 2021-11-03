import factory
from django_scopes import scopes_disabled
from faker import Factory as FakerFactory

faker = FakerFactory.create()


class SpaceFactory(factory.django.DjangoModelFactory):
    """Space factory."""
    name = factory.LazyAttribute(lambda x: faker.word())

    @classmethod
    def _create(cls, model_class, **kwargs):
        with scopes_disabled():
            return super()._create(model_class, **kwargs)

    class Meta:
        model = 'cookbook.Space'


class FoodFactory(factory.django.DjangoModelFactory):
    """Food factory."""
    name = factory.LazyAttribute(lambda x: faker.sentence(nb_words=3))
    description = factory.LazyAttribute(lambda x: faker.sentence(nb_words=10))
    space = factory.SubFactory(SpaceFactory)

    class Meta:
        model = 'cookbook.Food'
