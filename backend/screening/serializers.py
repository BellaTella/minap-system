"""
Screening app serializers.
"""

from rest_framework import serializers
from .models import TraineeSession, ScreeningResult


class TraineeSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TraineeSession
        fields = [
            'id', 'anonymous_token', 'consent', 'gender',
            'department', 'programme_duration', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ScreeningSubmitSerializer(serializers.Serializer):
    """
    Validates the full PCL-5 + DTS assessment submission from a trainee.
    """

    # Trainee session fields
    consent = serializers.BooleanField()
    gender = serializers.ChoiceField(choices=['male', 'female', 'prefer_not_to_say'])
    department = serializers.CharField(max_length=100)
    programme_duration = serializers.ChoiceField(
        choices=['6_months', '1_year', '2_years', '3_years'],
        default='1_year'
    )

    # PCL-5: 20 items, each 0-4
    pcl5_item_1 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_2 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_3 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_4 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_5 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_6 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_7 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_8 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_9 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_10 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_11 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_12 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_13 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_14 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_15 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_16 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_17 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_18 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_19 = serializers.IntegerField(min_value=0, max_value=4)
    pcl5_item_20 = serializers.IntegerField(min_value=0, max_value=4)

    # DTS total score (0-136)
    dts_score = serializers.IntegerField(min_value=0, max_value=136)

    # Optional free-text narrative (not stored permanently)
    narrative_text = serializers.CharField(
        max_length=2000, required=False, allow_blank=True, default=''
    )

    def validate(self, data):
        if not data.get('consent'):
            raise serializers.ValidationError(
                "You must provide informed consent to proceed with the screening."
            )
        return data


class ScreeningResultSerializer(serializers.ModelSerializer):
    """Read-only serializer for counsellor dashboard."""

    class Meta:
        model = ScreeningResult
        fields = [
            'id', 'trainee_session', 'pcl5_score', 'dts_score',
            'cluster_intrusion', 'cluster_avoidance',
            'cluster_cognition_mood', 'cluster_arousal_reactivity',
            'severity', 'prediction_confidence', 'created_at',
        ]
        read_only_fields = fields
