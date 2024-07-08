from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group, User
from django.contrib.postgres.search import SearchVector
from django.utils import translation
from django_scopes import scopes_disabled
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory

from cookbook.managers import DICTIONARY

from .models import (BookmarkletImport, Comment, CookLog, Food, ImportLog, Ingredient, InviteLink,
                     Keyword, MealPlan, MealType, NutritionInformation, Property, PropertyType,
                     Recipe, RecipeBook, RecipeBookEntry, RecipeImport, SearchPreference, ShareLink,
                     ShoppingListEntry, ShoppingListRecipe, Space, Step, Storage,
                     Supermarket, SupermarketCategory, SupermarketCategoryRelation, Sync, SyncLog,
                     TelegramBot, Unit, UnitConversion, UserFile, UserPreference, UserSpace,
                     ViewLog, ConnectorConfig)


class CustomUserAdmin(UserAdmin):
    def has_add_permission(self, request, obj=None):
        return False


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

admin.site.unregister(Group)


@admin.action(description='Delete all data from a space')
def delete_space_action(modeladmin, request, queryset):
    for space in queryset:
        space.safe_delete()


class SpaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'max_recipes', 'max_users', 'max_file_storage_mb', 'allow_sharing')
    search_fields = ('name', 'created_by__username')
    autocomplete_fields = ('created_by',)
    filter_horizontal = ('food_inherit',)
    list_filter = ('max_recipes', 'max_users', 'max_file_storage_mb', 'allow_sharing')
    date_hierarchy = 'created_at'
    actions = [delete_space_action]


admin.site.register(Space, SpaceAdmin)


class UserSpaceAdmin(admin.ModelAdmin):
    list_display = ('user', 'space',)
    search_fields = ('user__username', 'space__name',)
    filter_horizontal = ('groups',)
    autocomplete_fields = ('user', 'space',)


admin.site.register(UserSpace, UserSpaceAdmin)


class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'theme', 'default_page')
    search_fields = ('user__username',)
    list_filter = ('theme', 'default_page',)
    date_hierarchy = 'created_at'
    filter_horizontal = ('plan_share', 'shopping_share',)

    @staticmethod
    def name(obj):
        return obj.user.get_user_display_name()


admin.site.register(UserPreference, UserPreferenceAdmin)


class SearchPreferenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'search', 'trigram_threshold',)
    search_fields = ('user__username',)
    list_filter = ('search',)

    @staticmethod
    def name(obj):
        return obj.user.get_user_display_name()


admin.site.register(SearchPreference, SearchPreferenceAdmin)


class StorageAdmin(admin.ModelAdmin):
    list_display = ('name', 'method')
    search_fields = ('name',)


admin.site.register(Storage, StorageAdmin)


class ConnectorConfigAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'enabled', 'url')
    search_fields = ('name', 'url')


admin.site.register(ConnectorConfig, ConnectorConfigAdmin)


class SyncAdmin(admin.ModelAdmin):
    list_display = ('storage', 'path', 'active', 'last_checked')
    search_fields = ('storage__name', 'path')


admin.site.register(Sync, SyncAdmin)


class SupermarketCategoryInline(admin.TabularInline):
    model = SupermarketCategoryRelation


class SupermarketAdmin(admin.ModelAdmin):
    list_display = ('name', 'space',)
    inlines = (SupermarketCategoryInline,)


class SupermarketCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'space',)


admin.site.register(Supermarket, SupermarketAdmin)
admin.site.register(SupermarketCategory, SupermarketCategoryAdmin)


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
    search_fields = ('name',)
    actions = [sort_tree, enable_tree_sorting, disable_tree_sorting]


admin.site.register(Keyword, KeywordAdmin)


@admin.action(description='Delete Steps not part of a Recipe.')
def delete_unattached_steps(modeladmin, request, queryset):
    with scopes_disabled():
        Step.objects.filter(recipe=None).delete()


class StepAdmin(admin.ModelAdmin):
    list_display = ('recipe_and_name', 'order', 'space')
    ordering = ('recipe__name', 'name', 'space',)
    search_fields = ('name', 'recipe__name')
    actions = [delete_unattached_steps]

    @staticmethod
    @admin.display(description="Name")
    def recipe_and_name(obj):
        if not obj.recipe_set.exists():
            return "Orphaned Step" + ('' if not obj.name else f': {obj.name}')
        return f"{obj.recipe_set.first().name}: {obj.name}" if obj.name else obj.recipe_set.first().name


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
    list_display = ('name', 'internal', 'created_by', 'storage', 'space')
    search_fields = ('name', 'created_by__username')
    ordering = ('name', 'created_by__username',)
    list_filter = ('internal',)
    date_hierarchy = 'created_at'

    @staticmethod
    def created_by(obj):
        return obj.created_by.get_user_display_name()

    if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
        actions = [rebuild_index]


