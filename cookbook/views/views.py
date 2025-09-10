import os
import re
import subprocess
from datetime import datetime, timedelta
from io import StringIO
from uuid import UUID

import redis
from allauth.utils import build_absolute_uri
from django.apps import apps
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.cache import caches
from django.core.exceptions import ValidationError, PermissionDenied, BadRequest
from django.core.management import call_command
from django.db import models
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.templatetags.static import static
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.translation import gettext as _
from django_scopes import scopes_disabled
from drf_spectacular.views import SpectacularRedocView, SpectacularSwaggerView

from cookbook.forms import Recipe, SpaceCreateForm, SpaceJoinForm, User, UserCreateForm
from cookbook.helper.HelperFunctions import str2bool
from cookbook.helper.permission_helper import CustomIsGuest, GroupRequiredMixin, has_group_permission, share_link_valid, switch_user_active_space
from cookbook.models import InviteLink, ShareLink, Space, UserSpace
from cookbook.templatetags.theming_tags import get_theming_values
from cookbook.version_info import VERSION_INFO
from recipes.settings import PLUGINS, BASE_DIR


def index(request, path=None, resource=None):
    # show setup page when no users exist
    with scopes_disabled():
        if not request.user.is_authenticated:
            if User.objects.count() < 1 and 'django.contrib.auth.backends.RemoteUserBackend' not in settings.AUTHENTICATION_BACKENDS:
                return HttpResponseRedirect(reverse_lazy('view_setup'))

    if request.user.is_authenticated or re.search(r'/recipe/\d+/', request.path[:512]) and request.GET.get('share'):
        return render(request, 'frontend/tandoor.html', {})
    else:
        return HttpResponseRedirect(reverse('account_login') + '?next=' + request.path)


def redirect_recipe_view(request, pk):
    if request.GET.get('share'):
        return index(request)
    return HttpResponseRedirect(build_absolute_uri(request, reverse('index')) + f'recipe/{pk}')


def redirect_recipe_share_view(request, pk, share):
    if re.match(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}', share):
        return HttpResponseRedirect(build_absolute_uri(request, reverse('index')) + f'recipe/{pk}/?share={share}')
    return HttpResponseRedirect(reverse('index'))


def search(request):
    if settings.V3_BETA:
        return HttpResponseRedirect(reverse('vue3'))

    if has_group_permission(request.user, ('guest',)):
        return render(request, 'search.html', {})
    else:
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse('view_no_group'))
        else:
            return HttpResponseRedirect(reverse('account_login') + '?next=' + request.path)


def no_groups(request):
    return render(request, 'no_groups_info.html')


@login_required
def space_overview(request):
    if request.POST:
        create_form = SpaceCreateForm(request.POST, prefix='create')
        join_form = SpaceJoinForm(request.POST, prefix='join')
        if settings.HOSTED and request.user.username == 'demo':
            messages.add_message(request, messages.WARNING, _('This feature is not available in the demo version!'))
        else:
            if create_form.is_valid():
                if Space.objects.filter(created_by=request.user).count() >= request.user.userpreference.max_owned_spaces:
                    messages.add_message(request, messages.ERROR,
                                         _('You have the reached the maximum amount of spaces that can be owned by you.') + f' ({request.user.userpreference.max_owned_spaces})')
                    return HttpResponseRedirect(reverse('view_space_overview'))

                created_space = Space.objects.create(name=create_form.cleaned_data['name'],
                                                     created_by=request.user,
                                                     max_file_storage_mb=settings.SPACE_DEFAULT_MAX_FILES,
                                                     max_recipes=settings.SPACE_DEFAULT_MAX_RECIPES,
                                                     max_users=settings.SPACE_DEFAULT_MAX_USERS,
                                                     allow_sharing=settings.SPACE_DEFAULT_ALLOW_SHARING,
                                                     ai_enabled=settings.SPACE_AI_ENABLED,
                                                     ai_credits_monthly=settings.SPACE_AI_CREDITS_MONTHLY,)

                user_space = UserSpace.objects.create(space=created_space, user=request.user, active=False)
                user_space.groups.add(Group.objects.filter(name='admin').get())

                messages.add_message(request, messages.SUCCESS,
                                     _('You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you.'))
                return HttpResponseRedirect(reverse('view_switch_space', args=[user_space.space.pk]))

            if join_form.is_valid():
                return HttpResponseRedirect(reverse('view_invite', args=[join_form.cleaned_data['token']]))
    else:
        if settings.SOCIAL_DEFAULT_ACCESS and len(request.user.userspace_set.all()) == 0:
            user_space = UserSpace.objects.create(space=Space.objects.first(), user=request.user, active=False)
            user_space.groups.add(Group.objects.filter(name=settings.SOCIAL_DEFAULT_GROUP).get())
            return HttpResponseRedirect(reverse('index'))
        if 'signup_token' in request.session:
            return HttpResponseRedirect(reverse('view_invite', args=[request.session.pop('signup_token', '')]))

        create_form = SpaceCreateForm(initial={'name': f'{request.user.get_user_display_name()}\'s Space'})
        join_form = SpaceJoinForm()

    return render(request, 'space_overview.html', {'create_form': create_form, 'join_form': join_form})


