from django.shortcuts import render

from cookbook.helper.permission_helper import group_required


@group_required('user')
def keyword(request):
    return render(request, 'generic/tree_template.html', {})
