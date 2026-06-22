from django.contrib import admin
from .models import Referral


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'get_severity', 'get_department', 'counsellor',
        'status', 'follow_up_date', 'created_at'
    ]
    list_filter = ['status', 'screening__severity', 'created_at']
    search_fields = ['screening__trainee_session__department', 'notes']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']

    @admin.display(description='Severity')
    def get_severity(self, obj):
        return obj.screening.severity

    @admin.display(description='Department')
    def get_department(self, obj):
        return obj.screening.trainee_session.department