@login_required
def switch_space(request, space_id):
    space = get_object_or_404(Space, id=space_id)
    switch_user_active_space(request.user, space)
    return HttpResponseRedirect(reverse('index'))


def no_perm(request):
    if not request.user.is_authenticated:
        messages.add_message(request, messages.ERROR, _('You are not logged in and therefore cannot view this page!'))
        return HttpResponseRedirect(reverse('account_login') + '?next=' + request.GET.get('next', '/search/'))
    return render(request, 'no_perm_info.html')


def recipe_pdf_viewer(request, pk):
    with scopes_disabled():
        recipe = get_object_or_404(Recipe, pk=pk)
        if share_link_valid(recipe, request.GET.get('share', None)) or (has_group_permission(
                request.user, ['guest']) and recipe.space == request.space):
            return render(request, 'pdf_viewer.html', {'recipe_id': pk, 'share': request.GET.get('share', None)})
        return HttpResponseRedirect(reverse('index'))


def system(request):
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('index'))

    postgres_ver = None
    postgres = settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'

    if postgres:
        postgres_current = 16  # will need to be updated as PostgreSQL releases new major versions

        from django.db import connection

        try:
            postgres_ver = divmod(connection.pg_version, 10000)[0]
            if postgres_ver >= postgres_current:
                database_status = 'success'
                database_message = _('Everything is fine!')
            elif postgres_ver < postgres_current - 2:
                database_status = 'danger'
                database_message = _('PostgreSQL %(v)s is deprecated.  Upgrade to a fully supported version!') % {'v': postgres_ver}
            else:
                database_status = 'info'
                database_message = _('You are running PostgreSQL %(v1)s.  PostgreSQL %(v2)s is recommended') % {'v1': postgres_ver, 'v2': postgres_current}
        except Exception as e:
            print(f"Error determining PostgreSQL version: {e}")
            database_status = 'danger'
            database_message = _('Unable to determine PostgreSQL version.')
    else:
        database_status = 'info'
        database_message = _(
            'This application is not running with a Postgres database backend. This is ok but not recommended as some features only work with postgres databases.')

    secret_key = False if os.getenv('SECRET_KEY') else True

    if request.method == "POST":
        del_orphans = request.POST.get('delete_orphans')
        orphans = get_orphan_files(delete_orphans=str2bool(del_orphans))
    else:
        orphans = get_orphan_files()

    out = StringIO()
    call_command('showmigrations', stdout=out)
    missing_migration = False
    migration_info = {}
    current_app = None
    for row in out.getvalue().splitlines():
        if '[ ]' in row and current_app:
            migration_info[current_app]['unapplied_migrations'].append(row.replace('[ ]', ''))
            missing_migration = True
        elif '[X]' in row and current_app:
            migration_info[current_app]['applied_migrations'].append(row.replace('[x]', ''))
        elif '(no migrations)' in row and current_app:
            pass
        else:
            current_app = row
            migration_info[current_app] = {'app': current_app, 'unapplied_migrations': [], 'applied_migrations': [], 'total': 0}

    for key in migration_info.keys():
        migration_info[key]['total'] = len(migration_info[key]['unapplied_migrations']) + len(migration_info[key]['applied_migrations'])

    api_stats = None
    api_space_stats = None
    # API endpoint logging
    if settings.REDIS_HOST:
        r = redis.StrictRedis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password='',
            username='',
            db=settings.REDIS_DATABASES['STATS'],
        )

        api_stats = [['Endpoint', 'Total']]
        api_space_stats = [['User', 'Total']]
        total_stats = ['All', int(r.get('api:request-count'))]

        for i in range(0, 6):
            d = (timezone.now() - timedelta(days=i)).isoformat()
            api_stats[0].append(d)
            api_space_stats[0].append(d)
            total_stats.append(int(r.get(f'api:request-count:{d}')) if r.get(f'api:request-count:{d}') else 0)

        api_stats.append(total_stats)

        for x in r.zrange('api:endpoint-request-count', 0, -1, withscores=True, desc=True):
            endpoint = x[0].decode('utf-8')
            endpoint_stats = [endpoint, x[1]]
            for i in range(0, 6):
                d = (timezone.now() - timedelta(days=i)).isoformat()
                endpoint_stats.append(r.zscore(f'api:endpoint-request-count:{d}', endpoint))
            api_stats.append(endpoint_stats)

        for x in r.zrange('api:space-request-count', 0, 20, withscores=True, desc=True):
            s = x[0].decode('utf-8')
            if space := Space.objects.filter(pk=s).first():
                space_stats = [space.name, x[1]]
                for i in range(0, 6):
                    d = (timezone.now() - timedelta(days=i)).isoformat()
                    space_stats.append(r.zscore(f'api:space-request-count:{d}', s))
                api_space_stats.append(space_stats)

    cache_response = caches['default'].get(f'system_view_test_cache_entry', None)
    if not cache_response:
        caches['default'].set(f'system_view_test_cache_entry', datetime.now(), 10)

    return render(
        request, 'system.html', {
            'gunicorn_media': settings.GUNICORN_MEDIA,
            'debug': settings.DEBUG,
            'postgres': postgres,
            'postgres_version': postgres_ver,
            'postgres_status': database_status,
            'postgres_message': database_message,
            'version_info': VERSION_INFO,
            'plugins': PLUGINS,
            'secret_key': secret_key,
            'orphans': orphans,
            'migration_info': migration_info,
            'missing_migration': missing_migration,
            'cache_response': cache_response,
        })


