from django.urls import path

from .views import *
from cookbook.views import api

urlpatterns = [
    path('', views.index, name='index'),
    path('test', views.test, name='test'),

    path('new/recipe', new.recipe, name='new_recipe'),
    path('new/category', new.category, name='new_category'),
    path('new/keyword', new.keyword, name='new_keyword'),

    path('edit/recipe/<int:recipe_id>/', edit.recipe, name='edit_recipe'),

    path('edit/keyword/<int:pk>/', edit.KeywordUpdate.as_view(), name='edit_keyword'),
    path('edit/category/<int:pk>/', edit.CategoryUpdate.as_view(), name='edit_category'),
    path('edit/monitor/<int:pk>/', edit.MonitorUpdate.as_view(), name='edit_monitor'),

    path('delete/keyword/<int:pk>/', edit.KeywordDelete.as_view(), name='delete_keyword'),
    path('delete/category/<int:pk>/', edit.CategoryDelete.as_view(), name='delete_category'),
    path('delete/monitor/<int:pk>/', edit.MonitorDelete.as_view(), name='delete_monitor'),

    path('batch/import', batch.batch_import, name='batch_import'),
    path('batch/category', batch.batch_edit, name='batch_edit'),

    path('api/get_file_link/<int:recipe_id>/', api.get_file_link, name='api_get_file_link'),
    path('api/sync_all/', api.dropbox_sync, name='api_dropbox_sync'),

]

