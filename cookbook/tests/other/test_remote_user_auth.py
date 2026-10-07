import pytest
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from cookbook.helper.remote_user_helper import CustomRemoteUserBackend

User = get_user_model()


@pytest.fixture
def rf():
    return RequestFactory()


@pytest.fixture
def backend():
    return CustomRemoteUserBackend()


@pytest.mark.django_db
class TestCustomRemoteUserBackend:
    """Test cases for CustomRemoteUserBackend."""

    def test_authenticate_creates_user_with_username_only(self, rf, backend):
        """Test that authentication creates a user with just username."""
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        
        user = backend.authenticate(request, remote_user='testuser')
        
        assert user is not None
        assert user.username == 'testuser'
        assert User.objects.filter(username='testuser').exists()

    def test_authenticate_updates_email_from_header(self, rf, backend):
        """Test that authentication updates user email from REMOTE_EMAIL header."""
        # Create user first
        user = User.objects.create_user(username='testuser', email='old@example.com')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_EMAIL'] = 'new@example.com'
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        assert authenticated_user.email == 'new@example.com'
        user.refresh_from_db()
        assert user.email == 'new@example.com'

    def test_authenticate_updates_name_from_header(self, rf, backend):
        """Test that authentication updates user name from REMOTE_NAME header."""
        # Create user first
        user = User.objects.create_user(username='testuser')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_NAME'] = 'John Doe'
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        assert authenticated_user.first_name == 'John'
        assert authenticated_user.last_name == 'Doe'
        user.refresh_from_db()
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'

    def test_authenticate_handles_single_name(self, rf, backend):
        """Test that authentication handles single name (no last name)."""
        user = User.objects.create_user(username='testuser')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_NAME'] = 'Madonna'
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        assert authenticated_user.first_name == 'Madonna'
        assert authenticated_user.last_name == ''

    def test_authenticate_updates_both_email_and_name(self, rf, backend):
        """Test that authentication updates both email and name simultaneously."""
        user = User.objects.create_user(username='testuser')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_EMAIL'] = 'john.doe@example.com'
        request.META['HTTP_REMOTE_NAME'] = 'John Doe'
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        assert authenticated_user.email == 'john.doe@example.com'
        assert authenticated_user.first_name == 'John'
        assert authenticated_user.last_name == 'Doe'

    def test_authenticate_does_not_save_if_no_changes(self, rf, backend, mocker):
        """Test that user is not saved if no changes are made."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='John',
            last_name='Doe'
        )
        
        # Mock the save method to track if it's called
        mock_save = mocker.patch.object(User, 'save')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_EMAIL'] = 'test@example.com'
        request.META['HTTP_REMOTE_NAME'] = 'John Doe'
        
        backend.authenticate(request, remote_user='testuser')
        
        # Save should not be called since nothing changed
        mock_save.assert_not_called()

    def test_authenticate_with_empty_headers(self, rf, backend):
        """Test that authentication works with empty additional headers."""
        user = User.objects.create_user(username='testuser')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_EMAIL'] = ''
        request.META['HTTP_REMOTE_NAME'] = ''
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        assert authenticated_user is not None
        assert authenticated_user.username == 'testuser'

    def test_authenticate_returns_none_for_invalid_user(self, rf, backend):
        """Test that authentication returns None for invalid remote_user."""
        request = rf.get('/')
        
        authenticated_user = backend.authenticate(request, remote_user=None)
        
        assert authenticated_user is None

    def test_authenticate_creates_new_user_with_all_info(self, rf, backend):
        """Test that authentication creates a new user with all provided info."""
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'newuser'
        request.META['HTTP_REMOTE_EMAIL'] = 'newuser@example.com'
        request.META['HTTP_REMOTE_NAME'] = 'New User'
        
        authenticated_user = backend.authenticate(request, remote_user='newuser')
        
        assert authenticated_user is not None
        assert authenticated_user.username == 'newuser'
        assert authenticated_user.email == 'newuser@example.com'
        assert authenticated_user.first_name == 'New'
        assert authenticated_user.last_name == 'User'
        assert User.objects.filter(username='newuser').exists()

    def test_authenticate_handles_multiple_spaces_in_name(self, rf, backend):
        """Test that authentication handles names with multiple spaces."""
        user = User.objects.create_user(username='testuser')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_NAME'] = 'John   Paul   Smith'
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        # Should split on first space only
        assert authenticated_user.first_name == 'John'
        assert authenticated_user.last_name == 'Paul   Smith'

    def test_authenticate_strips_whitespace_from_name(self, rf, backend):
        """Test that authentication strips leading/trailing whitespace from names."""
        user = User.objects.create_user(username='testuser')
        
        request = rf.get('/')
        request.META['REMOTE_USER'] = 'testuser'
        request.META['HTTP_REMOTE_NAME'] = '  John Doe  '
        
        authenticated_user = backend.authenticate(request, remote_user='testuser')
        
        assert authenticated_user.first_name == 'John'
        assert authenticated_user.last_name == 'Doe'
