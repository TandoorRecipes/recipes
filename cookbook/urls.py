from django.urls import path

from . import views
from cookbook.views import api

urlpatterns = [
    path('', views.index, name='index'),
    path('new_recipe', views.new_recipe, name='new_recipe'),
    path('new_category', views.new_category, name='new_category'),
    path('new_keyword', views.new_keyword, name='new_keyword'),
    path('edit_recipe/<int:recipe_id>/', views.edit_recipe, name='edit_recipe'),
    path('edit_category/<int:category_id>/', views.edit_category, name='edit_category'),
    path('edit_keyword/<int:keyword_id>/', views.new_keyword, name='edit_keyword'),

    path('storage/import_recipes', views.import_recipes, name='import_recipes'),

    path('api/get_file_link/<int:recipe_id>/', api.get_file_link, name='get_file_link'),
]
