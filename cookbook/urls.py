from django.urls import path

from .views import *
from cookbook.views import api
from cookbook.helper import dal

urlpatterns = [
    path('', views.index, name='index'),
    path('test', views.test, name='test'),

    path('new/recipe', new.recipe, name='new_recipe'),
    path('new/category', new.category, name='new_category'),
    path('new/keyword', new.keyword, name='new_keyword'),

    path('list/keyword', lists.keyword_list, name='list_keyword'),
    path('list/category', lists.category_list, name='list_category'),

    path('edit/recipe/<int:pk>/', edit.RecipeUpdate.as_view(), name='edit_recipe'),
    path('edit/keyword/<int:pk>/', edit.KeywordUpdate.as_view(), name='edit_keyword'),
    path('edit/category/<int:pk>/', edit.CategoryUpdate.as_view(), name='edit_category'),
    path('edit/monitor/<int:pk>/', edit.MonitorUpdate.as_view(), name='edit_monitor'),

    path('delete/recipe/<int:pk>/', edit.RecipeDelete.as_view(), name='delete_recipe'),
    path('delete/keyword/<int:pk>/', edit.KeywordDelete.as_view(), name='delete_keyword'),
    path('delete/category/<int:pk>/', edit.CategoryDelete.as_view(), name='delete_category'),
    path('delete/monitor/<int:pk>/', edit.MonitorDelete.as_view(), name='delete_monitor'),
    path('delete/new_recipe/<int:pk>/', edit.NewRecipeDelete.as_view(), name='delete_new_recipe'),

    path('batch/monitor', batch.batch_monitor, name='batch_monitor'),
    path('batch/category', batch.batch_edit, name='batch_edit'),
    path('batch/import', batch.batch_import, name='batch_import'),
    path('batch/import/all', batch.batch_import_all, name='batch_import_all'),

    path('api/get_file_link/<int:recipe_id>/', api.get_file_link, name='api_get_file_link'),
    path('api/sync_all/', api.dropbox_sync, name='api_dropbox_sync'),

    path('dal/keyword/', dal.KeywordAutocomplete.as_view(), name='dal_keyword'),

]

