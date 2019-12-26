from io import BytesIO

from PIL import Image
from django.contrib.auth.models import User
from django.core.files import File
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


class Keyword(models.Model):
    name = models.CharField(max_length=64, unique=True)
    icon = models.CharField(max_length=1, blank=True, null=True)
    description = models.TextField(default="", blank=True)
    created_by = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{0} {1}".format(self.icon, self.name)


class Recipe(models.Model):
    name = models.CharField(max_length=128)
    instructions = models.TextField(blank=True)
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    storage = models.ForeignKey(Storage, on_delete=models.PROTECT, blank=True, null=True)
    file_uid = models.CharField(max_length=256, default="")
    file_path = models.CharField(max_length=512, default="")
    link = models.CharField(max_length=512, default="")
    keywords = models.ManyToManyField(Keyword, blank=True)
    working_time = models.IntegerField(default=0)
    waiting_time = models.IntegerField(default=0)
    internal = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.image:
            img = Image.open(self.image)

            basewidth = 720
            wpercent = (basewidth / float(img.size[0]))
            hsize = int((float(img.size[1]) * float(wpercent)))
            img = img.resize((basewidth, hsize), Image.ANTIALIAS)

            im_io = BytesIO()
            img.save(im_io, 'JPEG', quality=70)
            self.image = File(im_io, name=(str(self.pk)+'.jpeg'))
        super().save(*args, **kwargs)

    @property
    def all_tags(self):
        return ' '.join([(x.icon + x.name) for x in self.keywords.all()])


class RecipeIngredients(models.Model):
    name = models.CharField(max_length=128)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    unit = models.CharField(max_length=128)
    amount = models.DecimalField(default=0, decimal_places=2, max_digits=16)


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
