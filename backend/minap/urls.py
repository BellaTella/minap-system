"""
MiNaP PTSD Indicator and Mitigation System — URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from dashboard.page_views import (
    home, screening_page, 
    counsellor_login_page, counsellor_dashboard_page,
    trainee_login_page, trainee_register_page, trainee_dashboard_page
)

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # ── HTML Pages (trainee & counsellor UI) ──────────────────────────────────
    path('', home, name='home'),
    path('screening/', screening_page, name='screening'),
    
    # Trainee pages
    path('trainee/login/', trainee_login_page, name='trainee-login'),
    path('trainee/register/', trainee_register_page, name='trainee-register'),
    path('trainee/dashboard/', trainee_dashboard_page, name='trainee-dashboard'),
    
    # Counsellor pages
    path('counsellor/login/', counsellor_login_page, name='counsellor-login'),
    path('counsellor/dashboard/', counsellor_dashboard_page, name='counsellor-dashboard'),

    # ── REST API endpoints ────────────────────────────────────────────────────
    path('api/', include('users.urls')),  # Includes /api/auth/, /api/student/, /api/admin/
    path('api/screening/', include('screening.urls')),
    path('api/referrals/', include('referrals.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/ml/', include('ml_engine.urls')),
]