admin.site.register(Recipe, RecipeAdmin)


class UnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'space')
    ordering = ('name', 'space',)
    search_fields = ('name',)


admin.site.register(Unit, UnitAdmin)


# admin.site.register(FoodInheritField)


class FoodAdmin(TreeAdmin):
    form = movenodeform_factory(Keyword)
    ordering = ('space', 'path',)
    search_fields = ('name',)
    actions = [sort_tree, enable_tree_sorting, disable_tree_sorting]


admin.site.register(Food, FoodAdmin)


class UnitConversionAdmin(admin.ModelAdmin):
    list_display = ('base_amount', 'base_unit', 'food', 'converted_amount', 'converted_unit')
    search_fields = ('food__name', 'unit__name')


admin.site.register(UnitConversion, UnitConversionAdmin)


@admin.action(description='Delete Ingredients not part of a Recipe.')
def delete_unattached_ingredients(modeladmin, request, queryset):
    with scopes_disabled():
        Ingredient.objects.filter(step__recipe=None).delete()


class IngredientAdmin(admin.ModelAdmin):
    list_display = ('recipe_name', 'amount', 'unit', 'food', 'space')
    search_fields = ('food__name', 'unit__name', 'step__recipe__name')
    actions = [delete_unattached_ingredients]

    @staticmethod
    @admin.display(description="Recipe")
    def recipe_name(obj):
        recipes = obj.step_set.first().recipe_set.all() if obj.step_set.exists() else None
        return recipes.first().name if recipes else 'Orphaned Ingredient'


admin.site.register(Ingredient, IngredientAdmin)


class CommentAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'name', 'created_at')
    search_fields = ('text', 'created_by__username')
    date_hierarchy = 'created_at'

    @staticmethod
    def name(obj):
        return obj.created_by.get_user_display_name()


admin.site.register(Comment, CommentAdmin)


class RecipeImportAdmin(admin.ModelAdmin):
    list_display = ('name', 'storage', 'file_path')


admin.site.register(RecipeImport, RecipeImportAdmin)


class RecipeBookAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_name', 'space')
    search_fields = ('name', 'created_by__username')

    @staticmethod
    def user_name(obj):
        return obj.created_by.get_user_display_name()


admin.site.register(RecipeBook, RecipeBookAdmin)


class RecipeBookEntryAdmin(admin.ModelAdmin):
    list_display = ('book', 'recipe')


admin.site.register(RecipeBookEntry, RecipeBookEntryAdmin)


class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'meal_type', 'from_date', 'to_date')

    @staticmethod
    def user(obj):
        return obj.created_by.get_user_display_name()


admin.site.register(MealPlan, MealPlanAdmin)


class MealTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'space', 'created_by', 'order')
    search_fields = ('name', 'space', 'created_by__username')


admin.site.register(MealType, MealTypeAdmin)


class ViewLogAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'created_by', 'created_at')


admin.site.register(ViewLog, ViewLogAdmin)


class InviteLinkAdmin(admin.ModelAdmin):
    list_display = (
        'group', 'valid_until', 'space',
        'created_by', 'created_at', 'used_by'
    )


admin.site.register(InviteLink, InviteLinkAdmin)


class CookLogAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'created_by', 'created_at', 'rating', 'servings')
    search_fields = ('recipe__name', 'space__name',)


admin.site.register(CookLog, CookLogAdmin)


class ShoppingListRecipeAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipe', 'servings')


admin.site.register(ShoppingListRecipe, ShoppingListRecipeAdmin)


class ShoppingListEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'food', 'unit', 'list_recipe', 'created_by', 'created_at', 'checked')


admin.site.register(ShoppingListEntry, ShoppingListEntryAdmin)


class ShareLinkAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'created_by', 'uuid', 'created_at',)


admin.site.register(ShareLink, ShareLinkAdmin)


@admin.action(description='Delete all properties with type')
def delete_properties_with_type(modeladmin, request, queryset):
    for pt in queryset:
        Property.objects.filter(property_type=pt).delete()


class PropertyTypeAdmin(admin.ModelAdmin):
    search_fields = ('name',)

    list_display = ('id', 'space', 'name', 'fdc_id')
    actions = [delete_properties_with_type]


admin.site.register(PropertyType, PropertyTypeAdmin)


class PropertyAdmin(admin.ModelAdmin):
    list_display = ('property_amount', 'property_type')


admin.site.register(Property, PropertyAdmin)


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
