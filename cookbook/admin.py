from django.contrib import admin
from .models import *


class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'theme', 'nav_color')

    @staticmethod
    def name(obj):
        return obj.user.get_user_name()


admin.site.register(UserPreference, UserPreferenceAdmin)


class StorageAdmin(admin.ModelAdmin):
    list_display = ('name', 'method')


admin.site.register(Storage, StorageAdmin)


class SyncAdmin(admin.ModelAdmin):
    list_display = ('storage', 'path', 'active', 'last_checked')


admin.site.register(Sync, SyncAdmin)


class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('sync', 'status', 'msg', 'created_at')


admin.site.register(SyncLog, SyncLogAdmin)

admin.site.register(Keyword)


class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'internal', 'created_by', 'storage')

    @staticmethod
    def created_by(obj):
        return obj.created_by.get_user_name()


admin.site.register(Recipe, RecipeAdmin)

admin.site.register(Unit)
admin.site.register(Ingredient)


class RecipeIngredientAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'ingredient', 'amount', 'unit')


admin.site.register(RecipeIngredient, RecipeIngredientAdmin)


class CommentAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'name', 'created_at')

    @staticmethod
    def name(obj):
        return obj.created_by.get_user_name()


admin.site.register(Comment, CommentAdmin)


class RecipeImportAdmin(admin.ModelAdmin):
    list_display = ('name', 'storage', 'file_path')


admin.site.register(RecipeImport, RecipeImportAdmin)


class RecipeBookAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_name')

    @staticmethod
    def user_name(obj):
        return obj.user.get_user_name()


admin.site.register(RecipeBook, RecipeBookAdmin)


class RecipeBookEntryAdmin(admin.ModelAdmin):
    list_display = ('book', 'recipe')


admin.site.register(RecipeBookEntry, RecipeBookEntryAdmin)


class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'meal', 'date')

    @staticmethod
    def user(obj):
        return obj.user.get_user_name()


admin.site.register(MealPlan, MealPlanAdmin)
