from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('new_recipe', views.new_recipe, name='new_recipe'),
    path('new_category', views.new_category, name='new_category'),
    path('new_keyword', views.new_keyword, name='new_keyword'),
]
