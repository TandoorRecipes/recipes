import os
import re
from datetime import datetime, timedelta
from io import StringIO
from uuid import UUID

import redis
from django.apps import apps
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import models
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.datetime_safe import date
from django.utils.translation import gettext as _
from django_scopes import scopes_disabled

from cookbook.forms import CommentForm, Recipe, SearchPreferenceForm, SpaceCreateForm, SpaceJoinForm, User, UserCreateForm, UserPreference
from cookbook.helper.HelperFunctions import str2bool
from cookbook.helper.permission_helper import group_required, has_group_permission, share_link_valid, switch_user_active_space
from cookbook.models import Comment, CookLog, InviteLink, SearchFields, SearchPreference, ShareLink, Space, UserSpace, ViewLog
from cookbook.tables import CookLogTable, ViewLogTable
from cookbook.templatetags.theming_tags import get_theming_values
from cookbook.version_info import VERSION_INFO
from recipes.settings import PLUGINS


def index(request):
    with scopes_disabled():
        if not request.user.is_authenticated:
            if User.objects.count() < 1 and 'django.contrib.auth.backends.RemoteUserBackend' not in settings.AUTHENTICATION_BACKENDS:
                return HttpResponseRedirect(reverse_lazy('view_setup'))
            return HttpResponseRedirect(reverse_lazy('view_search'))

    try:
        page_map = {UserPreference.SEARCH: reverse_lazy('view_search'), UserPreference.PLAN: reverse_lazy('view_plan'), UserPreference.BOOKS: reverse_lazy('view_books'),
                    UserPreference.SHOPPING: reverse_lazy('view_shopping'), }

        return HttpResponseRedirect(page_map.get(request.user.userpreference.default_page))
    except UserPreference.DoesNotExist:
        return HttpResponseRedirect(reverse('view_search'))


# TODO need to deprecate
def search(request):
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
                                                     )

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


def recipe_view(request, pk, share=None):
    with scopes_disabled():
        recipe = get_object_or_404(Recipe, pk=pk)

        if not request.user.is_authenticated and not share_link_valid(recipe, share):
            messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('account_login') + '?next=' + request.path)

        if not (has_group_permission(request.user, ('guest',)) and recipe.space == request.space) and not share_link_valid(recipe, share):
            messages.add_message(request, messages.ERROR, _('You do not have the required permissions to view this page!'))
            return HttpResponseRedirect(reverse('index'))

        comments = Comment.objects.filter(recipe__space=request.space, recipe=recipe)

        if request.method == "POST":
            if not request.user.is_authenticated:
                messages.add_message(request, messages.ERROR, _('You do not have the required permissions to perform this action!'))
                return HttpResponseRedirect(reverse('view_recipe', kwargs={'pk': recipe.pk, 'share': share}))

            comment_form = CommentForm(request.POST, prefix='comment')
            if comment_form.is_valid():
                comment = Comment()
                comment.recipe = recipe
                comment.text = comment_form.cleaned_data['text']
                comment.created_by = request.user
                comment.save()

                messages.add_message(request, messages.SUCCESS, _('Comment saved!'))

        comment_form = CommentForm()

        if request.user.is_authenticated:
            if not ViewLog.objects.filter(recipe=recipe, created_by=request.user, created_at__gt=(timezone.now() - timezone.timedelta(minutes=5)), space=request.space).exists():
                ViewLog.objects.create(recipe=recipe, created_by=request.user, space=request.space)

        servings = recipe.servings
        if request.method == "GET" and 'servings' in request.GET:
            servings = request.GET.get("servings")
        return render(request, 'recipe_view.html', {'recipe': recipe, 'comments': comments, 'comment_form': comment_form, 'share': share, 'servings': servings})


@group_required('user')
def books(request):
    return render(request, 'books.html', {})


@group_required('user')
def meal_plan(request):
    return render(request, 'meal_plan.html', {})


@group_required('guest')
def user_settings(request):
    if request.space.demo:
        messages.add_message(request, messages.ERROR, _('This feature is not available in the demo version!'))
        return redirect('index')

    return render(request, 'user_settings.html', {})


