from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_referrals, name='referral-list'),
    path('<int:pk>/', views.referral_detail, name='referral-detail'),
    path('<int:pk>/update/', views.update_referral, name='referral-update'),
]
