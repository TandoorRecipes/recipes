from django.conf import settings
from django.contrib import admin
from django.contrib.postgres.search import SearchVector
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User, Group
from django_scopes import scopes_disabled
from django.utils import translation

from .models import (Comment, CookLog, Food, Ingredient, InviteLink, Keyword,
                     MealPlan, MealType, NutritionInformation, Recipe,
                     RecipeBook, RecipeBookEntry, RecipeImport, ShareLink,
                     ShoppingList, ShoppingListEntry, ShoppingListRecipe,
                     Space, Step, Storage, Sync, SyncLog, Unit, UserPreference,
                     ViewLog, Supermarket, SupermarketCategory, SupermarketCategoryRelation,
                     ImportLog, TelegramBot, BookmarkletImport, UserFile)

from cookbook.managers import DICTIONARY


class CustomUserAdmin(UserAdmin):
    def has_add_permission(self, request, obj=None):
        return False


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

admin.site.unregister(Group)


class SpaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'max_recipes', 'max_users', 'max_file_storage_mb', 'allow_sharing')
    search_fields = ('name', 'created_by__username')
    list_filter = ('max_recipes', 'max_users', 'max_file_storage_mb', 'allow_sharing')
    date_hierarchy = 'created_at'


admin.site.register(Space, SpaceAdmin)


class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'space', 'theme', 'nav_color', 'default_page', 'search_style',)  # TODO add new fields
    search_fields = ('user__username', 'space__name')
    list_filter = ('theme', 'nav_color', 'default_page', 'search_style')
    date_hierarchy = 'created_at'

    @staticmethod
    def name(obj):
        return obj.user.get_user_name()


admin.site.register(UserPreference, UserPreferenceAdmin)


class StorageAdmin(admin.ModelAdmin):
    list_display = ('name', 'method')
    search_fields = ('name',)


admin.site.register(Storage, StorageAdmin)


class SyncAdmin(admin.ModelAdmin):
    list_display = ('storage', 'path', 'active', 'last_checked')
    search_fields = ('storage__name', 'path')


admin.site.register(Sync, SyncAdmin)


class SupermarketCategoryInline(admin.TabularInline):
    model = SupermarketCategoryRelation


class SupermarketAdmin(admin.ModelAdmin):
    inlines = (SupermarketCategoryInline,)


admin.site.register(Supermarket, SupermarketAdmin)
admin.site.register(SupermarketCategory)


class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('sync', 'status', 'msg', 'created_at')


admin.site.register(SyncLog, SyncLogAdmin)


@admin.action(description='Temporarily ENABLE sorting on Foods and Keywords.')
def enable_tree_sorting(modeladmin, request, queryset):
    Food.node_order_by = ['name']
    Keyword.node_order_by = ['name']
    with scopes_disabled():
        Food.fix_tree(fix_paths=True)
        Keyword.fix_tree(fix_paths=True)


@admin.action(description='Temporarily DISABLE sorting on Foods and Keywords.')
def disable_tree_sorting(modeladmin, request, queryset):
    Food.node_order_by = []
    Keyword.node_order_by = []


@admin.action(description='Fix problems and sort tree by name')
def sort_tree(modeladmin, request, queryset):
    orginal_value = modeladmin.model.node_order_by[:]
    modeladmin.model.node_order_by = ['name']
    with scopes_disabled():
        modeladmin.model.fix_tree(fix_paths=True)
    modeladmin.model.node_order_by = orginal_value


class KeywordAdmin(TreeAdmin):
    form = movenodeform_factory(Keyword)
    ordering = ('space', 'path',)
    actions = [sort_tree, enable_tree_sorting, disable_tree_sorting]


admin.site.register(Keyword, KeywordAdmin)


class StepAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'order')
    search_fields = ('name', 'type')


admin.site.register(Step, StepAdmin)


@admin.action(description='Rebuild index for selected recipes')
def rebuild_index(modeladmin, request, queryset):
    language = DICTIONARY.get(translation.get_language(), 'simple')
    with scopes_disabled():
        Recipe.objects.all().update(
            name_search_vector=SearchVector('name__unaccent', weight='A', config=language),
            desc_search_vector=SearchVector('description__unaccent', weight='B', config=language)
        )
        Step.objects.all().update(search_vector=SearchVector('instruction__unaccent', weight='B', config=language))


