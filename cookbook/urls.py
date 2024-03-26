from pydoc import locate

from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework import permissions, routers
from rest_framework.schemas import get_schema_view

from cookbook.version_info import TANDOOR_VERSION
from recipes.settings import DEBUG, PLUGINS

from .models import (Automation, Comment, CustomFilter, Food, InviteLink, Keyword, PropertyType,
                     Recipe, RecipeBook, RecipeBookEntry, RecipeImport, Space, Step,
                     Storage, Supermarket, SupermarketCategory, Sync, SyncLog, Unit, UnitConversion,
                     UserFile, UserSpace, get_model_name, ConnectorConfig)

from .views import api, data, delete, edit, import_export, lists, new, telegram, views
from .views.api import CustomAuthToken, ImportOpenData
import datetime

# extend DRF default router class to allow including additional routers
class DefaultRouter(routers.DefaultRouter):

    def extend(self, r):
        self.registry.extend(r.registry)


router = DefaultRouter()
router.register(r'automation', api.AutomationViewSet)
router.register(r'bookmarklet-import', api.BookmarkletImportViewSet)
router.register(r'cook-log', api.CookLogViewSet)
router.register(r'custom-filter', api.CustomFilterViewSet)
router.register(r'food', api.FoodViewSet)
router.register(r'food-inherit-field', api.FoodInheritFieldViewSet)
router.register(r'import-log', api.ImportLogViewSet)
router.register(r'export-log', api.ExportLogViewSet)
router.register(r'group', api.GroupViewSet)
router.register(r'ingredient', api.IngredientViewSet)
router.register(r'invite-link', api.InviteLinkViewSet)
router.register(r'keyword', api.KeywordViewSet)
router.register(r'meal-plan', api.MealPlanViewSet)
router.register(r'auto-plan', api.AutoPlanViewSet, basename='auto-plan')
router.register(r'meal-type', api.MealTypeViewSet)
router.register(r'recipe', api.RecipeViewSet)
router.register(r'recipe-book', api.RecipeBookViewSet)
router.register(r'recipe-book-entry', api.RecipeBookEntryViewSet)
router.register(r'unit-conversion', api.UnitConversionViewSet)
router.register(r'food-property-type', api.PropertyTypeViewSet)  # TODO rename + regenerate
router.register(r'food-property', api.PropertyViewSet)
router.register(r'shopping-list-entry', api.ShoppingListEntryViewSet)
router.register(r'shopping-list-recipe', api.ShoppingListRecipeViewSet)
router.register(r'space', api.SpaceViewSet)
router.register(r'step', api.StepViewSet)
router.register(r'storage', api.StorageViewSet)
router.register(r'connector-config', api.ConnectorConfigConfigViewSet)
router.register(r'supermarket', api.SupermarketViewSet)
router.register(r'supermarket-category', api.SupermarketCategoryViewSet)
router.register(r'supermarket-category-relation', api.SupermarketCategoryRelationViewSet)
router.register(r'sync', api.SyncViewSet)
router.register(r'sync-log', api.SyncLogViewSet)
router.register(r'unit', api.UnitViewSet)
router.register(r'user-file', api.UserFileViewSet)
router.register(r'user', api.UserViewSet)
router.register(r'user-preference', api.UserPreferenceViewSet)
router.register(r'user-space', api.UserSpaceViewSet)
router.register(r'view-log', api.ViewLogViewSet)
router.register(r'access-token', api.AccessTokenViewSet)

for p in PLUGINS:
    if c := locate(f'{p["module"]}.urls.{p["api_router_name"]}'):
        try:
            router.extend(c)
        except AttributeError:
            pass

