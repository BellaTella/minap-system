"""
Run this script once to create the initial admin/counsellor accounts.

Usage:
    python create_superuser.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imara.settings')
django.setup()

from users.models import User

# Create superuser (admin)
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@minap.ac.ke',
        password='MiNaP@Admin2026',
        role='admin',
    )
    print("Superuser 'admin' created.")
else:
    print("Superuser 'admin' already exists.")

# Create a sample counsellor account
if not User.objects.filter(username='counsellor1').exists():
    User.objects.create_user(
        username='counsellor1',
        email='counsellor1@minap.ac.ke',
        password='MiNaP@Counsellor2026',
        first_name='Jane',
        last_name='Wanjiku',
        role='counsellor',
    )
    print("Counsellor account 'counsellor1' created.")
else:
    print("Counsellor 'counsellor1' already exists.")

print("\nDone. Change these passwords before deploying to production.")
