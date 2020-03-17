from pydoc import locate

from django.urls import path

from .views import *
from cookbook.views import api
from cookbook.helper import dal

urlpatterns = [
    path('', views.index, name='index'),
    path('books/', views.books, name='view_books'),
    path('plan/', views.meal_plan, name='view_plan'),
    path('shopping/', views.shopping_list, name='view_shopping'),
    path('settings/', views.settings, name='view_settings'),

    path('view/recipe/<int:pk>', views.recipe_view, name='view_recipe'),

    path('edit/recipe/internal/<int:pk>/', edit.internal_recipe_update, name='edit_internal_recipe'),
    # for internal use only
    path('edit/recipe/external/<int:pk>/', edit.RecipeUpdate.as_view(), name='edit_external_recipe'),
    # for internal use only
    path('edit/recipe/convert/<int:pk>/', edit.convert_recipe, name='edit_convert_recipe'),  # for internal use only

    path('edit/storage/<int:pk>/', edit.edit_storage, name='edit_storage'),
    path('edit/ingredient/', edit.edit_ingredients, name='edit_ingredient'),

    path('delete/recipe-source/<int:pk>/', delete.RecipeSourceDelete.as_view(), name='delete_recipe_source'),

    path('data/sync', data.sync, name='data_sync'),  # TODO move to generic "new" view
    path('data/batch/edit', data.batch_edit, name='data_batch_edit'),
    path('data/batch/import', data.batch_import, name='data_batch_import'),
    path('data/sync/wait', data.sync_wait, name='data_sync_wait'),
    path('data/statistics', data.statistics, name='data_stats'),

    path('api/get_external_file_link/<int:recipe_id>/', api.get_external_file_link, name='api_get_external_file_link'),
    path('api/get_recipe_file/<int:recipe_id>/', api.get_recipe_file, name='api_get_recipe_file'),

    path('api/sync_all/', api.sync_all, name='api_sync'),

    path('dal/keyword/', dal.KeywordAutocomplete.as_view(), name='dal_keyword'),
    path('dal/ingredient/', dal.IngredientsAutocomplete.as_view(), name='dal_ingredient'),
    path('dal/unit/', dal.UnitAutocomplete.as_view(), name='dal_unit'),
]

generic_models = (Recipe, RecipeImport, Storage, RecipeBook, MealPlan, SyncLog, Sync, Comment, RecipeBookEntry, Keyword)

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
