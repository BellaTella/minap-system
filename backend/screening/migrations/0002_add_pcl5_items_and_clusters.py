"""
Migration: Add PCL-5 item-level fields, DSM-5 cluster sub-scores,
programme_duration to TraineeSession, and narrative_text to ScreeningResult.
"""

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('screening', '0001_initial'),
    ]

    operations = [
        # Add programme_duration to TraineeSession
        migrations.AddField(
            model_name='traineesession',
            name='programme_duration',
            field=models.CharField(
                choices=[
                    ('6_months', '6 Months'),
                    ('1_year', '1 Year'),
                    ('2_years', '2 Years'),
                    ('3_years', '3 Years'),
                ],
                default='1_year',
                max_length=20,
            ),
        ),
        # Add unique constraint to anonymous_token
        migrations.AlterField(
            model_name='traineesession',
            name='anonymous_token',
            field=models.CharField(max_length=255, unique=True, db_index=True),
        ),
        # Add gender choices
        migrations.AlterField(
            model_name='traineesession',
            name='gender',
            field=models.CharField(
                choices=[
                    ('male', 'Male'),
                    ('female', 'Female'),
                    ('prefer_not_to_say', 'Prefer not to say'),
                ],
                max_length=20,
            ),
        ),
        # Add PCL-5 item fields (20 items, 0-4 each)
        *[
            migrations.AddField(
                model_name='screeningresult',
                name=f'pcl5_item_{i}',
                field=models.IntegerField(
                    default=0,
                    validators=[
                        django.core.validators.MinValueValidator(0),
                        django.core.validators.MaxValueValidator(4),
                    ],
                ),
            )
            for i in range(1, 21)
        ],
        # Add DSM-5 cluster sub-scores
        migrations.AddField(
            model_name='screeningresult',
            name='cluster_intrusion',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='screeningresult',
            name='cluster_avoidance',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='screeningresult',
            name='cluster_cognition_mood',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='screeningresult',
            name='cluster_arousal_reactivity',
            field=models.IntegerField(default=0),
        ),
        # Add narrative_text (not stored permanently — cleared after NLP)
        migrations.AddField(
            model_name='screeningresult',
            name='narrative_text',
            field=models.TextField(blank=True, default=''),
        ),
        # Add DTS score validator
        migrations.AlterField(
            model_name='screeningresult',
            name='dts_score',
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(136),
                ],
            ),
        ),
        # Add prediction_confidence validator
        migrations.AlterField(
            model_name='screeningresult',
            name='prediction_confidence',
            field=models.FloatField(
                validators=[
                    django.core.validators.MinValueValidator(0.0),
                    django.core.validators.MaxValueValidator(1.0),
                ],
            ),
        ),
    ]