urlpatterns = [
    path('', views.index, name='index'),
    path('setup/', views.setup, name='view_setup'),
    path('no-group', views.no_groups, name='view_no_group'),
    path('space-overview', views.space_overview, name='view_space_overview'),
    path('space-manage/<int:space_id>', views.space_manage, name='view_space_manage'),
    path('switch-space/<int:space_id>', views.switch_space, name='view_switch_space'),
    path('no-perm', views.no_perm, name='view_no_perm'),
    path('invite/<slug:token>', views.invite_link, name='view_invite'),
    path('system/', views.system, name='view_system'),
    path('search/', views.search, name='view_search'),
    path('books/', views.books, name='view_books'),
    path('plan/', views.meal_plan, name='view_plan'),
    path('shopping/', lists.shopping_list, name='view_shopping'),
    path('settings/', views.user_settings, name='view_settings'),
    path('settings-shopping/', views.shopping_settings, name='view_shopping_settings'),  # TODO rename to search settings
    path('history/', views.history, name='view_history'),
    path('ingredient-editor/', views.ingredient_editor, name='view_ingredient_editor'),
    path('property-editor/<int:pk>', views.property_editor, name='view_property_editor'),
    path('abuse/<slug:token>', views.report_share_abuse, name='view_report_share_abuse'),
    path('api/import/', api.import_files, name='view_import'),
    path('import-response/<int:pk>/', import_export.import_response, name='view_import_response'),
    path('export/', import_export.export_recipe, name='view_export'),
    path('export-response/<int:pk>/', import_export.export_response, name='view_export_response'),
    path('export-file/<int:pk>/', import_export.export_file, name='view_export_file'),
    path('view/recipe/<int:pk>', views.recipe_view, name='view_recipe'),
    path('view/recipe/<int:pk>/<slug:share>', views.recipe_view, name='view_recipe'),
    path('new/recipe-import/<int:import_id>/', new.create_new_external_recipe, name='new_recipe_import'),
    path('new/share-link/<int:pk>/', new.share_link, name='new_share_link'),
    path('edit/recipe/<int:pk>/', edit.switch_recipe, name='edit_recipe'),

    # for internal use only
    path('edit/recipe/internal/<int:pk>/', edit.internal_recipe_update, name='edit_internal_recipe'),
    path('edit/recipe/external/<int:pk>/', edit.ExternalRecipeUpdate.as_view(), name='edit_external_recipe'),
    path('edit/recipe/convert/<int:pk>/', edit.convert_recipe, name='edit_convert_recipe'),
    path('edit/storage/<int:pk>/', edit.edit_storage, name='edit_storage'),
    path('delete/recipe-source/<int:pk>/', delete.delete_recipe_source, name='delete_recipe_source'),

    # TODO move to generic "new" view
    path('data/sync', data.sync, name='data_sync'),
    path('data/batch/edit', data.batch_edit, name='data_batch_edit'),
    path('data/batch/import', data.batch_import, name='data_batch_import'),
    path('data/sync/wait', data.sync_wait, name='data_sync_wait'),
    path('data/import/url', data.import_url, name='data_import_url'),
    path('api/get_external_file_link/<int:recipe_id>/', api.get_external_file_link, name='api_get_external_file_link'),
    path('api/get_recipe_file/<int:recipe_id>/', api.get_recipe_file, name='api_get_recipe_file'),
    path('api/sync_all/', api.sync_all, name='api_sync'),
    path('api/log_cooking/<int:recipe_id>/', api.log_cooking, name='api_log_cooking'),

    path('api/plan-ical/<slug:from_date>/<slug:to_date>/', api.get_plan_ical, name='api_get_plan_ical'),

    path('api/recipe-from-source/', api.RecipeUrlImportView.as_view(), name='api_recipe_from_source'),
    path('api/backup/', api.get_backup, name='api_backup'),
    path('api/ingredient-from-string/', api.ingredient_from_string, name='api_ingredient_from_string'),
    path('api/share-link/<int:pk>', api.share_link, name='api_share_link'),
    path('api/reset-food-inheritance/', api.reset_food_inheritance, name='api_reset_food_inheritance'),
    path('api/switch-active-space/<int:space_id>/', api.switch_active_space, name='api_switch_active_space'),
    path('api/download-file/<int:file_id>/', api.download_file, name='api_download_file'),
    path('telegram/setup/<int:pk>', telegram.setup_bot, name='telegram_setup'),
    path('telegram/remove/<int:pk>', telegram.remove_bot, name='telegram_remove'),
    path('telegram/hook/<slug:token>/', telegram.hook, name='telegram_hook'),
    path('docs/markdown/', views.markdown_info, name='docs_markdown'),
    path('docs/search/', views.search_info, name='docs_search'),
    path('docs/api/', views.api_info, name='docs_api'),
    path('openapi/', get_schema_view(title="Django Recipes", version=TANDOOR_VERSION, public=True, permission_classes=(permissions.AllowAny,)), name='openapi-schema'),
    path('api/', include((router.urls, 'api'))),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api-token-auth/', CustomAuthToken.as_view()),
    path('api-import-open-data/', ImportOpenData.as_view(), name='api_import_open_data'),
    path('offline/', views.offline, name='view_offline'),
    path('service-worker.js', (TemplateView.as_view(template_name="sw.js", content_type='application/javascript',
                                                    )), name='service_worker'),
    path('manifest.json', views.web_manifest, name='web_manifest'),
]

generic_models = (
    Recipe, RecipeImport, Storage, ConnectorConfig, RecipeBook, SyncLog, Sync,
    Comment, RecipeBookEntry, InviteLink, UserSpace, Space
)

for m in generic_models:
    py_name = get_model_name(m)
    url_name = py_name.replace('_', '-')

    if c := locate(f'cookbook.views.new.{m.__name__}Create'):
        urlpatterns.append(path(f'new/{url_name}/', c.as_view(), name=f'new_{py_name}'))

    if c := locate(f'cookbook.views.edit.{m.__name__}Update'):
        urlpatterns.append(path(f'edit/{url_name}/<int:pk>/', c.as_view(), name=f'edit_{py_name}'))

    if c := getattr(lists, py_name, None):
        urlpatterns.append(path(f'list/{url_name}/', c, name=f'list_{py_name}'))

    if c := locate(f'cookbook.views.delete.{m.__name__}Delete'):
        urlpatterns.append(path(f'delete/{url_name}/<int:pk>/', c.as_view(), name=f'delete_{py_name}'))

vue_models = [Food, Keyword, Unit, Supermarket, SupermarketCategory, Automation, UserFile, Step, CustomFilter, UnitConversion, PropertyType]
for m in vue_models:
    py_name = get_model_name(m)
    url_name = py_name.replace('_', '-')

    if c := getattr(lists, py_name, None):
        urlpatterns.append(path(f'list/{url_name}/', c, name=f'list_{py_name}'))

if DEBUG:
    urlpatterns.append(path('test/', views.test, name='view_test'))
    urlpatterns.append(path('test2/', views.test2, name='view_test2'))
