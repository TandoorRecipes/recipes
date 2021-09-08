from django.shortcuts import render

from cookbook.helper.permission_helper import group_required


@group_required('user')
def keyword(request):
    return render(request, 'model/keyword_template.html', {})


@group_required('user')
def food(request):
    return render(request, 'model/food_template.html', {})
