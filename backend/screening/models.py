import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class TraineeSession(models.Model):
    """
    Stores anonymous trainee session data.
    No PII is stored — only demographic metadata and a UUID token.
    """

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('prefer_not_to_say', 'Prefer not to say'),
    )

    PROGRAMME_DURATION_CHOICES = (
        ('6_months', '6 Months'),
        ('1_year', '1 Year'),
        ('2_years', '2 Years'),
        ('3_years', '3 Years'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    anonymous_token = models.CharField(max_length=255, unique=True, db_index=True)
    
    # Optional link to student account (if logged in)
    student = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='screening_sessions',
        limit_choices_to={'role': 'student'},
        help_text="Linked student account (optional, for tracking)"
    )
    
    consent = models.BooleanField(default=False)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES)
    department = models.CharField(max_length=100)
    programme_duration = models.CharField(
        max_length=20, choices=PROGRAMME_DURATION_CHOICES, default='1_year'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Session {self.anonymous_token[:8]}... ({self.department})"


class ScreeningResult(models.Model):
    """
    Stores PCL-5 and DTS item-level responses, computed scores,
    DSM-5 cluster sub-scores, and AI-predicted severity.
    """

    SEVERITY_CHOICES = (
        ('minimal', 'Minimal'),
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('critical', 'Critical'),
    )

    trainee_session = models.ForeignKey(
        TraineeSession, on_delete=models.CASCADE, related_name='results'
    )

    # PCL-5: 20 items, each scored 0-4 (total 0-80)
    pcl5_item_1 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_2 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_3 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_4 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_5 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_6 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_7 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_8 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_9 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_10 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_11 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_12 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_13 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_14 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_15 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_16 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_17 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_18 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_19 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)
    pcl5_item_20 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default=0)

    # Computed PCL-5 total and DSM-5 cluster sub-scores
    pcl5_score = models.IntegerField()                  # Total 0-80
    cluster_intrusion = models.IntegerField(default=0)  # Items 1-5
    cluster_avoidance = models.IntegerField(default=0)  # Items 6-7
    cluster_cognition_mood = models.IntegerField(default=0)  # Items 8-14
    cluster_arousal_reactivity = models.IntegerField(default=0)  # Items 15-20

    # DTS total score (0-136)
    dts_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(136)])

    # Optional free-text narrative (not stored permanently — cleared after NLP processing)
    narrative_text = models.TextField(blank=True, default='')

    # AI prediction output
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    prediction_confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Screening #{self.pk} — {self.severity} (PCL-5: {self.pcl5_score})"

    def compute_cluster_scores(self):
        """Compute DSM-5 cluster sub-scores from PCL-5 items."""
        self.cluster_intrusion = sum([
            self.pcl5_item_1, self.pcl5_item_2, self.pcl5_item_3,
            self.pcl5_item_4, self.pcl5_item_5
        ])
        self.cluster_avoidance = self.pcl5_item_6 + self.pcl5_item_7
        self.cluster_cognition_mood = sum([
            self.pcl5_item_8, self.pcl5_item_9, self.pcl5_item_10,
            self.pcl5_item_11, self.pcl5_item_12, self.pcl5_item_13,
            self.pcl5_item_14
        ])
        self.cluster_arousal_reactivity = sum([
            self.pcl5_item_15, self.pcl5_item_16, self.pcl5_item_17,
            self.pcl5_item_18, self.pcl5_item_19, self.pcl5_item_20
        ])
        self.pcl5_score = (
            self.cluster_intrusion + self.cluster_avoidance +
            self.cluster_cognition_mood + self.cluster_arousal_reactivity
        )
