# MiNaP PTSD System - Project Structure

## Complete File Tree

```
minap-system/
│
├── backend/                              # Django Backend
│   ├── dashboard/                        # Dashboard App
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                     # (empty - no models needed)
│   │   ├── page_views.py                 # ✨ UPDATED - Added trainee views
│   │   ├── tests.py
│   │   ├── urls.py                       # API routes for dashboard
│   │   └── views.py                      # API views (analytics, cases, alerts)
│   │
│   ├── ml_engine/                        # Machine Learning App
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── classifier.py                 # PTSD Classifier (ML Model)
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── training.py                   # Model training scripts
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── nlp_engine/                       # Natural Language Processing
│   │   ├── migrations/
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_add_fields.py
│   │   │   ├── 0003_alter_nlpresult_options_alter_nlpresult_created_at.py
│   │   │   └── 0004_alter_nlpresult_created_at.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                     # NLPResult model
│   │   ├── processor.py                  # Text analysis logic
│   │   ├── tests.py
│   │   └── views.py
│   │
│   ├── referrals/                        # Referral Management App
│   │   ├── migrations/
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_initial.py
│   │   │   ├── 0003_add_fks_and_fields.py
│   │   │   └── 0004_alter_referral_options.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                     # Referral model
│   │   ├── serializers.py                # DRF serializers
│   │   ├── tests.py
│   │   ├── urls.py                       # API routes
│   │   └── views.py                      # API views (list, detail, update)
│   │
│   ├── screening/                        # Core Screening App
│   │   ├── migrations/
│   │   │   ├── 0001_initial.py
│   │   │   ├── 0002_add_pcl5_items_and_clusters.py
│   │   │   ├── 0003_alter_screeningresult_options_and_more.py
│   │   │   └── 0004_traineesession_student.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                     # TraineeSession, ScreeningResult
│   │   ├── serializers.py                # DRF serializers
│   │   ├── tests.py
│   │   ├── urls.py                       # API routes
│   │   └── views.py                      # ✨ UPDATED - Links to student accounts
│   │
│   ├── users/                            # User Management App
│   │   ├── migrations/
│   │   │   ├── 0001_initial.py
│   │   │   └── 0002_alter_user_options_user_allow_longitudinal_tracking_and_more.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                     # User, WellnessCheckIn, CounsellingAppointment
│   │   ├── serializers.py                # ✨ UPDATED - Password2 support
│   │   ├── tests.py
│   │   ├── urls.py                       # Auth & user API routes
│   │   └── views.py                      # Auth & dashboard views
│   │
│   ├── minap/                            # Main Project Settings
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py                   # Django settings
│   │   ├── urls.py                       # ✨ UPDATED - Added trainee routes
│   │   └── wsgi.py
│   │
│   ├── static/                           # Static Files
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   ├── templates/                        # HTML Templates
│   │   ├── counsellor/                   # Counsellor Pages
│   │   │   ├── dashboard.html
│   │   │   └── login.html
│   │   │
│   │   ├── screening/                    # Screening Pages
│   │   │   └── screening.html
│   │   │
│   │   ├── trainee/                      # ✨ NEW - Trainee Pages
│   │   │   ├── dashboard.html            # ✨ NEW - Student dashboard
│   │   │   ├── login.html                # ✨ NEW - Student login
│   │   │   └── register.html             # ✨ NEW - Student registration
│   │   │
│   │   ├── base.html                     # Base template
│   │   └── home.html                     # ✨ UPDATED - Added auth links
│   │
│   ├── db.sqlite3                        # SQLite Database
│   ├── manage.py                         # Django management script
│   ├── create_superuser.py               # Helper script
│   └── requirements.txt                  # Python dependencies
│
├── trained_models/                       # ML Models (SEMMA output)
│   ├── ptsd_classifier.joblib            # Trained Random Forest model
│   ├── scaler.joblib                     # Feature scaler
│   └── label_encoder.joblib              # Severity encoder
│
├── .git/                                 # Git repository
├── .gitignore
├── README.md
│
├── ✨ IMPLEMENTATION_NOTES.md            # ✨ NEW - Technical documentation
├── ✨ QUICK_START.md                     # ✨ NEW - Testing guide
├── ✨ CHANGES_SUMMARY.md                 # ✨ NEW - Changes overview
├── ✨ PROJECT_STRUCTURE.md               # ✨ NEW - This file
└── PROJECT-PROPOSAL-STELLA-MWAURA.docx   # Original requirements
```

---

## Key Components Explained

### 🎯 Core Django Apps

#### 1. **users/** - User Management
- **Purpose**: Authentication, user profiles, roles
- **Models**: User (students, counsellors, admins), WellnessCheckIn, CounsellingAppointment
- **Key Features**:
  - Student registration and login
  - Token-based authentication
  - Role-based access control
  - Student dashboard API
  - Wellness tracking
  - Appointment management

