from django.urls import path

from . import views
from cookbook.views import api

urlpatterns = [
    path('', views.index, name='index'),
    path('new/recipe', views.new_recipe, name='new_recipe'),
    path('new/category', views.new_category, name='new_category'),
    path('new/keyword', views.new_keyword, name='new_keyword'),

    path('edit/recipe/<int:recipe_id>/', views.edit_recipe, name='edit_recipe'),
    path('edit/category/<int:category_id>/', views.edit_category, name='edit_category'),
    path('edit/keyword/<int:keyword_id>/', views.new_keyword, name='edit_keyword'),

    path('batch/import', views.batch_import, name='batch_import'),
    path('batch/category', views.batch_category, name='batch_category'),

    path('api/get_file_link/<int:recipe_id>/', api.get_file_link, name='get_file_link'),
]
