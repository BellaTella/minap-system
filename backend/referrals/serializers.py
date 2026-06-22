"""
Referrals app serializers.
"""

from rest_framework import serializers
from .models import Referral
from screening.serializers import ScreeningResultSerializer


class ReferralSerializer(serializers.ModelSerializer):
    screening_detail = ScreeningResultSerializer(source='screening', read_only=True)

    class Meta:
        model = Referral
        fields = [
            'id', 'screening', 'screening_detail', 'counsellor',
            'status', 'notes', 'follow_up_date', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'screening_detail']


class ReferralUpdateSerializer(serializers.ModelSerializer):
    """Used by counsellors to update case status and notes."""

    class Meta:
        model = Referral
        fields = ['status', 'notes', 'follow_up_date', 'counsellor']
