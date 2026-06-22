from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.submit_screening, name='screening-submit'),
    path('results/', views.list_results, name='screening-results'),
    path('results/<int:pk>/', views.result_detail, name='screening-result-detail'),
]
