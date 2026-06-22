from django.urls import path
from . import views

urlpatterns = [
    path('train/', views.trigger_training, name='ml-train'),
]
