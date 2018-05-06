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

    path('list/keyword', lists.keyword, name='list_keyword'),
    path('list/category', lists.category, name='list_category'),
    path('list/import_log', lists.import_log, name='list_import_log'),
    path('list/import', lists.new_recipe, name='list_import'),

    path('edit/recipe/<int:pk>/', edit.RecipeUpdate.as_view(), name='edit_recipe'),
    path('edit/keyword/<int:pk>/', edit.KeywordUpdate.as_view(), name='edit_keyword'),
    path('edit/category/<int:pk>/', edit.CategoryUpdate.as_view(), name='edit_category'),
    path('edit/monitor/<int:pk>/', edit.MonitorUpdate.as_view(), name='edit_monitor'),
    path('edit/import/<int:pk>/', edit.ImportUpdate.as_view(), name='edit_import'),

    path('delete/recipe/<int:pk>/', edit.RecipeDelete.as_view(), name='delete_recipe'),
    path('delete/keyword/<int:pk>/', edit.KeywordDelete.as_view(), name='delete_keyword'),
    path('delete/category/<int:pk>/', edit.CategoryDelete.as_view(), name='delete_category'),
    path('delete/monitor/<int:pk>/', edit.MonitorDelete.as_view(), name='delete_monitor'),
    path('delete/import/<int:pk>/', edit.ImportDelete.as_view(), name='delete_import'),

    path('batch/monitor', batch.batch_monitor, name='batch_monitor'),
    path('batch/category', batch.batch_edit, name='batch_edit'),
    path('batch/import/all', batch.batch_import_all, name='batch_import_all'),

    path('api/get_file_link/<int:recipe_id>/', api.get_file_link, name='api_get_file_link'),
    path('api/sync_all/', api.dropbox_sync, name='api_dropbox_sync'),

    path('dal/keyword/', dal.KeywordAutocomplete.as_view(), name='dal_keyword'),
]
