from django.urls import path
from . import views

urlpatterns = [
    # ─── Authentication ───────────────────────────────────────────────────────────
    path('auth/login/', views.login_view, name='auth-login'),
    path('auth/logout/', views.logout_view, name='auth-logout'),
    path('auth/me/', views.me_view, name='auth-me'),
    path('auth/profile/', views.update_profile, name='auth-update-profile'),
    path('auth/change-password/', views.change_password, name='auth-change-password'),
    path('auth/register/student/', views.student_register, name='student-register'),
    
    # ─── Student Dashboard ────────────────────────────────────────────────────────
    path('student/dashboard/', views.student_dashboard, name='student-dashboard'),
    path('student/screenings/', views.student_screening_history, name='student-screenings'),
    
    # ─── Wellness Check-ins ───────────────────────────────────────────────────────
    path('student/wellness/', views.wellness_checkin_list, name='wellness-list'),
    
    # ─── Appointments ─────────────────────────────────────────────────────────────
    path('student/appointments/', views.appointment_list, name='appointment-list'),
    path('student/appointments/<int:pk>/', views.appointment_detail, name='appointment-detail'),

    # ─── Counsellor: Appointment Management ───────────────────────────────────────
    path('counsellor/appointments/', views.counsellor_appointment_list, name='counsellor-appointments'),
    path('counsellor/appointments/<int:pk>/', views.counsellor_appointment_update, name='counsellor-appointment-update'),
    
    # ─── Admin: User Management ───────────────────────────────────────────────────
    path('admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('admin/users/', views.admin_users_list, name='admin-users-list'),
    path('admin/users/<int:pk>/', views.admin_user_detail, name='admin-user-detail'),
]
