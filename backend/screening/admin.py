from django.contrib import admin
from .models import TraineeSession, ScreeningResult


@admin.register(TraineeSession)
class TraineeSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'anonymous_token', 'gender', 'department', 'programme_duration', 'consent', 'created_at']
    list_filter = ['gender', 'department', 'consent', 'programme_duration']
    search_fields = ['anonymous_token', 'department']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']


@admin.register(ScreeningResult)
class ScreeningResultAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'trainee_session', 'pcl5_score', 'dts_score',
        'severity', 'prediction_confidence', 'created_at'
    ]
    list_filter = ['severity', 'created_at']
    search_fields = ['trainee_session__department']
    readonly_fields = [
        'id', 'pcl5_score', 'cluster_intrusion', 'cluster_avoidance',
        'cluster_cognition_mood', 'cluster_arousal_reactivity', 'created_at'
    ]
    ordering = ['-created_at']

    fieldsets = (
        ('Session', {'fields': ('trainee_session',)}),
        ('PCL-5 Items (Cluster A — Intrusion)', {
            'fields': ('pcl5_item_1', 'pcl5_item_2', 'pcl5_item_3', 'pcl5_item_4', 'pcl5_item_5'),
        }),
        ('PCL-5 Items (Cluster B — Avoidance)', {
            'fields': ('pcl5_item_6', 'pcl5_item_7'),
        }),
        ('PCL-5 Items (Cluster C — Cognition/Mood)', {
            'fields': ('pcl5_item_8', 'pcl5_item_9', 'pcl5_item_10', 'pcl5_item_11',
                       'pcl5_item_12', 'pcl5_item_13', 'pcl5_item_14'),
        }),
        ('PCL-5 Items (Cluster D — Arousal/Reactivity)', {
            'fields': ('pcl5_item_15', 'pcl5_item_16', 'pcl5_item_17',
                       'pcl5_item_18', 'pcl5_item_19', 'pcl5_item_20'),
        }),
        ('Computed Scores', {
            'fields': ('pcl5_score', 'cluster_intrusion', 'cluster_avoidance',
                       'cluster_cognition_mood', 'cluster_arousal_reactivity', 'dts_score'),
        }),
        ('AI Prediction', {
            'fields': ('severity', 'prediction_confidence'),
        }),
        ('Metadata', {'fields': ('created_at',)}),
    )
