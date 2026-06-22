"""
Migration: Add detected_keywords, created_at, and change to OneToOneField.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nlp_engine', '0001_initial'),
        ('screening', '0002_add_pcl5_items_and_clusters'),
    ]

    operations = [
        # Add detected_keywords field
        migrations.AddField(
            model_name='nlpresult',
            name='detected_keywords',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        # Add created_at
        migrations.AddField(
            model_name='nlpresult',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        # Change FK to OneToOneField
        migrations.AlterField(
            model_name='nlpresult',
            name='screening',
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='nlp_result',
                to='screening.screeningresult',
            ),
        ),
        # Add default to sentiment_score
        migrations.AlterField(
            model_name='nlpresult',
            name='sentiment_score',
            field=models.FloatField(default=0.0),
        ),
    ]
