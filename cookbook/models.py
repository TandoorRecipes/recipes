import re

from django.contrib import auth
from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from django.db import models


def get_user_name(self):
    if not (name := f"{self.first_name} {self.last_name}") == " ":
        return name
    else:
        return self.username


auth.models.User.add_to_class('get_user_name', get_user_name)


def get_model_name(model):
    return ('_'.join(re.findall('[A-Z][^A-Z]*', model.__name__))).lower()


class UserPreference(models.Model):
    # Themes
    BOOTSTRAP = 'BOOTSTRAP'
    DARKLY = 'DARKLY'
    FLATLY = 'FLATLY'
    SUPERHERO = 'SUPERHERO'

    THEMES = ((BOOTSTRAP, 'Bootstrap'), (DARKLY, 'Darkly'), (FLATLY, 'Flatly'), (SUPERHERO, 'Superhero'))

    # Nav colors
    PRIMARY = 'PRIMARY'
    SECONDARY = 'SECONDARY'
    SUCCESS = 'SUCCESS'
    INFO = 'INFO'
    WARNING = 'WARNING'
    DANGER = 'DANGER'
    LIGHT = 'LIGHT'
    DARK = 'DARK'

    COLORS = ((PRIMARY, 'Primary'), (SECONDARY, 'Secondary'), (SUCCESS, 'Success'), (INFO, 'Info'), (WARNING, 'Warning'), (DANGER, 'Danger'), (LIGHT, 'Light'), (DARK, 'Dark'))

    # Default Page
    SEARCH = 'SEARCH'
    PLAN = 'PLAN'
    BOOKS = 'BOOKS'

    PAGES = ((SEARCH, _('Search')), (PLAN, _('Meal-Plan')), (BOOKS, _('Books')), )

    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    theme = models.CharField(choices=THEMES, max_length=128, default=FLATLY)
    nav_color = models.CharField(choices=COLORS, max_length=128, default=PRIMARY)
    default_unit = models.CharField(max_length=32, default='g')
    default_page = models.CharField(choices=PAGES, max_length=64, default=SEARCH)

    def __str__(self):
        return self.user


class Storage(models.Model):
    DROPBOX = 'DB'
    NEXTCLOUD = 'NEXTCLOUD'
    STORAGE_TYPES = ((DROPBOX, 'Dropbox'), (NEXTCLOUD, 'Nextcloud'))

    name = models.CharField(max_length=128)
    method = models.CharField(choices=STORAGE_TYPES, max_length=128, default=DROPBOX)
    username = models.CharField(max_length=128, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)
    token = models.CharField(max_length=512, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)

    def __str__(self):
        return self.name


class Sync(models.Model):
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT)
    path = models.CharField(max_length=512, default="")
    active = models.BooleanField(default=True)
    last_checked = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.path


class SyncLog(models.Model):
    sync = models.ForeignKey(Sync, on_delete=models.CASCADE)
    status = models.CharField(max_length=32)
    msg = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.created_at}:{self.sync} - {self.status}"


class Keyword(models.Model):
    name = models.CharField(max_length=64, unique=True)
    icon = models.CharField(max_length=16, blank=True, null=True)
    description = models.TextField(default="", blank=True)
    created_by = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.icon:
            return f"{self.icon} {self.name}"
        else:
            return f"{self.name}"


class Recipe(models.Model):
    name = models.CharField(max_length=128)
    instructions = models.TextField(blank=True)
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT, blank=True, null=True)
    file_uid = models.CharField(max_length=256, default="")
    file_path = models.CharField(max_length=512, default="")
    link = models.CharField(max_length=512, null=True, blank=True)
    cors_link = models.CharField(max_length=1024, null=True, blank=True)
    keywords = models.ManyToManyField(Keyword, blank=True)
    working_time = models.IntegerField(default=0)
    waiting_time = models.IntegerField(default=0)
    internal = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def all_tags(self):
        return ' '.join([(str(x)) for x in self.keywords.all()])


class Unit(models.Model):
    name = models.CharField(unique=True, max_length=128)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    name = models.CharField(unique=True, max_length=128)
    recipe = models.ForeignKey(Recipe, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.name


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)
    amount = models.DecimalField(default=0, decimal_places=2, max_digits=16)
    note = models.CharField(max_length=64, null=True, blank=True)

    def __str__(self):
        return str(self.amount) + ' ' + str(self.unit) + ' ' + str(self.ingredient)


class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    text = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text


class RecipeImport(models.Model):
    name = models.CharField(max_length=128)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT)
    file_uid = models.CharField(max_length=256, default="")
    file_path = models.CharField(max_length=512, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RecipeBook(models.Model):
    name = models.CharField(max_length=128)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class RecipeBookEntry(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    book = models.ForeignKey(RecipeBook, on_delete=models.CASCADE)

    def __str__(self):
        return self.recipe.name


class MealPlan(models.Model):
    BREAKFAST = 'BREAKFAST'
    LUNCH = 'LUNCH'
    DINNER = 'DINNER'
    OTHER = 'OTHER'
    MEAL_TYPES = ((BREAKFAST, _('Breakfast')), (LUNCH, _('Lunch')), (DINNER, _('Dinner')), (OTHER, _('Other')),)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    meal = models.CharField(choices=MEAL_TYPES, max_length=128, default=BREAKFAST)
    note = models.TextField(blank=True)
    date = models.DateField()

    def __str__(self):
        return self.meal + ' (' + str(self.date) + ') ' + str(self.recipe)
