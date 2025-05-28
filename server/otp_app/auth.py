from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework import exceptions
from jose import jwt
from decouple import config

User = get_user_model()

class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            # Extract the token
            auth_parts = auth_header.split()
            if auth_parts[0].lower() != 'bearer':
                return None
            token = auth_parts[1]

            # Verify the token
            payload = jwt.decode(
                token,
                config('SUPABASE_JWT_SECRET'),
                algorithms=['HS256'],
                options={
                    'verify_sub': True,
                }
            )

            # Get the user from the payload
            user_id = payload.get('sub')
            if user_id is None:
                raise exceptions.AuthenticationFailed('Invalid token payload')

            try:
                user = User.objects.get(supabase_uid=user_id)
            except User.DoesNotExist:
                # Create a new user if they don't exist
                email = payload.get('email')
                if not email:
                    raise exceptions.AuthenticationFailed('Email not found in token')
                user = User.objects.create(
                    email=email,
                    supabase_uid=user_id,
                    is_active=True
                )

            return (user, token)

        except jwt.JWTError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))

    def authenticate_header(self, request):
        return 'Bearer'