#### 2. **screening/** - PTSD Screening
- **Purpose**: Core screening functionality
- **Models**: TraineeSession (anonymous + student link), ScreeningResult (PCL-5 data)
- **Key Features**:
  - Anonymous screening
  - Authenticated screening (links to student)
  - PCL-5 questionnaire (20 items)
  - Cluster score calculation
  - Severity classification

#### 3. **ml_engine/** - Machine Learning
- **Purpose**: AI-powered severity prediction
- **Key Files**: classifier.py, training.py
- **Key Features**:
  - Random Forest classifier
  - SEMMA framework implementation
  - Feature engineering
  - Rule-based fallback
  - Model persistence (joblib)

#### 4. **nlp_engine/** - Text Analysis
- **Purpose**: Process optional narrative text
- **Models**: NLPResult
- **Key Features**:
  - Sentiment analysis
  - Trauma keyword detection
  - Crisis alert detection
  - Privacy-preserving (raw text not stored)

#### 5. **referrals/** - Case Management
- **Purpose**: Counsellor referral system
- **Models**: Referral
- **Key Features**:
  - Auto-referral for moderate+ cases
  - Case status tracking
  - Follow-up scheduling
  - Counsellor assignment

#### 6. **dashboard/** - Analytics
- **Purpose**: Data visualization and insights
- **Key Features**:
  - Counsellor dashboard API
  - Case analytics
  - Severity distribution
  - High-priority alerts

---

## 🗂️ Database Structure

### Core Tables

```sql
-- Users
User
├── id (PK)
├── username
├── email
├── password (hashed)
├── role (student/counsellor/admin)
├── student_id (hashed for privacy)
├── department
├── programme
└── ... (more fields)

-- Trainee Sessions
TraineeSession
├── id (UUID, PK)
├── anonymous_token (UUID)
├── student_id (FK, nullable) ← ✨ Links to User
├── consent (boolean)
├── gender
├── department
└── programme_duration

-- Screening Results
ScreeningResult
├── id (PK)
├── trainee_session_id (FK)
├── pcl5_item_1 to pcl5_item_20 (0-4)
├── pcl5_score (0-80)
├── cluster_intrusion
├── cluster_avoidance
├── cluster_cognition_mood
├── cluster_arousal_reactivity
├── dts_score (0-136)
├── severity (minimal/mild/moderate/severe/critical)
├── prediction_confidence
└── created_at

-- NLP Results
NLPResult
├── id (PK)
├── screening_id (FK, one-to-one)
├── sentiment_score (-1.0 to 1.0)
├── trauma_flag (boolean)
├── crisis_flag (boolean)
├── detected_keywords (comma-separated)
└── created_at

-- Referrals
Referral
├── id (PK)
├── screening_id (FK, one-to-one)
├── counsellor_id (FK, nullable)
├── status (pending/in_progress/resolved/escalated)
├── notes (text)
├── follow_up_date
├── created_at
└── updated_at

-- Wellness Check-ins
WellnessCheckIn
├── id (PK)
├── student_id (FK)
├── mood (1-5)
├── stress_level (1-10)
├── sleep_quality (1-10)
├── notes
└── created_at

-- Appointments
CounsellingAppointment
├── id (PK)
├── student_id (FK)
├── counsellor_id (FK)
├── preferred_date
├── preferred_time
├── reason
├── status (requested/confirmed/completed/cancelled)
├── counsellor_notes
└── created_at
```

---

## 🔄 Data Flow

### Anonymous Screening Flow
```
1. User → /screening/ (HTML page)
2. Fill PCL-5 form (20 items)
3. POST /api/screening/submit/
4. Create TraineeSession (anonymous_token, no student link)
5. Create ScreeningResult (PCL-5 scores)
6. Run NLP analysis (if narrative provided)
7. Run ML classifier (severity prediction)
8. Create NLPResult
9. If moderate+: Create Referral
10. Return feedback to user
```

### Authenticated Screening Flow
```
1. Student logs in → Token stored
2. Student → /screening/ (with auth token)
3. Fill PCL-5 form
4. POST /api/screening/submit/ (with Authorization header)
5. Create TraineeSession (with student_id link) ← ✨ Difference
6. Create ScreeningResult
7. Run NLP & ML (same as anonymous)
8. Create NLPResult
9. If moderate+: Create Referral
10. Return feedback
11. Student can view history in dashboard ← ✨ New feature
```

### Student Dashboard Flow
```
1. Student logs in → Token stored
2. Navigate to /trainee/dashboard/
3. JavaScript: GET /api/student/dashboard/ (with token)
4. Backend queries:
   - ScreeningResult.filter(trainee_session__student=user)
   - Aggregate statistics
   - Generate recommendations
   - Get appointments
5. Return JSON data
6. Frontend renders dashboard
```

