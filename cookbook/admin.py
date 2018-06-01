from django.contrib import admin
from .models import *


admin.site.register(Recipe)
admin.site.register(Keyword)
admin.site.register(Category)

admin.site.register(Sync)
admin.site.register(SyncLog)
admin.site.register(RecipeImport)
admin.site.register(Storage)
