from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import hashlib


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('counsellor', 'Counsellor'),
        ('student', 'Student'),
    )

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('prefer_not_to_say', 'Prefer not to say'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # Student-specific fields
    student_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        help_text="Student ID (hashed for privacy)"
    )
    student_id_hash = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    department = models.CharField(max_length=100, blank=True)
    programme = models.CharField(max_length=100, blank=True)
    year_of_study = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')]
    )
    
    # Counsellor-specific fields
    specialization = models.CharField(max_length=200, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    
    # Common fields
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    
    # Privacy settings for students
    allow_longitudinal_tracking = models.BooleanField(
        default=False,
        help_text="Allow system to track screening history over time"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Hash student ID for privacy
        if self.student_id and not self.student_id_hash:
            self.student_id_hash = hashlib.sha256(
                self.student_id.encode()
            ).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_student(self):
        return self.role == 'student'

    @property
    def is_counsellor(self):
        return self.role == 'counsellor'

    @property
    def is_admin_role(self):
        return self.role == 'admin'


class WellnessCheckIn(models.Model):
    """Quick daily wellness check-ins for students"""
    
    MOOD_CHOICES = (
        (1, '😢 Very Bad'),
        (2, '😕 Bad'),
        (3, '😐 Okay'),
        (4, '🙂 Good'),
        (5, '😄 Very Good'),
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wellness_checkins',
        limit_choices_to={'role': 'student'}
    )
    mood = models.IntegerField(choices=MOOD_CHOICES)
    stress_level = models.IntegerField(
        help_text="1-10 scale",
        validators=[RegexValidator(regex=r'^([1-9]|10)$')]
    )
    sleep_quality = models.IntegerField(
        help_text="1-10 scale",
        validators=[RegexValidator(regex=r'^([1-9]|10)$')]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Wellness Check-ins'

    def __str__(self):
        return f"{self.student.username} - {self.created_at.date()}"


class CounsellingAppointment(models.Model):
    """Student appointments with counsellors"""
    
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='appointments',
        limit_choices_to={'role': 'student'}
    )
    counsellor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='counselling_sessions',
        limit_choices_to={'role': 'counsellor'}
    )
    preferred_date = models.DateField()
    preferred_time = models.TimeField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    counsellor_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-preferred_date', '-preferred_time']

    def __str__(self):
        return f"{self.student.username} - {self.preferred_date} ({self.status})"
