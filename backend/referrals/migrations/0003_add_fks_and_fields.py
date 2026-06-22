"""
Migration: Add FKs, escalated status, follow_up_date, updated_at to Referral.
"""

import django.db.models.deletion
import django.conf
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('referrals', '0002_initial'),
        ('screening', '0002_add_pcl5_items_and_clusters'),
        migrations.swappable_dependency(django.conf.settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add screening FK
        migrations.AddField(
            model_name='referral',
            name='screening',
            field=models.OneToOneField(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='referral',
                to='screening.screeningresult',
            ),
            preserve_default=False,
        ),
        # Add counsellor FK
        migrations.AddField(
            model_name='referral',
            name='counsellor',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='referrals',
                to=django.conf.settings.AUTH_USER_MODEL,
            ),
        ),
        # Add escalated status
        migrations.AlterField(
            model_name='referral',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('in_progress', 'In Progress'),
                    ('resolved', 'Resolved'),
                    ('escalated', 'Escalated'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        # Add follow_up_date
        migrations.AddField(
            model_name='referral',
            name='follow_up_date',
            field=models.DateField(blank=True, null=True),
        ),
        # Add updated_at
        migrations.AddField(
            model_name='referral',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
