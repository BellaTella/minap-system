from django.contrib import admin
from .models import NLPResult


@admin.register(NLPResult)
class NLPResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'screening', 'sentiment_score', 'trauma_flag', 'crisis_flag', 'created_at']
    list_filter = ['trauma_flag', 'crisis_flag', 'created_at']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']
