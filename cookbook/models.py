from django.contrib.auth.models import User
from django.db import models


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


class Keyword(models.Model):
    name = models.CharField(max_length=64, unique=True)
    icon = models.CharField(max_length=1, blank=True, null=True)
    description = models.TextField(default="", blank=True)
    created_by = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{0} {1}".format(self.icon, self.name)


class Ingredients(models.Model):
    name = models.CharField(max_length=128)


class Recipe(models.Model):
    name = models.CharField(max_length=128)
    instructions = models.TextField(blank=True)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT, blank=True, null=True)
    file_uid = models.CharField(max_length=256, default="")
    file_path = models.CharField(max_length=512, default="")
    link = models.CharField(max_length=512, default="")
    keywords = models.ManyToManyField(Keyword, blank=True)
    created_by = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def all_tags(self):
        return ' '.join([(x.icon + x.name) for x in self.keywords.all()])


class RecipeIngredients(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    unit = models.CharField(max_length=128)
    amount = models.DecimalField(default=0, decimal_places=2, max_digits=16)
    ingredient = models.ForeignKey(Ingredients, models.PROTECT)


class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    text = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class RecipeImport(models.Model):
    name = models.CharField(max_length=128)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT)
    file_uid = models.CharField(max_length=256, default="")
    file_path = models.CharField(max_length=512, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
