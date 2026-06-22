from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.dashboard_summary, name='dashboard-summary'),
    path('cases/', views.case_list, name='dashboard-cases'),
    path('alerts/', views.high_priority_alerts, name='dashboard-alerts'),
]
