# MiNaP PTSD System - Quick Reference Card

## 🚀 Quick Commands

### Start Development Server
```bash
cd backend
python manage.py runserver
```
**Access**: http://127.0.0.1:8000

### Database Operations
```bash
# Apply migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell
```

### System Check
```bash
# Development check
python manage.py check

# Production check
python manage.py check --deploy
```

---

## 🌐 Key URLs

### User Pages
| Page | URL | Authentication |
|------|-----|----------------|
| Home | `/` | None |
| Anonymous Screening | `/screening/` | None |
| Student Login | `/trainee/login/` | None |
| Student Register | `/trainee/register/` | None |
| Student Dashboard | `/trainee/dashboard/` | Required (student) |
| Counsellor Login | `/counsellor/login/` | None |
| Counsellor Dashboard | `/counsellor/dashboard/` | Required (counsellor) |
| Django Admin | `/admin/` | Required (superuser) |

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login/` | POST | Login |
| `/api/auth/register/student/` | POST | Register student |
| `/api/auth/me/` | GET | Get current user |
| `/api/student/dashboard/` | GET | Student dashboard data |
| `/api/screening/submit/` | POST | Submit screening |
| `/api/referrals/` | GET | List referrals |
| `/api/dashboard/summary/` | GET | Dashboard analytics |

---

## 👤 Test Accounts

### Create Test Student
```python
python manage.py shell

from users.models import User
User.objects.create_user(
    username='student1',
    password='student123',
    email='student1@minap.ac.ke',
    role='student',
    first_name='Test',
    last_name='Student',
    student_id='TEST-001/2023',
    department='IT',
    programme='Diploma'
)
```

### Create Test Counsellor
```python
User.objects.create_user(
    username='counsellor1',
    password='counsellor123',
    email='counsellor1@minap.ac.ke',
    role='counsellor',
    first_name='Dr. Jane',
    last_name='Doe',
    department='Guidance',
    specialization='PTSD Counselling'
)
```

**Test Credentials (Counsellor)**:
- **Username**: `counsellor1`
- **Password**: `counsellor123`
- **Access**: Counsellor Dashboard

---

## 📊 Severity Classification

| PCL-5 Score | Severity | Referral |
|-------------|----------|----------|
| 0-19 | Minimal | No |
| 20-31 | Mild | Voluntary |
| 32-43 | Moderate | Yes (Auto) |
| 44-59 | Severe | Yes (Urgent) |
| 60-80 | Critical | Yes (High Priority) |

---

## 🔐 Token Authentication

### Store Token (JavaScript)
```javascript
localStorage.setItem('auth_token', 'YOUR_TOKEN_HERE');
localStorage.setItem('user', JSON.stringify(userData));
```

### Use Token in API Call
```javascript
fetch('/api/student/dashboard/', {
    headers: {
        'Authorization': 'Token ' + localStorage.getItem('auth_token')
    }
})
```

### Clear Session
```javascript
localStorage.clear();
```

---

## 🗄️ Database Models

### Key Models
- **User** - Students, counsellors, admins
- **TraineeSession** - Screening sessions (anonymous + linked)
- **ScreeningResult** - PCL-5 data and scores
- **NLPResult** - Text analysis results
- **Referral** - Counsellor case management
- **WellnessCheckIn** - Daily wellness tracking
- **CounsellingAppointment** - Appointment scheduling

---

## 📝 Common Tasks

### View All Users
```python
python manage.py shell

from users.models import User
User.objects.all()
User.objects.filter(role='student')
```

### View Screenings
```python
from screening.models import ScreeningResult
ScreeningResult.objects.all()
ScreeningResult.objects.filter(severity='severe')
```

### View Referrals
```python
from referrals.models import Referral
Referral.objects.filter(status='pending')
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
python manage.py runserver 8080
```

### Reset Database
```bash
# Delete database
del db.sqlite3

# Delete migrations (except __init__.py)
# Then recreate
python manage.py makemigrations
python manage.py migrate
```

### Clear Browser Storage
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main overview |
| `QUICK_START.md` | Testing guide |
| `IMPLEMENTATION_NOTES.md` | Technical details |
| `TESTING_CHECKLIST.md` | QA procedures |
| `DEPLOYMENT_CHECKLIST.md` | Production guide |
| `SYSTEM_WORKFLOWS.md` | Workflow diagrams |
| `FINAL_SUMMARY.md` | Project summary |

---

## 🎯 Quick Test Flows

### Test Anonymous Screening
1. Visit http://127.0.0.1:8000/screening/
2. Accept consent
3. Fill demographics
4. Complete 20 PCL-5 items
5. Submit
6. View results

### Test Student Registration
1. Visit http://127.0.0.1:8000/trainee/register/
2. Fill registration form
3. Submit
4. Auto-login to dashboard

### Test Student Login
1. Visit http://127.0.0.1:8000/trainee/login/
2. Enter username/password
3. Login
4. View dashboard

### Test Authenticated Screening
1. Login as student
2. Click "Take New Screening"
3. Complete screening
4. Return to dashboard
5. View history updated

---

## 🔒 Security Notes

### Development
- DEBUG = True
- SQLite database
- HTTP allowed
- Weak SECRET_KEY OK

### Production
- DEBUG = False
- PostgreSQL database
- HTTPS required
- Strong SECRET_KEY
- Environment variables
- Firewall configured

---

## 📊 Project Structure

```
minap-system/
├── backend/              # Django app
│   ├── manage.py         # Django CLI
│   ├── db.sqlite3        # Database (dev)
│   ├── users/            # Auth & profiles
│   ├── screening/        # Core screening
│   ├── referrals/        # Case management
│   ├── dashboard/        # Analytics
│   ├── ml_engine/        # ML models
│   ├── nlp_engine/       # Text analysis
│   ├── minap/            # Settings
│   └── templates/        # HTML pages
│       ├── trainee/      # Student pages
│       ├── counsellor/   # Counsellor pages
│       └── home.html     # Landing page
└── Documentation/        # All docs
```

---

## 💡 Pro Tips

1. **Always activate venv first**
   ```bash
   # Windows
   venv\Scripts\activate
   ```

2. **Use Django shell for quick queries**
   ```bash
   python manage.py shell
   ```

3. **Check for errors immediately**
   ```bash
   python manage.py check
   ```

4. **View logs in browser console**
   ```
   F12 → Console tab
   ```

5. **Test API with browser**
   ```
   Visit: http://127.0.0.1:8000/api/...
   ```

---

## 🆘 Getting Help

### Check These First
1. Error logs in terminal
2. Browser console (F12)
3. Django debug page
4. Documentation files
5. PROJECT-PROPOSAL-STELLA-MWAURA.docx

### Common Issues
- **ImportError**: Check virtual environment activated
- **OperationalError**: Run migrations
- **404**: Check URL configuration
- **403**: Check authentication/permissions
- **500**: Check server logs

---

## 📞 Support

- **Documentation**: See `/Documentation` folder
- **Project Email**: [contact]
- **Institution**: MiNaP IT Department

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: June 22, 2026

---

**Keep this card handy for quick reference! 📌**
