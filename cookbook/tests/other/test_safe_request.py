import requests
import pytest
from unittest.mock import patch, MagicMock
from cookbook.helper.HelperFunctions import safe_request

def test_safe_request_usda_url():
    with patch('requests.request') as mock_request:
        mock_response = MagicMock()
        mock_response.is_redirect = False
        mock_response.status_code = 200
        mock_response.content = b'Success'
        mock_request.return_value = mock_response

        url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=potato&dataType=Foundation,Survey (FNDDS),SR Legacy'
        response = safe_request('GET', url)

        # Ensure the URL called by requests matches our expectations
        # It should have spaces encoded as %20, but commas and parentheses should remain literal
        expected_url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=potato&dataType=Foundation,Survey%20(FNDDS),SR%20Legacy'
        mock_request.assert_called_once_with('GET', expected_url, allow_redirects=False)

def test_safe_request_success():
    with patch('requests.request') as mock_request:
        mock_response = MagicMock()
        mock_response.is_redirect = False
        mock_response.status_code = 200
        mock_response.content = b'Success'
        mock_request.return_value = mock_response
        
        response = safe_request('GET', 'https://example.com')
        
        assert response.content == b'Success'
        mock_request.assert_called_once_with('GET', 'https://example.com', allow_redirects=False)

def test_safe_request_safe_redirect():
    with patch('requests.request') as mock_request:
        # First response: redirect
        mock_redirect = MagicMock()
        mock_redirect.is_redirect = True
        mock_redirect.status_code = 302
        mock_redirect.headers = {'Location': 'https://example.com/target'}
        mock_redirect.url = 'https://example.com/source'
        
        # Second response: success
        mock_success = MagicMock()
        mock_success.is_redirect = False
        mock_success.status_code = 200
        mock_success.content = b'Target Content'
        
        mock_request.side_effect = [mock_redirect, mock_success]
        
        # Patching validate_import_url to always return True for this test
        with patch('cookbook.helper.HelperFunctions.validate_import_url', return_value=True):
            response = safe_request('GET', 'https://example.com/source')
            
            assert response.content == b'Target Content'
            assert mock_request.call_count == 2
            mock_request.assert_any_call('GET', 'https://example.com/source', allow_redirects=False)
            mock_request.assert_any_call('GET', 'https://example.com/target', allow_redirects=False)

def test_safe_request_relative_redirect():
    with patch('requests.request') as mock_request:
        # First response: relative redirect
        mock_redirect = MagicMock()
        mock_redirect.is_redirect = True
        mock_redirect.status_code = 302
        mock_redirect.headers = {'Location': '/relative'}
        mock_redirect.url = 'https://example.com/base'
        
        # Second response: success
        mock_success = MagicMock()
        mock_success.is_redirect = False
        mock_success.status_code = 200
        mock_success.content = b'Relative Success'
        
        mock_request.side_effect = [mock_redirect, mock_success]
        
        with patch('cookbook.helper.HelperFunctions.validate_import_url', return_value=True):
            response = safe_request('GET', 'https://example.com/base')
            
            assert response.content == b'Relative Success'
            assert mock_request.call_count == 2
            mock_request.assert_any_call('GET', 'https://example.com/base', allow_redirects=False)
            mock_request.assert_any_call('GET', 'https://example.com/relative', allow_redirects=False)

def test_safe_request_unsafe_redirect_blocked():
    with patch('requests.request') as mock_request:
        # First response: redirect to local IP
        mock_redirect = MagicMock()
        mock_redirect.is_redirect = True
        mock_redirect.status_code = 302
        mock_redirect.headers = {'Location': 'http://127.0.0.1/admin'}
        mock_redirect.url = 'https://example.com'
        
        mock_request.return_value = mock_redirect
        
        # The first call to safe_request will validate the initial URL.
        # We need validate_import_url to return True for example.com but False for 127.0.0.1
        def side_effect_validate(url):
            if '127.0.0.1' in url or 'localhost' in url:
                return False
            return True
            
        with patch('cookbook.helper.HelperFunctions.validate_import_url', side_effect=side_effect_validate):
            with pytest.raises(requests.exceptions.RequestException) as excinfo:
                safe_request('GET', 'https://example.com')
            assert "is not allowed" in str(excinfo.value)
            assert mock_request.call_count == 1 # Blocked before second request

def test_safe_request_circular_redirect():
    with patch('requests.request') as mock_request:
        mock_redirect = MagicMock()
        mock_redirect.is_redirect = True
        mock_redirect.status_code = 302
        mock_redirect.headers = {'Location': 'https://example.com/a'}
        mock_redirect.url = 'https://example.com/a'
        
        mock_request.return_value = mock_redirect
        
        with patch('cookbook.helper.HelperFunctions.validate_import_url', return_value=True):
            with pytest.raises(requests.exceptions.RequestException) as excinfo:
                safe_request('GET', 'https://example.com/a')
            assert "Circular redirect detected" in str(excinfo.value)

def test_safe_request_too_many_redirects():
    with patch('requests.request') as mock_request:
        def create_redirect(i):
            m = MagicMock()
            m.is_redirect = True
            m.status_code = 302
            m.headers = {'Location': f'https://example.com/{i+1}'}
            m.url = f'https://example.com/{i}'
            return m
            
        mock_request.side_effect = [create_redirect(i) for i in range(11)]
        
        with patch('cookbook.helper.HelperFunctions.validate_import_url', return_value=True):
            with pytest.raises(requests.exceptions.RequestException) as excinfo:
                safe_request('GET', 'https://example.com/0')
            assert "Too many redirects" in str(excinfo.value)

def test_httpbin_mock_redirect():
    """
    Tests the logic requested by user using httpbin-like URLs but mocked.
    """
    url = "https://httpbin.org/redirect-to?url=http://127.0.0.1/secret"
    
    with patch('requests.request') as mock_request:
        mock_redirect = MagicMock()
        mock_redirect.is_redirect = True
        mock_redirect.status_code = 302
        mock_redirect.headers = {'Location': 'http://127.0.0.1/secret'}
        mock_redirect.url = url
        
        mock_request.return_value = mock_redirect
        
        # Should be allowed to start, but blocked on redirect
        from urllib.parse import urlparse
        def side_effect_validate(u):
            parsed = urlparse(u)
            # Block only when the actual target hostname is local
            if parsed.hostname in ('127.0.0.1', 'localhost'):
                return False
            # Allow httpbin initial URL even if query string contains a local URL
            if parsed.hostname and 'httpbin.org' in parsed.hostname:
                return True
            return True
            
        with patch('cookbook.helper.HelperFunctions.validate_import_url', side_effect=side_effect_validate):
            with pytest.raises(requests.exceptions.RequestException) as excinfo:
                safe_request('GET', url)
            assert "URL http://127.0.0.1/secret is not allowed" in str(excinfo.value)

def test_safe_request_validate_initial_url_fails():
    with patch('cookbook.helper.HelperFunctions.validate_import_url', return_value=False):
        with pytest.raises(requests.exceptions.RequestException) as excinfo:
            safe_request('GET', 'https://malicious.com')
        assert "URL https://malicious.com is not allowed" in str(excinfo.value)
