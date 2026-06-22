"""
Original empty migration — already applied to database.
Kept as no-op to preserve migration history consistency.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('referrals', '0001_initial'),
    ]

    operations = []