---

## 🛣️ URL Routes

### HTML Pages (Server-Rendered)
```
/                           → home.html
/screening/                 → screening/screening.html
/trainee/login/             → trainee/login.html ✨ NEW
/trainee/register/          → trainee/register.html ✨ NEW
/trainee/dashboard/         → trainee/dashboard.html ✨ NEW
/counsellor/login/          → counsellor/login.html
/counsellor/dashboard/      → counsellor/dashboard.html
```

### REST API Endpoints
```
# Authentication
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/register/student/
GET    /api/auth/me/
PUT    /api/auth/profile/
POST   /api/auth/change-password/

# Student Dashboard
GET    /api/student/dashboard/
GET    /api/student/screenings/
GET    /api/student/wellness/
POST   /api/student/wellness/
GET    /api/student/appointments/
POST   /api/student/appointments/

# Screening
POST   /api/screening/submit/
GET    /api/screening/results/
GET    /api/screening/results/<id>/

# Referrals
GET    /api/referrals/
GET    /api/referrals/<id>/
POST   /api/referrals/<id>/update/

# Dashboard Analytics
GET    /api/dashboard/summary/
GET    /api/dashboard/cases/
GET    /api/dashboard/alerts/

# Admin
GET    /api/admin/dashboard/
GET    /api/admin/users/
POST   /api/admin/users/
GET    /api/admin/users/<id>/
PUT    /api/admin/users/<id>/
DELETE /api/admin/users/<id>/
```

---

## 📦 Dependencies

### Main Python Packages
```
Django==4.2+                # Web framework
djangorestframework==3.14+  # REST API
django-cors-headers         # CORS support
scikit-learn               # Machine learning
pandas                     # Data processing
numpy                      # Numerical operations
joblib                     # Model persistence
textblob / vaderSentiment  # NLP (sentiment)
Pillow                     # Image processing
```

### Frontend
```
Vanilla JavaScript         # No framework (lightweight)
HTML5 / CSS3              # Modern web standards
Fetch API                 # HTTP requests
LocalStorage              # Client-side token storage
```

---

## 🎨 Design Patterns

### Backend
- **MVT (Model-View-Template)**: Django default
- **REST API**: Stateless, token-authenticated
- **Serializers**: DRF for validation & serialization
- **Signals**: (If needed for auto-actions)
- **Middleware**: CORS, CSRF, Authentication

### Frontend
- **Progressive Enhancement**: Works without JS
- **Responsive Design**: Mobile-first
- **Token-based Auth**: Stateless client
- **API-driven**: Fetch data on demand

---

## 🔒 Security Layers

1. **Authentication**: Token-based (DRF)
2. **Authorization**: Role-based permissions
3. **Password Security**: Django's PBKDF2
4. **Data Privacy**: Student ID hashing, anonymous tokens
5. **CSRF Protection**: Django middleware
6. **CORS**: Controlled origins
7. **SQL Injection**: ORM prevents
8. **XSS**: Template auto-escaping

---

## 📈 Scalability Considerations

### Current Setup (Single Server)
- SQLite database
- Single Django instance
- File-based sessions
- Local storage for models

### Production Recommendations
- PostgreSQL database
- Gunicorn + Nginx
- Redis for caching/sessions
- Separate media/static servers
- Load balancer for multiple instances
- CDN for static assets
- Celery for async tasks
- Elasticsearch for search (optional)

---

## 🔧 Configuration Files

### settings.py
```python
# Key Settings
DEBUG = True (dev) / False (prod)
SECRET_KEY = (from environment)
ALLOWED_HOSTS = (from environment)
AUTH_USER_MODEL = 'users.User'
DATABASES = SQLite (dev) / PostgreSQL (prod)
STATIC_URL / STATIC_ROOT
MEDIA_URL / MEDIA_ROOT
REST_FRAMEWORK = Token auth + pagination
CORS_ALLOWED_ORIGINS = Frontend URLs
```

### urls.py
```python
# URL Patterns
admin/           → Django admin
/                → HTML pages
/trainee/*       → Trainee pages ✨ NEW
/counsellor/*    → Counsellor pages
/api/*           → REST API
```

---

## 📝 Code Quality

### Standards
- PEP 8 (Python style guide)
- Django best practices
- RESTful API design
- Docstrings for functions
- Type hints (recommended)

### Testing
- Unit tests (models, views)
- Integration tests (workflows)
- API tests (DRF test client)
- Frontend tests (manual for now)

---

## 🎓 Learning Resources

- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **Python**: https://docs.python.org/3/
- **JavaScript**: https://developer.mozilla.org/
- **PTSD/PCL-5**: DSM-5 documentation

---

**Project Structure Version**: 1.0.0  
**Last Updated**: June 22, 2026  
**Status**: Complete ✅
