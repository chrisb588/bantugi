from django.urls import path
from . import views 

urlpatterns = [
    path("register/", views.signup, name="register"),
    path('verify-email/<str:email>/', views.verify_email, name='verify_email'),
    path("send-otp/", views.send_otp, name="send-otp"),
    path("login/", views.signin, name="signin"),
    path("change-password/", views.change_password, name="change_password"),
    path("logout/", views.logout_user, name="logout_user"),
    path("get-csrf-token/", views.get_csrf_token, name="get_csrf_token") 
]
