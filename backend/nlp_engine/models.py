from django.db import models
from screening.models import ScreeningResult


class NLPResult(models.Model):
    """
    Stores derived NLP features from the optional narrative field.
    Raw text is never persisted — only derived signals.
    """

    screening = models.OneToOneField(
        ScreeningResult,
        on_delete=models.CASCADE,
        related_name='nlp_result'
    )

    # Sentiment score: -1.0 (very negative) to 1.0 (positive)
    sentiment_score = models.FloatField(default=0.0)

    # True if trauma-relevant keywords detected
    trauma_flag = models.BooleanField(default=False)

    # True if crisis/self-harm language detected — triggers immediate counsellor alert
    crisis_flag = models.BooleanField(default=False)

    # Detected trauma keywords (comma-separated, for audit)
    detected_keywords = models.CharField(max_length=500, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"NLP #{self.pk} — sentiment={self.sentiment_score:.2f} "
            f"crisis={self.crisis_flag}"
        )