def plugin_update(request):
    if not request.user.is_superuser:
        raise PermissionDenied

    if not 'module' in request.GET:
        raise BadRequest

    for p in PLUGINS:
        if p['module'] == request.GET['module']:
            update_response = subprocess.check_output(['git', 'pull'], cwd=p['base_path'])
            print(update_response)
            return HttpResponseRedirect(reverse('view_system'))

    return HttpResponseRedirect(reverse('view_system'))


def setup(request):
    with scopes_disabled():
        if User.objects.count() > 0 or 'django.contrib.auth.backends.RemoteUserBackend' in settings.AUTHENTICATION_BACKENDS:
            messages.add_message(
                request, messages.ERROR,
                _('The setup page can only be used to create the first user! \
                    If you have forgotten your superuser credentials please consult the django documentation on how to reset passwords.'))
            return HttpResponseRedirect(reverse('account_login'))

        if request.method == 'POST':
            form = UserCreateForm(request.POST)
            if form.is_valid():
                if form.cleaned_data['password'] != form.cleaned_data['password_confirm']:
                    form.add_error('password', _('Passwords dont match!'))
                else:
                    user = User(username=form.cleaned_data['name'], is_superuser=True, is_staff=True)
                    try:
                        validate_password(form.cleaned_data['password'], user=user)
                        user.set_password(form.cleaned_data['password'])
                        user.save()

                        messages.add_message(request, messages.SUCCESS, _('User has been created, please login!'))
                        return HttpResponseRedirect(reverse('account_login'))
                    except ValidationError as e:
                        for m in e:
                            form.add_error('password', m)
        else:
            form = UserCreateForm()

        return render(request, 'setup.html', {'form': form})


def invite_link(request, token):
    with scopes_disabled():
        try:
            token = UUID(token, version=4)
        except ValueError:
            messages.add_message(request, messages.ERROR, _('Malformed Invite Link supplied!'))
            return HttpResponseRedirect(reverse('index'))

        if link := InviteLink.objects.filter(valid_until__gte=datetime.today(), used_by=None, uuid=token).first():
            if request.user.is_authenticated and not request.user.userspace_set.filter(space=link.space).exists():
                if not link.reusable:
                    link.used_by = request.user
                    link.save()

                user_space = UserSpace.objects.create(user=request.user, space=link.space, internal_note=link.internal_note, invite_link=link, active=False)

                if request.user.userspace_set.count() == 1:
                    user_space.active = True
                    user_space.save()

                user_space.groups.add(link.group)

                messages.add_message(request, messages.SUCCESS, _('Successfully joined space.'))
                return HttpResponseRedirect(reverse('view_space_overview'))
            else:
                request.session['signup_token'] = str(token)
                return HttpResponseRedirect(reverse('account_signup'))

    messages.add_message(request, messages.ERROR, _('Invite Link not valid or already used!'))
    return HttpResponseRedirect(reverse('view_space_overview'))


def report_share_abuse(request, token):
    if not settings.SHARING_ABUSE:
        messages.add_message(request, messages.WARNING, _('Reporting share links is not enabled for this instance. Please notify the page administrator to report problems.'))
    else:
        if link := ShareLink.objects.filter(uuid=token).first():
            link.abuse_blocked = True
            link.save()
            messages.add_message(request, messages.WARNING, _('Recipe sharing link has been disabled! For additional information please contact the page administrator.'))
    return HttpResponseRedirect(reverse('index'))


