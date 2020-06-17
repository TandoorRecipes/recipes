# Permission Config
from cookbook.helper.permission_helper import CustomIsUser, CustomIsOwner, CustomIsAdmin, CustomIsGuest


class PermissionConfig:
    BOOKS = {
        'owner': True,
        'groups': ['user'],
        'drf': [CustomIsUser],
    }
