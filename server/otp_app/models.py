from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.conf import settings
import secrets


from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        if not username:
            raise ValueError("The Username field must be set")
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()  

    def __str__(self):
        return self.email


from datetime import timedelta
from django.utils.timezone import now

class OtpToken(models.Model):
    user = models.OneToOneField(  
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otp"
    )
    otp_code = models.CharField(max_length=6, blank=True)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.otp_code:  # Generate OTP only if not set
            self.otp_code = secrets.token_hex(3).upper()
        if not self.otp_expires_at:
            self.otp_expires_at = now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.otp_code}"


    