from django.urls import path

from .views import *
from cookbook.views import api
from cookbook.helper import dal

urlpatterns = [
    path('', views.index, name='index'),
    path('test', views.test, name='test'),

    path('new/recipe/', new.RecipeCreate.as_view(), name='new_recipe'),
    path('new/recipe_import/<int:import_id>/', new.create_new_recipe, name='new_recipe_import'),
    path('new/category/', new.CategoryCreate.as_view(), name='new_category'),
    path('new/keyword/', new.KeywordCreate.as_view(), name='new_keyword'),
    path('new/storage/', new.StorageCreate.as_view(), name='new_storage'),

    path('list/keyword', lists.keyword, name='list_keyword'),
    path('list/category', lists.category, name='list_category'),
    path('list/import_log', lists.sync_log, name='list_import_log'),
    path('list/import', lists.recipe_import, name='list_import'),
    path('list/storage', lists.storage, name='list_storage'),

    path('edit/recipe/<int:pk>/', edit.RecipeUpdate.as_view(), name='edit_recipe'),
    path('edit/keyword/<int:pk>/', edit.KeywordUpdate.as_view(), name='edit_keyword'),
    path('edit/category/<int:pk>/', edit.CategoryUpdate.as_view(), name='edit_category'),
    path('edit/sync/<int:pk>/', edit.SyncUpdate.as_view(), name='edit_sync'),
    path('edit/import/<int:pk>/', edit.ImportUpdate.as_view(), name='edit_import'),
    path('edit/storage/<int:pk>/', edit.StorageUpdate.as_view(), name='edit_storage'),

    path('redirect/delete/<slug:name>/<int:pk>/', edit.delete_redirect, name='redirect_delete'),

    path('delete/recipe/<int:pk>/', edit.RecipeDelete.as_view(), name='delete_recipe'),
    path('delete/keyword/<int:pk>/', edit.KeywordDelete.as_view(), name='delete_keyword'),
    path('delete/category/<int:pk>/', edit.CategoryDelete.as_view(), name='delete_category'),
    path('delete/sync/<int:pk>/', edit.MonitorDelete.as_view(), name='delete_sync'),
    path('delete/import/<int:pk>/', edit.ImportDelete.as_view(), name='delete_import'),
    path('delete/storage/<int:pk>/', edit.StorageDelete.as_view(), name='delete_storage'),

    path('data/sync', data.sync, name='data_sync'),  # TODO move to generic "new" view
    path('data/batch/edit', data.batch_edit, name='data_batch_edit'),
    path('data/batch/import', data.batch_import, name='data_batch_import'),
    path('data/sync/wait', data.sync_wait, name='data_sync_wait'),
    path('data/statistics', data.statistics, name='data_stats'),

    path('api/get_file_link/<int:recipe_id>/', api.get_file_link, name='api_get_file_link'),
    path('api/sync_all/', api.sync_all, name='api_sync'),

    path('dal/keyword/', dal.KeywordAutocomplete.as_view(), name='dal_keyword'),
]