@group_required('user')
def ingredient_editor(request):
    template_vars = {'food_id': -1, 'unit_id': -1}
    food_id = request.GET.get('food_id', None)
    if food_id and re.match(r'^(\d)+$', food_id):
        template_vars['food_id'] = food_id

    unit_id = request.GET.get('unit_id', None)
    if unit_id and re.match(r'^(\d)+$', unit_id):
        template_vars['unit_id'] = unit_id
    return render(request, 'ingredient_editor.html', template_vars)


@group_required('user')
def property_editor(request, pk):
    return render(request, 'property_editor.html', {'recipe_id': pk})


@group_required('guest')
def shopping_settings(request):
    if request.space.demo:
        messages.add_message(request, messages.ERROR, _('This feature is not available in the demo version!'))
        return redirect('index')

    sp = request.user.searchpreference
    search_error = False

    if request.method == "POST":
        if 'search_form' in request.POST:
            search_form = SearchPreferenceForm(request.POST, prefix='search')
            if search_form.is_valid():
                if not sp:
                    sp = SearchPreferenceForm(user=request.user)
                fields_searched = (len(search_form.cleaned_data['icontains']) + len(search_form.cleaned_data['istartswith']) + len(search_form.cleaned_data['trigram'])
                                   + len(search_form.cleaned_data['fulltext']))
                if search_form.cleaned_data['preset'] == 'fuzzy':
                    sp.search = SearchPreference.SIMPLE
                    sp.lookup = True
                    sp.unaccent.set([SearchFields.objects.get(name='Name')])
                    sp.icontains.set([SearchFields.objects.get(name='Name')])
                    sp.istartswith.clear()
                    sp.trigram.set([SearchFields.objects.get(name='Name')])
                    sp.fulltext.clear()
                    sp.trigram_threshold = 0.2
                    sp.save()
                elif search_form.cleaned_data['preset'] == 'precise':
                    sp.search = SearchPreference.WEB
                    sp.lookup = True
                    sp.unaccent.set(SearchFields.objects.all())
                    # full text on food is very slow, add search_vector field and index it (including Admin functions and postsave signal to rebuild index)
                    sp.icontains.set([SearchFields.objects.get(name='Name')])
                    sp.istartswith.set([SearchFields.objects.get(name='Name')])
                    sp.trigram.clear()
                    sp.fulltext.set(SearchFields.objects.filter(name__in=['Ingredients']))
                    sp.trigram_threshold = 0.2
                    sp.save()
                elif fields_searched == 0:
                    search_form.add_error(None, _('You must select at least one field to search!'))
                    search_error = True
                elif search_form.cleaned_data['search'] in ['websearch', 'raw'] and len(search_form.cleaned_data['fulltext']) == 0:
                    search_form.add_error('search', _('To use this search method you must select at least one full text search field!'))
                    search_error = True
                elif search_form.cleaned_data['search'] in ['websearch', 'raw'] and len(search_form.cleaned_data['trigram']) > 0:
                    search_form.add_error(None, _('Fuzzy search is not compatible with this search method!'))
                    search_error = True
                else:
                    sp.search = search_form.cleaned_data['search']
                    sp.lookup = search_form.cleaned_data['lookup']
                    sp.unaccent.set(search_form.cleaned_data['unaccent'])
                    sp.icontains.set(search_form.cleaned_data['icontains'])
                    sp.istartswith.set(search_form.cleaned_data['istartswith'])
                    sp.trigram.set(search_form.cleaned_data['trigram'])
                    sp.fulltext.set(search_form.cleaned_data['fulltext'])
                    sp.trigram_threshold = search_form.cleaned_data['trigram_threshold']
                    sp.save()
            else:
                search_error = True

    fields_searched = len(sp.icontains.all()) + len(sp.istartswith.all()) + len(sp.trigram.all()) + len(sp.fulltext.all())
    if sp and not search_error and fields_searched > 0:
        search_form = SearchPreferenceForm(instance=sp)
    elif not search_error:
        search_form = SearchPreferenceForm()

    # these fields require postgresql - just disable them if postgresql isn't available
    if not settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
        sp.search = SearchPreference.SIMPLE
        sp.trigram.clear()
        sp.fulltext.clear()
        sp.save()

    return render(request, 'settings.html', {'search_form': search_form, })


