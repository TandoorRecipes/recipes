from pydoc import locate

from django.urls import include, path
from django.views.generic import TemplateView
from recipes.version import VERSION_NUMBER
from rest_framework import routers
from rest_framework.schemas import get_schema_view

from cookbook.helper import dal

from .models import (Comment, Food, InviteLink, Keyword, MealPlan, Recipe,
                     RecipeBook, RecipeBookEntry, RecipeImport, ShoppingList,
                     Storage, Sync, SyncLog, get_model_name)
from .views import api, data, delete, edit, import_export, lists, new, views

router = routers.DefaultRouter()
router.register(r'user-name', api.UserNameViewSet, basename='username')
router.register(r'user-preference', api.UserPreferenceViewSet)
router.register(r'storage', api.StorageViewSet)
router.register(r'sync', api.SyncViewSet)
router.register(r'sync-log', api.SyncLogViewSet)
router.register(r'keyword', api.KeywordViewSet)
router.register(r'unit', api.UnitViewSet)
router.register(r'food', api.FoodViewSet)
router.register(r'step', api.StepViewSet)
router.register(r'recipe', api.RecipeViewSet)
router.register(r'ingredient', api.IngredientViewSet)
router.register(r'meal-plan', api.MealPlanViewSet)
router.register(r'meal-type', api.MealTypeViewSet)
router.register(r'shopping-list', api.ShoppingListViewSet)
router.register(r'shopping-list-entry', api.ShoppingListEntryViewSet)
router.register(r'shopping-list-recipe', api.ShoppingListRecipeViewSet)
router.register(r'view-log', api.ViewLogViewSet)
router.register(r'cook-log', api.CookLogViewSet)
router.register(r'recipe-book', api.RecipeBookViewSet)
router.register(r'recipe-book-entry', api.RecipeBookEntryViewSet)

urlpatterns = [
    path('', views.index, name='index'),
    path('setup/', views.setup, name='view_setup'),
    path('signup/<slug:token>', views.signup, name='view_signup'),
    path('system/', views.system, name='view_system'),
    path('search/', views.search, name='view_search'),
    path('books/', views.books, name='view_books'),
    path('plan/', views.meal_plan, name='view_plan'),
    path('plan/entry/<int:pk>', views.meal_plan_entry, name='view_plan_entry'),
    path('shopping/', views.shopping_list, name='view_shopping'),
    path('shopping/<int:pk>', views.shopping_list, name='view_shopping'),
    path('settings/', views.user_settings, name='view_settings'),
    path('history/', views.history, name='view_history'),
    path('offline/', views.offline, name='view_offline'),
    path('service-worker.js', (TemplateView.as_view(template_name="service-worker.js", content_type='application/javascript', )), name='service_worker'),
    path('test/<int:pk>', views.test, name='view_test'),

    path('import/', import_export.import_recipe, name='view_import'),
    path('export/', import_export.export_recipe, name='view_export'),

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
    path('edit/ingredient/', edit.edit_ingredients, name='edit_food'),

    path('delete/recipe-source/<int:pk>/', delete.delete_recipe_source, name='delete_recipe_source'),

    # TODO move to generic "new" view
    path('data/sync', data.sync, name='data_sync'),
    path('data/batch/edit', data.batch_edit, name='data_batch_edit'),
    path('data/batch/import', data.batch_import, name='data_batch_import'),
    path('data/sync/wait', data.sync_wait, name='data_sync_wait'),
    path('data/statistics', data.statistics, name='data_stats'),
    path('data/import/url', data.import_url, name='data_import_url'),

    path('api/get_external_file_link/<int:recipe_id>/', api.get_external_file_link, name='api_get_external_file_link'),
    path('api/get_recipe_file/<int:recipe_id>/', api.get_recipe_file, name='api_get_recipe_file'),
    path('api/sync_all/', api.sync_all, name='api_sync'),
    path('api/log_cooking/<int:recipe_id>/', api.log_cooking, name='api_log_cooking'),
    path('api/plan-ical/<slug:from_date>/<slug:to_date>/', api.get_plan_ical, name='api_get_plan_ical'),
    path('api/recipe-from-url/', api.recipe_from_url, name='api_recipe_from_url'),
    path('api/backup/', api.get_backup, name='api_backup'),

    path('dal/keyword/', dal.KeywordAutocomplete.as_view(), name='dal_keyword'),
    path('dal/food/', dal.IngredientsAutocomplete.as_view(), name='dal_food'),
    path('dal/unit/', dal.UnitAutocomplete.as_view(), name='dal_unit'),

    path('docs/markdown/', views.markdown_info, name='docs_markdown'),
    path('docs/api/', views.api_info, name='docs_api'),

    path('openapi', get_schema_view(title="Django Recipes", version=VERSION_NUMBER), name='openapi-schema'),

    path('api/', include((router.urls, 'api'))),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

]

generic_models = (
    Recipe, RecipeImport, Storage, RecipeBook, MealPlan, SyncLog, Sync,
    Comment, RecipeBookEntry, Keyword, Food, ShoppingList, InviteLink
)

for m in generic_models:
    py_name = get_model_name(m)
    url_name = py_name.replace('_', '-')

    if c := locate(f'cookbook.views.new.{m.__name__}Create'):
        urlpatterns.append(
            path(
                f'new/{url_name}/', c.as_view(), name=f'new_{py_name}'
            )
        )

    if c := locate(f'cookbook.views.edit.{m.__name__}Update'):
        urlpatterns.append(
            path(
                f'edit/{url_name}/<int:pk>/',
                c.as_view(),
                name=f'edit_{py_name}'
            )
        )

    if c := getattr(lists, py_name, None):
        urlpatterns.append(
            path(
                f'list/{url_name}/', c, name=f'list_{py_name}'
            )
        )

    if c := locate(f'cookbook.views.delete.{m.__name__}Delete'):
        urlpatterns.append(
            path(
                f'delete/{url_name}/<int:pk>/',
                c.as_view(),
                name=f'delete_{py_name}'
            )
        )
