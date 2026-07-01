from django.contrib.auth.backends import RemoteUserBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomRemoteUserBackend(RemoteUserBackend):
    """
    Custom RemoteUserBackend that updates user information from reverse proxy headers.
    
    Supports extracting and updating:
    - Username from REMOTE_USER header (standard)
    - First/Last name from REMOTE_NAME header
    - Email from REMOTE_EMAIL header
    """
    
    def authenticate(self, request, remote_user):
        """
        Authenticate the user and update their profile information from headers.
        """
        if not remote_user:
            return None
        
        user = super().authenticate(request, remote_user)
        
        if user:
            # Update user information from headers if they exist
            updated = False
            
            # Get headers from request META
            remote_name = request.META.get('HTTP_REMOTE_NAME', '')
            remote_email = request.META.get('HTTP_REMOTE_EMAIL', '')
            
            # Update email if provided and different
            if remote_email and user.email != remote_email:
                user.email = remote_email
                updated = True
            
            # Update name if provided
            if remote_name:
                # Split name into first and last name
                # Assumes format: "FirstName LastName" or "FirstName"
                name_parts = remote_name.strip().split(None, 1)
                
                first_name = name_parts[0] if len(name_parts) > 0 else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                if user.first_name != first_name:
                    user.first_name = first_name
                    updated = True
                
                if user.last_name != last_name:
                    user.last_name = last_name
                    updated = True
            
            # Save user if any changes were made
            if updated:
                user.save()
        
        return user