class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'internal', 'created_by', 'storage')
    search_fields = ('name', 'created_by__username')
    list_filter = ('internal',)
    date_hierarchy = 'created_at'

    @staticmethod
    def created_by(obj):
        return obj.created_by.get_user_name()

    if settings.DATABASES['default']['ENGINE'] in ['django.db.backends.postgresql_psycopg2', 'django.db.backends.postgresql']:
        actions = [rebuild_index]


admin.site.register(Recipe, RecipeAdmin)

admin.site.register(Unit)


class FoodAdmin(TreeAdmin):
    form = movenodeform_factory(Keyword)
    ordering = ('space', 'path',)
    actions = [sort_tree, enable_tree_sorting, disable_tree_sorting]


admin.site.register(Food, FoodAdmin)


class IngredientAdmin(admin.ModelAdmin):
    list_display = ('food', 'amount', 'unit')
    search_fields = ('food__name', 'unit__name')


admin.site.register(Ingredient, IngredientAdmin)


class CommentAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'name', 'created_at')
    search_fields = ('text', 'user__username')
    date_hierarchy = 'created_at'

    @staticmethod
    def name(obj):
        return obj.created_by.get_user_name()


admin.site.register(Comment, CommentAdmin)


class RecipeImportAdmin(admin.ModelAdmin):
    list_display = ('name', 'storage', 'file_path')


admin.site.register(RecipeImport, RecipeImportAdmin)


class RecipeBookAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_name')
    search_fields = ('name', 'created_by__username')

    @staticmethod
    def user_name(obj):
        return obj.created_by.get_user_name()


admin.site.register(RecipeBook, RecipeBookAdmin)


class RecipeBookEntryAdmin(admin.ModelAdmin):
    list_display = ('book', 'recipe')


admin.site.register(RecipeBookEntry, RecipeBookEntryAdmin)


class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'meal_type', 'date')

    @staticmethod
    def user(obj):
        return obj.created_by.get_user_name()


admin.site.register(MealPlan, MealPlanAdmin)


class MealTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'order')
    search_fields = ('name', 'created_by__username')


admin.site.register(MealType, MealTypeAdmin)


class ViewLogAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'created_by', 'created_at')


admin.site.register(ViewLog, ViewLogAdmin)


class InviteLinkAdmin(admin.ModelAdmin):
    list_display = (
        'group', 'valid_until',
        'created_by', 'created_at', 'used_by'
    )


admin.site.register(InviteLink, InviteLinkAdmin)


class CookLogAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'created_by', 'created_at', 'rating', 'servings')


admin.site.register(CookLog, CookLogAdmin)


class ShoppingListRecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipe', 'servings')


admin.site.register(ShoppingListRecipe, ShoppingListRecipeAdmin)


class ShoppingListEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'food', 'unit', 'list_recipe', 'checked')


admin.site.register(ShoppingListEntry, ShoppingListEntryAdmin)


class ShoppingListAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_by', 'created_at')


admin.site.register(ShoppingList, ShoppingListAdmin)


class ShareLinkAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'created_by', 'uuid', 'created_at',)


admin.site.register(ShareLink, ShareLinkAdmin)


class NutritionInformationAdmin(admin.ModelAdmin):
    list_display = ('id',)


admin.site.register(NutritionInformation, NutritionInformationAdmin)


class ImportLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'running', 'created_by', 'created_at',)


admin.site.register(ImportLog, ImportLogAdmin)


class TelegramBotAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by',)


admin.site.register(TelegramBot, TelegramBotAdmin)


class BookmarkletImportAdmin(admin.ModelAdmin):
    list_display = ('id', 'url', 'created_by', 'created_at',)


admin.site.register(BookmarkletImport, BookmarkletImportAdmin)


class UserFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'file_size_kb', 'created_at',)


admin.site.register(UserFile, UserFileAdmin)
