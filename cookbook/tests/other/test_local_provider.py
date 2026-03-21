import os
from django.test import TestCase, override_settings
from cookbook.provider.local import Local
from cookbook.models import Recipe

class LocalProviderTest(TestCase):

    @override_settings(LOCAL_STORAGE_PATHS=['/tmp/allowed'])
    def test_is_path_allowed(self):
        # Normal allowed path
        self.assertTrue(Local.is_path_allowed('/tmp/allowed/recipe.pdf'))
        # Path outside
        self.assertFalse(Local.is_path_allowed('/etc/passwd'))
        # Attempt to traverse out
        self.assertFalse(Local.is_path_allowed('/tmp/allowed/../forbidden/recipe.pdf'))

    @override_settings(LOCAL_STORAGE_PATHS=['/tmp/allowed'])
    def test_get_file_restriction(self):
        recipe = Recipe(file_path='/etc/passwd')
        with self.assertRaises(Exception) as cm:
            Local.get_file(recipe)
        self.assertEqual(str(cm.exception), 'Path not allowed')

    @override_settings(LOCAL_STORAGE_PATHS=['/tmp/allow'])
    def test_path_prefix_attack(self):
        # Path that starts with allowed prefix but is a different directory
        self.assertFalse(Local.is_path_allowed('/tmp/allowed_secret/file.txt'))
        self.assertTrue(Local.is_path_allowed('/tmp/allow/file.txt'))