def web_manifest(request):
    theme_values = get_theming_values(request)

    icons = [{
        "src": theme_values['logo_color_svg'],
        "sizes": "any"
    }, {
        "src": theme_values['logo_color_144'],
        "type": "image/png",
        "sizes": "144x144"
    }, {
        "src": theme_values['logo_color_512'],
        "type": "image/png",
        "sizes": "512x512"
    }]

    manifest_info = {
        "name":
            theme_values['app_name'],
        "short_name":
            theme_values['app_name'],
        "description":
            _("Manage recipes, shopping list, meal plans and more."),
        "icons":
            icons,
        "start_url":
            "./",
        "background_color":
            theme_values['nav_bg_color'],
        "display":
            "standalone",
        "scope":
            ".",
        "theme_color":
            theme_values['nav_bg_color'],
        "shortcuts": [{
            "name": _("Plan"),
            "short_name": _("Plan"),
            "description": _("View your meal Plan"),
            "url": "./mealplan",
            "icons": [
                {
                    "src": static('assets/logo_color_plan.svg'),
                    "sizes": "any"
                }, {
                    "src": static('assets/logo_color_plan_144.png'),
                    "type": "image/png",
                    "sizes": "144x144"
                }, {
                    "src": static('assets/logo_color_plan_512.png'),
                    "type": "image/png",
                    "sizes": "512x512"
                }
            ]
        }, {
            "name": _("Shopping"),
            "short_name": _("Shopping"),
            "description": _("View your shopping lists"),
            "url": "./shopping",
            "icons": [
                {
                    "src": static('assets/logo_color_shopping.svg'),
                    "sizes": "any"
                }, {
                    "src": static('assets/logo_color_shopping_144.png'),
                    "type": "image/png",
                    "sizes": "144x144"
                }, {
                    "src": static('assets/logo_color_shopping_512.png'),
                    "type": "image/png",
                    "sizes": "512x512"
                }
            ]
        }],
        "share_target": {
            "action": "/recipe/import",
            "method": "GET",
            "enctype": "application/x-www-form-urlencoded",
            "params": {
                "title": "title",
                "url": "url",
                "text": "text"
            }
        }
    }

    return JsonResponse(manifest_info, json_dumps_params={'indent': 4})


def markdown_info(request):
    return render(request, 'markdown_info.html', {})


def search_info(request):
    return render(request, 'search_info.html', {})


class Redoc(GroupRequiredMixin, SpectacularRedocView):
    permission_classes = [CustomIsGuest]
    groups_required = ['guest']


class Swagger(GroupRequiredMixin, SpectacularSwaggerView):
    permission_classes = [CustomIsGuest]
    groups_required = ['guest']


def offline(request):
    return render(request, 'offline.html', {})


def service_worker(request):
    with open(os.path.join(BASE_DIR, 'cookbook', 'static', 'vue3', 'service-worker.js'), 'rb') as service_worker_file:
        response = HttpResponse(content=service_worker_file)
        response['Content-Type'] = 'text/javascript'
        return response


def test(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))

    from cookbook.helper.ingredient_parser import IngredientParser
    parser = IngredientParser(request, False)

    data = {'original': '90g golden syrup'}
    data['parsed'] = parser.parse(data['original'])

    return render(request, 'test.html', {'data': data})


def test2(request):
    if not settings.DEBUG:
        return HttpResponseRedirect(reverse('index'))


def tandoor_frontend(request):
    return render(request, 'frontend/tandoor.html', {})


def get_orphan_files(delete_orphans=False):
    # Get list of all image files in media folder
    media_dir = settings.MEDIA_ROOT

    def find_orphans():
        image_files = []
        for root, dirs, files in os.walk(media_dir):
            for file in files:

                if not file.lower().endswith(('.db')) and not root.lower().endswith(('@eadir')):
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(full_path, media_dir)
                    image_files.append((relative_path, full_path))

        # Get list of all image fields in models
        image_fields = []
        for model in apps.get_models():
            for field in model._meta.get_fields():
                if isinstance(field, models.ImageField) or isinstance(field, models.FileField):
                    image_fields.append((model, field.name))

        # get all images in the database
        # TODO I don't know why, but this completely bypasses scope limitations
        image_paths = []
        for model, field in image_fields:
            image_field_paths = model.objects.values_list(field, flat=True)
            image_paths.extend(image_field_paths)

        # Check each image file against model image fields
        return [img for img in image_files if img[0] not in image_paths]

    orphans = find_orphans()
    if delete_orphans:
        for f in [img[1] for img in orphans]:
            try:
                os.remove(f)
            except FileNotFoundError:
                print(f"File not found: {f}")
            except Exception as e:
                print(f"Error deleting file {f}: {e}")
        orphans = find_orphans()

    return [img[1] for img in orphans]
