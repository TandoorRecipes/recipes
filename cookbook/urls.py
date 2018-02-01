from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('new_recipe', views.new_recipe, name='new_recipe'),
    path('new_category', views.new_category, name='new_category'),
    path('new_keyword', views.new_keyword, name='new_keyword'),
    path('edit_recipe/<int:id>/', views.edit_recipe, name='edit_recipe'),
    path('edit_category/<int:id>/', views.edit_category, name='edit_category'),
    path('edit_keyword/<int:id>/', views.new_keyword, name='edit_keyword'),
]
