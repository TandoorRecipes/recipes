# Richer Reverse Proxy Authentication - Implementation Notes

## Overview
This implementation adds support for richer reverse proxy authentication in Tandoor Recipes, addressing GitHub issue #1134.

## Changes Made

### 1. New Backend: `cookbook/helper/remote_user_helper.py`
Created a custom `CustomRemoteUserBackend` that extends Django's `RemoteUserBackend` to:
- Extract and update user email from `HTTP_REMOTE_EMAIL` header
- Extract and update user first/last name from `HTTP_REMOTE_NAME` header
- Automatically update user information on each login
- Only save user object if changes were detected

**Key Features:**
- Handles names with various formats (single name, multiple spaces, etc.)
- Strips whitespace from names
- Splits name into first and last name on first space
- Updates only when values differ from existing data

### 2. Settings Changes: `recipes/settings.py`
- Added `REVERSE_PROXY_AUTH_LOGOUT` environment variable support
- Changed authentication backend from Django's default `RemoteUserBackend` to our custom `CustomRemoteUserBackend`
- Configuration is only active when `REMOTE_USER_AUTH=1`

### 3. URL Configuration: `recipes/urls.py`
- Added conditional URL override for logout when using reverse proxy auth
- When `REMOTE_USER_AUTH=1` and `REVERSE_PROXY_AUTH_LOGOUT` is set, logout redirects to the custom URL
- Uses Django's `RedirectView` for clean redirection

### 4. Documentation Updates

#### `docs/features/authentication.md`
- Added section on "User Information from Headers"
- Added section on "Custom Logout URL"
- Updated nginx configuration example to show all three headers:
  - `REMOTE-USER` (username)
  - `REMOTE-NAME` (full name)
  - `REMOTE-EMAIL` (email address)
- Removed old nginx logout location block (now handled by environment variable)

#### `docs/system/configuration.md`
- Added documentation for `REVERSE_PROXY_AUTH_LOGOUT` environment variable
- Explained when it takes effect and how it works with SSO providers

### 5. Tests: `cookbook/tests/other/test_remote_user_auth.py`
Comprehensive test suite covering:
- User creation with username only
- Email updates from headers
- Name updates from headers
- Single name handling
- Combined email and name updates
- No-op when data hasn't changed
- Empty header handling
- Invalid user handling
- New user creation with all info
- Multiple spaces in names
- Whitespace trimming

## Usage

### Environment Variables

```ini
# Enable reverse proxy authentication
REMOTE_USER_AUTH=1

# Optional: Custom logout URL for SSO
REVERSE_PROXY_AUTH_LOGOUT=https://authelia.example.com/logout
```

### Nginx Configuration Example

```nginx
location / {
  proxy_set_header Host $host;
  proxy_pass http://web_recipes:8080;

  include /config/nginx/authelia.conf;

  # Set all three headers from your SSO provider
  auth_request_set $user $upstream_http_remote_user;
  auth_request_set $name $upstream_http_remote_name;
  auth_request_set $email $upstream_http_remote_email;
  
  proxy_set_header REMOTE-USER $user;
  proxy_set_header REMOTE-NAME $name;
  proxy_set_header REMOTE-EMAIL $email;
}
```

### Authelia Configuration

Authelia should be configured to pass these headers:

```yaml
access_control:
  default_policy: deny
  rules:
    - domain: recipes.example.com
      policy: one_factor
      subject:
        - "group:recipes_users"
```

Headers will be automatically set by Authelia based on user attributes in your identity provider.

## Benefits

1. **Automatic User Sync**: User information (name, email) automatically syncs from SSO provider
2. **Simplified User Management**: No need to manually update user details in both SSO and Tandoor
3. **Better Invite System**: Email addresses are now populated, making the invite system fully functional
4. **Clean SSO Logout**: Users can properly log out from the SSO provider, not just Tandoor
5. **Backward Compatible**: Existing setups continue to work; new features are opt-in via headers

## Security Considerations

- The implementation maintains the same security posture as the existing `REMOTE_USER_AUTH`
- **WARNING**: `REMOTE_USER_AUTH=1` should only be enabled when using a properly configured reverse proxy
- Headers should only be accepted from trusted proxies
- Consider using firewall rules to ensure Tandoor is only accessible via the reverse proxy

## Testing

Run the manual test script:
```bash
python test_reverse_proxy_auth.py
```

Run the full test suite (when pytest is available):
```bash
python -m pytest cookbook/tests/other/test_reverse_user_auth.py -v
```

## Migration Notes

For existing deployments:
1. Update your nginx configuration to pass the additional headers
2. Set `REVERSE_PROXY_AUTH_LOGOUT` if desired
3. Restart Tandoor
4. User information will be updated on next login

No database migrations are required.

## Future Enhancements

Possible improvements for future versions:
- Support for group/role synchronization from SSO provider
- Configurable header names via environment variables
- Support for additional user attributes (phone, avatar, etc.)
- Admin UI for viewing/managing SSO-linked users

## Related Issues

- Closes #1134 - Richer reverse proxy authentication
- Related to #1307 - Support setting LOGOUT_REDIRECT_URL via env

## Author

Implementation by [Your Name] on 2026-07-01
