import json
import re
import secrets
from django.shortcuts import render, redirect
from .forms import RegisterForm
from .models import OtpToken
from django.contrib import messages
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.utils import timezone
from django.core.mail import send_mail
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from django.contrib.auth import logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie


from decouple import config
import os


def signup(request):
    if request.method == 'POST':
        try:
            # Parse JSON request body
            data = json.loads(request.body)

            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            email = data.get('email', '').strip()
            username = data.get('username', '').strip()
            password1 = data.get('password1', '')
            password2 = data.get('password2', '')

            # Validate required fields
            if not all([first_name, last_name, email, username, password1, password2]):
                return JsonResponse({
                    'success': False,
                    'message': "All fields are required."
                }, status=400)

            # Validate email format
            if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                return JsonResponse({
                    'success': False,
                    'message': "Invalid email format."
                }, status=400)

            # Validate username uniqueness
            User = get_user_model()
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': "Username already taken."
                }, status=400)

            # Validate email uniqueness
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': "Email already registered."
                }, status=400)

            # Validate password match
            if password1 != password2:
                return JsonResponse({
                    'success': False,
                    'message': "Passwords do not match."
                }, status=400)

            # Validate password complexity (must contain letters and numbers)
            if not (re.search(r"[A-Za-z]", password1) and re.search(r"[0-9]", password1)):
                return JsonResponse({
                    'success': False,
                    'message': "Password must contain both letters and numbers."
                }, status=400)

            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1,
                first_name=first_name,
                last_name=last_name
            )
            user.is_active = False  # User needs to verify OTP first
            user.save()

            return JsonResponse({
                'success': True,
                'message': "Signup successful. Please verify your email."
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': "Invalid JSON format."
            }, status=400)

    return JsonResponse({
        'success': False,
        'message': "Invalid request method. Please use POST."
    }, status=405)


def verify_email(request, email):
    try:
        user = get_user_model().objects.get(email=email)
    except get_user_model().DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'User with this email does not exist.'
        }, status=404)

    user_otp = OtpToken.objects.filter(user=user).last()
    if not user_otp:
        return JsonResponse({
            'success': False,
            'message': 'No OTP found for this user.'
        }, status=404)

    if request.method == 'POST':
        try:
            post_data_dict = json.loads(request.body.decode('utf-8'))  # Parse JSON body
            print(f"POST data as JSON: {post_data_dict}")  # Debugging: Log parsed JSON data
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data in request body'
            }, status=400)

        if 'otp_code' not in post_data_dict:
            return JsonResponse({
                'success': False,
                'message': 'OTP code is required.'
            }, status=400)

        if user_otp.otp_code == post_data_dict['otp_code']:
            if user_otp.otp_expires_at > now():
                user.is_active = True
                user.save()

                return JsonResponse({
                    'success': True,
                    'message': "Account activated successfully! You can log in."
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': "The OTP has expired. Get a new OTP."
                }, status=400)
        else:
            return JsonResponse({
                'success': False,
                'message': "Invalid OTP entered. Please try again."
            }, status=400)

    return JsonResponse({
        'success': False,
        'message': "Invalid request method. Please use POST."
    }, status=405) 


def send_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({
                    'success': False,
                    'message': 'Email is required.'
                }, status=400)

            try:
                user = get_user_model().objects.get(email=email)
            except get_user_model().DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User not found.'
                }, status=404)

            # Delete any existing OTP
            OtpToken.objects.filter(user=user).delete()

            # Create new OTP token
            otp_token = OtpToken.objects.create(user=user)

            # Send OTP email
            subject = 'Your OTP Code for Email Verification'
            message = f"""
            Hello {user.email},

            Your verification code is: {otp_token.otp_code}

            This code will expire in 10 minutes.

            If you didn't request this code, please ignore this email.

            Best regards,
            The Bantugi Team
            """
            try:
                send_mail(
                    subject,
                    message,
                    config('EMAIL_HOST_USER'),
                    [user.email],
                    fail_silently=False
                )
            except Exception as e:
                # Log the email error
                print(f"Email error: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'message': 'Failed to send OTP email. Please try again.'
                }, status=500)

            response = JsonResponse({
                'success': True,
                'message': 'OTP sent successfully.'
            })
            return response

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON format.'
            }, status=400)
        except Exception as e:
            # Log the error
            print(f"Error in send_otp: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': 'An error occurred. Please try again.'
            }, status=500)

    return JsonResponse({
        'success': False,
        'message': 'Invalid request method. Please use POST.'
    }, status=405)