@group_required('guest')
def history(request):
    view_log = ViewLogTable(ViewLog.objects.filter(created_by=request.user, space=request.space).order_by('-created_at').all(), prefix="viewlog-")
    view_log.paginate(page=request.GET.get("viewlog-page", 1), per_page=25)

    cook_log = CookLogTable(CookLog.objects.filter(created_by=request.user).order_by('-created_at').all(), prefix="cooklog-")
    cook_log.paginate(page=request.GET.get("cooklog-page", 1), per_page=25)
    return render(request, 'history.html', {'view_log': view_log, 'cook_log': cook_log})


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
            d = (date.today() - timedelta(days=i)).isoformat()
            api_stats[0].append(d)
            api_space_stats[0].append(d)
            total_stats.append(int(r.get(f'api:request-count:{d}')) if r.get(f'api:request-count:{d}') else 0)

        api_stats.append(total_stats)

        for x in r.zrange('api:endpoint-request-count', 0, -1, withscores=True, desc=True):
            endpoint = x[0].decode('utf-8')
            endpoint_stats = [endpoint, x[1]]
            for i in range(0, 6):
                d = (date.today() - timedelta(days=i)).isoformat()
                endpoint_stats.append(r.zscore(f'api:endpoint-request-count:{d}', endpoint))
            api_stats.append(endpoint_stats)

        for x in r.zrange('api:space-request-count', 0, 20, withscores=True, desc=True):
            s = x[0].decode('utf-8')
            space_stats = [Space.objects.get(pk=s).name, x[1]]
            for i in range(0, 6):
                d = (date.today() - timedelta(days=i)).isoformat()
                space_stats.append(r.zscore(f'api:space-request-count:{d}', s))
            api_space_stats.append(space_stats)

    return render(
        request, 'system.html', {
            'gunicorn_media': settings.GUNICORN_MEDIA, 'debug': settings.DEBUG, 'postgres': postgres, 'postgres_version': postgres_ver, 'postgres_status': database_status,
            'postgres_message': database_message, 'version_info': VERSION_INFO, 'plugins': PLUGINS, 'secret_key': secret_key, 'orphans': orphans, 'migration_info': migration_info,
            'missing_migration': missing_migration, 'allowed_hosts': settings.ALLOWED_HOSTS, 'api_stats': api_stats, 'api_space_stats': api_space_stats
        })


def setup(request):
    with scopes_disabled():
        if User.objects.count() > 0 or 'django.contrib.auth.backends.RemoteUserBackend' in settings.AUTHENTICATION_BACKENDS:
            messages.add_message(
                request, messages.ERROR,
                _('The setup page can only be used to create the first user! \
                    If you have forgotten your superuser credentials please consult the django documentation on how to reset passwords.'
                  ))
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


@group_required('admin')
def space_manage(request, space_id):
    if request.space.demo:
        messages.add_message(request, messages.ERROR, _('This feature is not available in the demo version!'))
        return redirect('index')
    space = get_object_or_404(Space, id=space_id)
    switch_user_active_space(request.user, space)
    return render(request, 'space_manage.html', {})


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

    icons = [{"src": theme_values['logo_color_svg'], "sizes": "any"}, {"src": theme_values['logo_color_144'], "type": "image/png", "sizes": "144x144"},
             {"src": theme_values['logo_color_512'], "type": "image/png", "sizes": "512x512"}]

    manifest_info = {
        "name":
            theme_values['app_name'], "short_name":
            theme_values['app_name'], "description":
            _("Manage recipes, shopping list, meal plans and more."), "icons":
            icons, "start_url":
            "./", "background_color":
            theme_values['nav_bg_color'], "display":
            "standalone", "scope":
            ".", "theme_color":
            theme_values['nav_bg_color'], "shortcuts":
            [{"name": _("Plan"), "short_name": _("Plan"), "description": _("View your meal Plan"), "url":
                "./plan"}, {"name": _("Books"), "short_name": _("Books"), "description": _("View your cookbooks"), "url": "./books"},
             {"name": _("Shopping"), "short_name": _("Shopping"), "description": _("View your shopping lists"), "url":
                 "./shopping/"}], "share_target": {"action": "/data/import/url", "method": "GET", "params": {"title": "title", "url": "url", "text": "text"}}
    }

    return JsonResponse(manifest_info, json_dumps_params={'indent': 4})


def markdown_info(request):
    return render(request, 'markdown_info.html', {})


def search_info(request):
    return render(request, 'search_info.html', {})


@group_required('guest')
def api_info(request):
    return render(request, 'api_info.html', {})


def offline(request):
    return render(request, 'offline.html', {})


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
