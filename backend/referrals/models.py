from django.db import models
from django.conf import settings
from screening.models import ScreeningResult


class Referral(models.Model):
    """
    Tracks counsellor referrals triggered for moderate-to-critical cases.
    """

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('escalated', 'Escalated'),
    )

    screening = models.OneToOneField(
        ScreeningResult,
        on_delete=models.CASCADE,
        related_name='referral'
    )

    counsellor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referrals'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Referral #{self.pk} — {self.status} ({self.screening.severity})"
