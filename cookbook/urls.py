from pydoc import locate

from django.urls import include, path
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView
from rest_framework import routers

from cookbook.version_info import TANDOOR_VERSION
from recipes.settings import DEBUG, PLUGINS
from .views import api, telegram, views, import_export
from .views.api import CustomAuthToken


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
router.register(r'property-type', api.PropertyTypeViewSet)  # NOTE: if regenerating the legacy API these need renamed to food-property
router.register(r'property', api.PropertyViewSet)
router.register(r'shopping-list-entry', api.ShoppingListEntryViewSet)
router.register(r'shopping-list-recipe', api.ShoppingListRecipeViewSet)
router.register(r'space', api.SpaceViewSet)
router.register(r'step', api.StepViewSet)
router.register(r'storage', api.StorageViewSet)
router.register(r'connector-config', api.ConnectorConfigViewSet)
router.register(r'supermarket', api.SupermarketViewSet)
router.register(r'supermarket-category', api.SupermarketCategoryViewSet)
router.register(r'supermarket-category-relation', api.SupermarketCategoryRelationViewSet)
router.register(r'sync', api.SyncViewSet)
router.register(r'sync-log', api.SyncLogViewSet)
router.register(r'recipe-import', api.RecipeImportViewSet)
router.register(r'unit', api.UnitViewSet)
router.register(r'user-file', api.UserFileViewSet)
router.register(r'user', api.UserViewSet)
router.register(r'user-preference', api.UserPreferenceViewSet)
router.register(r'search-fields', api.SearchFieldsViewSet)
router.register(r'search-preference', api.SearchPreferenceViewSet)
router.register(r'user-space', api.UserSpaceViewSet)
router.register(r'view-log', api.ViewLogViewSet)
router.register(r'access-token', api.AccessTokenViewSet)
router.register(r'ai-provider', api.AiProviderViewSet)
router.register(r'ai-log', api.AiLogViewSet)

router.register(r'localization', api.LocalizationViewSet, basename='localization')
router.register(r'server-settings', api.ServerSettingsViewSet, basename='server-settings')

for p in PLUGINS:
    if c := locate(f'{p["module"]}.urls.{p["api_router_name"]}'):
        try:
            router.extend(c)
        except AttributeError:
            pass

urlpatterns = [

    path('setup/', views.setup, name='view_setup'),
    path('no-group/', views.no_groups, name='view_no_group'),
    path('space-overview/', views.space_overview, name='view_space_overview'),
    path('switch-space/<int:space_id>', views.switch_space, name='view_switch_space'),
    path('no-perm/', views.no_perm, name='view_no_perm'),
    path('invite/<slug:token>', views.invite_link, name='view_invite'),

    path('system/', views.system, name='view_system'),
    path('plugin/update/', views.plugin_update, name='view_plugin_update'),

    path('abuse/<slug:token>', views.report_share_abuse, name='view_report_share_abuse'),

    path('export-file/<int:pk>/', import_export.export_file, name='view_export_file'),
    # for internal use only
    path('view-recipe-pdf/<int:pk>/', views.recipe_pdf_viewer, name='view_recipe_pdf'),

    # Tandoor v1 redirects
    path('view/recipe/<int:pk>', views.redirect_recipe_view, name='redirect_recipe_view'),
    path('view/recipe/<int:pk>/<slug:share>', views.redirect_recipe_share_view, name='redirect_recipe_share_view'),

    path('api/import/', api.AppImportView.as_view(), name='view_import'),
    path('api/export/', api.AppExportView.as_view(), name='api_export'),
    path('api/get_external_file_link/<int:pk>/', api.get_external_file_link, name='api_get_external_file_link'),
    path('api/get_recipe_file/<int:pk>/', api.get_recipe_file, name='api_get_recipe_file'),
    path('api/sync_all/', api.sync_all, name='api_sync'),
    path('api/recipe-from-source/', api.RecipeUrlImportView.as_view(), name='api_recipe_from_source'),
    path('api/ai-import/', api.AiImportView.as_view(), name='api_ai_import'),
    path('api/import-open-data/', api.ImportOpenData.as_view(), name='api_import_open_data'),
    path('api/ingredient-from-string/', api.ingredient_from_string, name='api_ingredient_from_string'),
    path('api/fdc-search/', api.FdcSearchView.as_view(), name='api_fdc_search'),
    path('api/share-link/<int:pk>', api.share_link, name='api_share_link'),
    path('api/reset-food-inheritance/', api.reset_food_inheritance, name='api_reset_food_inheritance'),
    path('api/switch-active-space/<int:space_id>/', api.switch_active_space, name='api_switch_active_space'),
    path('api/download-file/<int:file_id>/', api.download_file, name='api_download_file'),
    path('telegram/setup/<int:pk>', telegram.setup_bot, name='telegram_setup'),
    path('telegram/remove/<int:pk>', telegram.remove_bot, name='telegram_remove'),
    path('telegram/hook/<slug:token>/', telegram.hook, name='telegram_hook'),
    path('docs/markdown/', views.markdown_info, name='docs_markdown'),
    path('docs/search/', views.search_info, name='docs_search'),
    path('docs/api/', views.Redoc.as_view(url_name='openapi-schema'), name='docs_api'),
    path('docs/swagger/', views.Swagger.as_view(url_name='openapi-schema'), name='docs_swagger'),
    path('openapi/', SpectacularAPIView.as_view(api_version=TANDOOR_VERSION), name='openapi-schema'),
    path('api/', include((router.urls, 'api'))),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api-token-auth/', CustomAuthToken.as_view()),

    path('offline/', views.offline, name='view_offline'),
    path('service-worker.js', views.service_worker, name='service_worker'),
    path('manifest.json', views.web_manifest, name='web_manifest'),

]

# catchall view for new frontend
urlpatterns += [
    path('', views.index, name='index'),
    path('<path:resource>', views.index, name='tandoor_frontend'),
]
