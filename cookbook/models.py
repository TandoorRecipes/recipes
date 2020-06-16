import re
import uuid
from annoying.fields import AutoOneToOneField
from django.contrib import auth
from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from django.db import models

from recipes.settings import COMMENT_PREF_DEFAULT


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

    PAGES = ((SEARCH, _('Search')), (PLAN, _('Meal-Plan')), (BOOKS, _('Books')),)

    # Search Style
    SMALL = 'SMALL'
    LARGE = 'LARGE'

    SEARCH_STYLE = ((SMALL, _('Small')), (LARGE, _('Large')),)

    user = AutoOneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    theme = models.CharField(choices=THEMES, max_length=128, default=FLATLY)
    nav_color = models.CharField(choices=COLORS, max_length=128, default=PRIMARY)
    default_unit = models.CharField(max_length=32, default='g')
    default_page = models.CharField(choices=PAGES, max_length=64, default=SEARCH)
    search_style = models.CharField(choices=SEARCH_STYLE, max_length=64, default=LARGE)
    show_recent = models.BooleanField(default=True)
    plan_share = models.ManyToManyField(User, blank=True, related_name='plan_share_default')
    ingredient_decimals = models.IntegerField(default=2)
    comments = models.BooleanField(default=COMMENT_PREF_DEFAULT)

    def __str__(self):
        return str(self.user)


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
    amount = models.DecimalField(default=0, decimal_places=16, max_digits=32)
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
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=16, blank=True, null=True)
    shared = models.ManyToManyField(User, blank=True, related_name='shared_with')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class RecipeBookEntry(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    book = models.ForeignKey(RecipeBook, on_delete=models.CASCADE)

    def __str__(self):
        return self.recipe.name


class MealType(models.Model):
    name = models.CharField(max_length=128)
    order = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class MealPlan(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=64, blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    shared = models.ManyToManyField(User, blank=True, related_name='plan_share')
    meal_type = models.ForeignKey(MealType, on_delete=models.CASCADE)
    note = models.TextField(blank=True)
    date = models.DateField()

    def get_label(self):
        if self.title:
            return self.title
        return str(self.recipe)

    def get_meal_name(self):
        return self.meal_type.name

    def __str__(self):
        return f'{self.get_label()} - {self.date} - {self.meal_type.name}'


class ShareLink(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4())
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class CookLog(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.IntegerField(null=True)
    servings = models.IntegerField(default=0)

    def __str__(self):
        return self.recipe.name


class ViewLog(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.recipe.name
