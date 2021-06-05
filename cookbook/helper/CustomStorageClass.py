import hashlib

from django.conf import settings
from django.core.cache import cache
from storages.backends.s3boto3 import S3Boto3Storage


class CachedS3Boto3Storage(S3Boto3Storage):
    def url(self, name, **kwargs):
        key = hashlib.md5(f'recipes_media_urls_{name}'.encode('utf-8')).hexdigest()
        if result := cache.get(key):
            return result

        result = super(CachedS3Boto3Storage, self).url(name, **kwargs)

        timeout = int(settings.AWS_QUERYSTRING_EXPIRE * .95)
        cache.set(key, result, timeout)

        return result
