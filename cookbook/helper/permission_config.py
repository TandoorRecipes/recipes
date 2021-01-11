from cookbook.helper.permission_helper import CustomIsUser


class PermissionConfig:
    BOOKS = {
        'owner': True,
        'groups': ['user'],
        'drf': [CustomIsUser],
    }
