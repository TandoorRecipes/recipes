from django.db import migrations


def convert_customfilter_data(apps, schema_editor):
    """Migrate CustomFilter.search JSON from Vue 2 format to current format.

    Handles three transformations in a single pass:
      1. Rename _or aliases (keywords_or → keywords, etc.)
      2. Split sign-prefixed scalars into _gte/_lte
      3. Convert unrated representations (unrated_only/rating=0 → unrated: true)
    """
    CustomFilter = apps.get_model('cookbook', 'CustomFilter')
    for cf in CustomFilter.objects.all():
        data = cf.search
        if not isinstance(data, dict):
            continue
        if data.get('version') == '2':
            # Already migrated — just handle unrated conversion
            changed = False
            if data.get('unrated_only') is True:
                del data['unrated_only']
                data['unrated'] = True
                changed = True
            if data.get('rating') == 0 or data.get('rating') == '0':
                del data['rating']
                data['unrated'] = True
                changed = True
            if changed:
                cf.search = data
                cf.save(update_fields=['search'])
            continue

        # Rename _or aliases to bare keys
        for old, new in [('keywords_or', 'keywords'), ('foods_or', 'foods'), ('books_or', 'books')]:
            if old in data:
                existing = data.get(new, [])
                if isinstance(existing, list) and isinstance(data[old], list):
                    data[new] = existing + data[old]
                else:
                    data[new] = data[old]
                del data[old]

        # Split sign-prefixed scalars into _gte/_lte
        for field in ('cookedon', 'viewedon', 'createdon', 'updatedon', 'rating', 'timescooked'):
            val = data.get(field)
            if val is not None and isinstance(val, (str, int, float)):
                s = str(val)
                if s.startswith('-'):
                    data[f'{field}_lte'] = s[1:]
                else:
                    data[f'{field}_gte'] = s
                del data[field]

        # Convert unrated representations
        if data.get('unrated_only') is True:
            del data['unrated_only']
            data['unrated'] = True
        if data.get('rating_gte') == '0' or data.get('rating_gte') == 0:
            del data['rating_gte']
            data['unrated'] = True

        data['version'] = '2'
        cf.search = data
        cf.save(update_fields=['search'])


class Migration(migrations.Migration):

    dependencies = [
        ('cookbook', '0244_cooklog_rating_zero_to_null'),
    ]

    operations = [
        migrations.RunPython(convert_customfilter_data, migrations.RunPython.noop),
    ]
