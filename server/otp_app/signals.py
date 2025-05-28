
from django.db.models.signals import post_save
from django.conf import settings
from django.dispatch import receiver
from .models import OtpToken
from django.core.mail import send_mail
from django.utils import timezone


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_token(sender, instance, created, **kwargs):
    if created:
        # Skip OTP generation for superusers
        if instance.is_superuser:
            return

        try:
            # Generate OTP token and set expiration
            otp = OtpToken.objects.create(
                user=instance,
                otp_expires_at=timezone.now() + timezone.timedelta(minutes=5)
            )
            
            # Deactivate the user until email verification is complete
            instance.is_active = False
            instance.save()

            # Prepare email content
            subject = "Email Verification"
            message = (
                f"Hi {instance.username}, here is your OTP: {otp.otp_code}\n"
                "It expires in 5 minutes. Use the URL below to verify your email:\n"
                f"http://127.0.0.1:8000/verify-email/{instance.username}\n"
            )
            sender_email = "clintonmatics@gmail.com"
            recipient_list = [instance.email]

            # Send verification email
            send_mail(
                subject,
                message,
                sender_email,
                recipient_list,
                fail_silently=False,
            )

        except Exception as e:
            # Log the error for debugging purposes
            print(f"Error in creating OTP or sending email for user {instance.username}: {e}")

  
