from django.conf import settings
from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET


def _check_database():
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
        cursor.fetchone()


def _check_cache():
    cache.set('health_check', '1', 5)
    if cache.get('health_check') != '1':
        raise RuntimeError('cache round trip failed')


@require_GET
@never_cache
def health(request):
    """
    Unauthenticated liveness/readiness probe. Reports database status and, if Redis is configured, cache status.
    Returns 200 when all checks pass and 503 otherwise. Error details are not exposed.
    """
    checks = {'database': _check_database}
    if settings.REDIS_HOST:
        checks['cache'] = _check_cache

    results = {}
    for name, check in checks.items():
        try:
            check()
            results[name] = 'ok'
        except Exception:
            results[name] = 'error'

    healthy = all(v == 'ok' for v in results.values())
    return JsonResponse({'status': 'ok' if healthy else 'error', 'checks': results}, status=200 if healthy else 503)