def signin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')  # Ensure email is provided
            password = data.get('password')

            if not email or not password:
                return JsonResponse({
                    'success': False, 
                    'message': 'Email and password are required.'
                }, status=400)
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False, 
                'message': 'Invalid JSON'
            }, status=400)

        # Authenticate using email (Custom Authentication Backend)
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'message': f"Hi {user.username}, logged in successfully."
            })
        else:
            return JsonResponse({
                'success': False,
                'message': "Invalid credentials."
            }, status=400)

    return JsonResponse({
        'success': False,
        'message': "Invalid request method. Please use POST."
    }, status=405)


def change_password(request):
    if request.method == 'POST':
        try:
            post_data = json.loads(request.body)
            email = post_data.get("email")  # Identify the user by email
            new_password = post_data.get("new_password")
            confirm_password = post_data.get("confirm_password")

            if not all([email, new_password, confirm_password]):
                return JsonResponse({'success': False, 'message': "All fields are required."}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': "Invalid JSON format."}, status=400)

        user = get_user_model().objects.filter(email=email).first()

        if user is None:
            return JsonResponse({'success': False, 'message': "User not found."}, status=404)

        # Validate new password
        if new_password != confirm_password:
            return JsonResponse({'success': False, 'message': "New passwords do not match."}, status=400)

        if len(new_password) < 8:  # Simple validation for length
            return JsonResponse({'success': False, 'message': "Password must be at least 8 characters long."}, status=400)

        # Update password securely
        user.set_password(new_password)
        user.save()

        return JsonResponse({'success': True, 'message': "Password changed successfully!"})

    return JsonResponse({'success': False, 'message': "Invalid request method. Please use POST."}, status=405)


def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True, 'message': "User logged out successfully!"})
    
    return JsonResponse({'success': False, 'message': "Invalid request method. Please use POST."}, status=405)


def get_csrf_token(request):
    """Get CSRF token for AJAX/API requests"""
    csrf_token = get_token(request)
    return JsonResponse({'csrf_token': csrf_token})


def csrf_failure(request, reason=""):
    """Custom CSRF_FAILURE_VIEW that returns JSON responses"""
    return JsonResponse({
        "success": False,
        "message": reason,
    }, status=403)


def verify_otp(request):
    """Verify OTP code"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp_code = data.get('otp')

            if not email or not otp_code:
                return JsonResponse({
                    'success': False,
                    'message': 'Email and OTP code are required.'
                }, status=400)

            # Get user and their OTP token
            try:
                user = get_user_model().objects.get(email=email)
                otp_token = OtpToken.objects.get(user=user)
            except (get_user_model().DoesNotExist, OtpToken.DoesNotExist):
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid email or OTP not found.'
                }, status=400)

            # Check if OTP is expired
            if otp_token.otp_expires_at < now():
                return JsonResponse({
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.'
                }, status=400)

            # Verify OTP code
            if otp_token.otp_code != otp_code:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid OTP code.'
                }, status=400)

            # Activate user account
            user.is_active = True
            user.save()

            # Delete used OTP token
            otp_token.delete()

            return JsonResponse({
                'success': True,
                'message': 'Email verified successfully. You can now sign in.'
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON format.'
            }, status=400)

    return JsonResponse({
        'success': False,
        'message': 'Invalid request method. Please use POST.'
    }, status=405)


def resend_otp(request):
    """Resend OTP code"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({
                    'success': False,
                    'message': 'Email is required.'
                }, status=400)

            # Get user
            try:
                user = get_user_model().objects.get(email=email)
            except get_user_model().DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Email not found.'
                }, status=400)

            # Delete existing OTP if any
            OtpToken.objects.filter(user=user).delete()

            # Create new OTP token
            otp_token = OtpToken.objects.create(user=user)

            # Send OTP email
            subject = 'Your OTP Code for Email Verification'
            message = f"""
            Hello {user.username},

            Your new OTP code for email verification is: {otp_token.otp_code}

            This code will expire in 10 minutes.

            If you didn't request this code, please ignore this email.

            Best regards,
            The Bantugi Team
            """
            sender = config('EMAIL_HOST_USER')
            receiver = [user.email]

            send_mail(subject, message, sender, receiver, fail_silently=False)

            return JsonResponse({
                'success': True,
                'message': 'New OTP code has been sent to your email.'
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON format.'
            }, status=400)

    return JsonResponse({
        'success': False,
        'message': 'Invalid request method. Please use POST.'
    }, status=405)