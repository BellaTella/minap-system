"""
Imara — PTSD Indicator and Mitigation System — URL Configuration

The backend is API-only. All user-facing UI is served by the React app
(frontend/). Staff data management is handled through Django Admin (/admin/).
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    # Root redirects to the Django Admin dashboard (backend is API-only)
    path('', RedirectView.as_view(url='/admin/', permanent=False)),

    # Django admin — backend dashboard for staff data management
    path('admin/', admin.site.urls),

    # ── REST API endpoints ────────────────────────────────────────────────────
    path('api/', include('users.urls')),  # Includes /api/auth/, /api/student/, /api/admin/
    path('api/screening/', include('screening.urls')),
    path('api/referrals/', include('referrals.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/ml/', include('ml_engine.urls')),
]
