"""
Template-serving views for the HTML frontend pages.
These are separate from the API views — they just render templates.
"""

from django.shortcuts import render


def home(request):
    return render(request, 'home.html')


def screening_page(request):
    return render(request, 'screening/screening.html')


def counsellor_login_page(request):
    return render(request, 'counsellor/login.html')


def counsellor_dashboard_page(request):
    return render(request, 'counsellor/dashboard.html')


def trainee_login_page(request):
    return render(request, 'trainee/login.html')


def trainee_register_page(request):
    return render(request, 'trainee/register.html')


def trainee_dashboard_page(request):
    return render(request, 'trainee/dashboard.html')
