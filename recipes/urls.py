"""
recipes URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.i18n import JavaScriptCatalog
from django.views.static import serve
from django_js_reverse import views as reverse_views

urlpatterns = [
    path('', include('cookbook.urls')),
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('i18n/', include('django.conf.urls.i18n')),
    path(
        'jsi18n/',
        JavaScriptCatalog.as_view(domain='django'),
        name='javascript-catalog'
    ),
]

if settings.ENABLE_METRICS:
    urlpatterns += url('', include('django_prometheus.urls')),

if settings.GUNICORN_MEDIA or settings.DEBUG:
    urlpatterns += re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    urlpatterns += re_path(r'^jsreverse.json$', reverse_views.urls_js, name='js_reverse'),
