from pydoc import locate

from django.urls import path, include
from rest_framework import routers

from .views import *
from cookbook.views import api, import_export
from cookbook.helper import dal

router = routers.DefaultRouter()
router.register(r'recipe', api.RecipeViewSet)
router.register(r'meal-plan', api.MealPlanViewSet)
router.register(r'meal-type', api.MealTypeViewSet)
router.register(r'view-log', api.ViewLogViewSet)
router.register(r'user-name', api.UserNameViewSet, basename='username')

urlpatterns = [
    path('', views.index, name='index'),
    path('setup/', views.setup, name='view_setup'),
    path('system/', views.system, name='view_system'),
    path('search/', views.search, name='view_search'),
    path('books/', views.books, name='view_books'),
    path('plan/', views.meal_plan, name='view_plan'),
    path('plan/entry/<int:pk>', views.meal_plan_entry, name='view_plan_entry'),
    path('shopping/', views.shopping_list, name='view_shopping'),
    path('settings/', views.user_settings, name='view_settings'),
    path('history/', views.history, name='view_history'),

    path('import/', import_export.import_recipe, name='view_import'),
    path('export/', import_export.export_recipe, name='view_export'),

    path('view/recipe/<int:pk>', views.recipe_view, name='view_recipe'),

    path('new/recipe_import/<int:import_id>/', new.create_new_external_recipe, name='new_recipe_import'),

    path('edit/recipe/<int:pk>/', edit.switch_recipe, name='edit_recipe'),
    path('edit/recipe/internal/<int:pk>/', edit.internal_recipe_update, name='edit_internal_recipe'),  # for internal use only
    path('edit/recipe/external/<int:pk>/', edit.ExternalRecipeUpdate.as_view(), name='edit_external_recipe'),  # for internal use only
    path('edit/recipe/convert/<int:pk>/', edit.convert_recipe, name='edit_convert_recipe'),  # for internal use only

    path('edit/storage/<int:pk>/', edit.edit_storage, name='edit_storage'),
    path('edit/ingredient/', edit.edit_ingredients, name='edit_ingredient'),

    path('delete/recipe-source/<int:pk>/', delete.delete_recipe_source, name='delete_recipe_source'),

    path('data/sync', data.sync, name='data_sync'),  # TODO move to generic "new" view
    path('data/batch/edit', data.batch_edit, name='data_batch_edit'),
    path('data/batch/import', data.batch_import, name='data_batch_import'),
    path('data/sync/wait', data.sync_wait, name='data_sync_wait'),
    path('data/statistics', data.statistics, name='data_stats'),

    path('api/get_external_file_link/<int:recipe_id>/', api.get_external_file_link, name='api_get_external_file_link'),
    path('api/get_recipe_file/<int:recipe_id>/', api.get_recipe_file, name='api_get_recipe_file'),
    path('api/sync_all/', api.sync_all, name='api_sync'),
    path('api/log_cooking/<int:recipe_id>/', api.log_cooking, name='api_log_cooking'),

    path('dal/keyword/', dal.KeywordAutocomplete.as_view(), name='dal_keyword'),
    path('dal/ingredient/', dal.IngredientsAutocomplete.as_view(), name='dal_ingredient'),
    path('dal/unit/', dal.UnitAutocomplete.as_view(), name='dal_unit'),

    path('docs/markdown/', views.markdown_info, name='docs_markdown'),

    path('api/', include((router.urls, 'api'))),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

generic_models = (Recipe, RecipeImport, Storage, RecipeBook, MealPlan, SyncLog, Sync, Comment, RecipeBookEntry, Keyword, Ingredient)

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
