# MiNaP PTSD Indicator and Mitigation System

## 🎓 The Michuki National Polytechnic - PTSD Screening Platform

A comprehensive, AI-powered mental health screening and referral system designed for The Michuki National Polytechnic. This system combines validated psychometric instruments (PCL-5) with machine learning to provide early detection and support for trainees experiencing PTSD symptoms.

---

## ✨ Key Features

### For Students/Trainees
- 🔐 **Secure Registration & Login** - Create an account to track your mental health journey
- 📊 **Personal Dashboard** - View your screening history, trends, and personalized recommendations
- 📋 **Anonymous Screening** - Take PTSD assessments without creating an account
- ❤️ **Wellness Tracking** - Daily check-ins to monitor mood, stress, and sleep
- 📅 **Appointment Management** - Book and manage counselling appointments
- 🔒 **Complete Privacy** - Anonymous sessions or secure authenticated access

### For Counsellors
- 📈 **Dashboard Analytics** - View institutional trends and severity distributions
- 🚨 **Auto-Referral System** - Moderate/severe cases automatically flagged
- 📝 **Case Management** - Track referrals, add notes, schedule follow-ups
- 🎯 **Priority Alerts** - High-risk cases highlighted for immediate attention
- 📊 **Data-Driven Insights** - Aggregate reports for institutional planning

### System Features
- 🤖 **AI-Powered Classification** - Machine learning model trained using SEMMA methodology
- 📊 **PCL-5 Assessment** - Validated 20-item PTSD checklist for DSM-5
- 🧠 **NLP Text Analysis** - Sentiment analysis and crisis keyword detection
- 🌐 **Bilingual Support** - English and Kiswahili interfaces
- 🔒 **Privacy-First Design** - Compliant with Kenya Data Protection Act (2019)
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minap-system
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser** (optional, for admin access)
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Home: http://127.0.0.1:8000/
   - Student Login: http://127.0.0.1:8000/trainee/login/
   - Student Registration: http://127.0.0.1:8000/trainee/register/
   - Anonymous Screening: http://127.0.0.1:8000/screening/
   - **Counsellor Login**: http://127.0.0.1:8000/counsellor/login/

8. **Create test accounts** (optional)
   ```bash
   python manage.py shell
   ```
   
   ```python
   from users.models import User
   
   # Test student
   User.objects.create_user(
       username='student1', password='student123',
       email='student1@minap.ac.ke', role='student',
       first_name='Test', last_name='Student',
       student_id='TEST-001/2023', department='IT',
       programme='Diploma in IT'
   )
   
   # Test counsellor
   User.objects.create_user(
       username='counsellor1', password='counsellor123',
       email='counsellor1@minap.ac.ke', role='counsellor',
       first_name='Dr. Jane', last_name='Doe',
       department='Guidance', specialization='PTSD Counselling'
   )
   ```

---

## 📚 Documentation

### Core Documents
- **[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)** - Comprehensive technical documentation
- **[QUICK_START.md](QUICK_START.md)** - Step-by-step testing guide
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Summary of recent changes
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete project file tree
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - QA testing procedures
- **[PROJECT-PROPOSAL-STELLA-MWAURA.docx](PROJECT-PROPOSAL-STELLA-MWAURA.docx)** - Original project proposal

### Key Sections
1. **User Guides** - How to use the system
2. **Developer Guides** - How to extend the system
3. **API Documentation** - REST endpoint reference
4. **Testing** - QA and validation procedures
5. **Deployment** - Production setup guide

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER (HTML/CSS/JS)    │
│   - Student Portal                       │
│   - Counsellor Dashboard                 │
│   - Anonymous Screening                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    APPLICATION LAYER (Django/Python)     │
│   - User Management                      │
│   - Screening Engine                     │
│   - ML Classifier (Random Forest)        │
│   - NLP Processor                        │
│   - Referral System                      │
│   - Analytics Dashboard                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       DATA LAYER (SQLite/PostgreSQL)     │
│   - Users & Roles                        │
│   - Screening Results                    │
│   - Referrals                            │
│   - Appointments                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Backend
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ML**: scikit-learn, pandas, numpy
- **NLP**: TextBlob / VADER
- **Authentication**: Token-based (DRF)

### Frontend
- **Languages**: HTML5, CSS3, JavaScript
- **API Client**: Fetch API
- **Storage**: LocalStorage (tokens)
- **Design**: Responsive, mobile-first

### Security
- **Encryption**: TLS/HTTPS
- **Authentication**: Token-based
- **Password**: PBKDF2 hashing
- **Privacy**: Anonymous sessions, student ID hashing
- **Compliance**: Kenya Data Protection Act (2019)

---

## 📊 Database Models

### Core Entities
- **User** - Students, counsellors, admins with role-based access
- **TraineeSession** - Anonymous or authenticated screening sessions
- **ScreeningResult** - PCL-5 responses, scores, and severity classification
- **NLPResult** - Derived text analysis (sentiment, flags)
- **Referral** - Case management for counsellors
- **WellnessCheckIn** - Daily mood/stress tracking
- **CounsellingAppointment** - Scheduling system

---

## 🔐 User Roles

### Student/Trainee
- Register and login
- Complete screenings (anonymous or authenticated)
- View screening history
- Track wellness over time
- Book counselling appointments
- Access psychoeducational resources

### Counsellor
- Login to professional portal
- View auto-generated referrals
- Manage cases (status, notes, follow-ups)
- Access high-priority alerts
- Review institutional analytics

### Admin/Head Counsellor
- All counsellor permissions
- User management (CRUD)
- System-wide analytics
- Configuration and settings

---

## 🧪 Testing

### Run Tests
```bash
cd backend
python manage.py test
```

### Manual Testing
Follow the comprehensive **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** document.

### Create Test Data
```bash
python manage.py shell

from users.models import User

# Create test student
User.objects.create_user(
    username='student1',
    password='student123',
    email='student1@minap.ac.ke',
    role='student',
    first_name='Test',
    last_name='Student',
    student_id='TEST-001/2023',
    department='IT',
    programme='Diploma in IT'
)
```

---

## 📈 Project Status

### ✅ Completed Features
- [x] Student registration and authentication
- [x] Student dashboard with analytics
- [x] Anonymous screening workflow
- [x] Authenticated screening with history
- [x] PCL-5 assessment implementation
- [x] Severity classification (5 levels)
- [x] Cluster score calculation (4 DSM-5 clusters)
- [x] Auto-referral system
- [x] NLP text analysis
- [x] Counsellor dashboard
- [x] Case management system
- [x] Wellness check-ins
- [x] Appointment scheduling
- [x] Bilingual support (EN/SW)
- [x] Privacy-compliant design

### 🔄 In Progress
- [ ] ML model training with real data
- [ ] System Usability Scale (SUS) evaluation
- [ ] Production deployment
- [ ] Email notifications
- [ ] SMS integration

### 📋 Planned Features
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Mobile app (React Native)
- [ ] USSD support for feature phones
- [ ] Integration with national health systems
- [ ] Advanced analytics and reporting
- [ ] Telemedicine integration

---

## 🚢 Deployment

### Development
```bash
python manage.py runserver
```

### Production
1. Set `DEBUG = False` in settings.py
2. Configure PostgreSQL database
3. Set strong `SECRET_KEY` from environment
4. Configure `ALLOWED_HOSTS`
5. Enable HTTPS/TLS
6. Use Gunicorn + Nginx
7. Set up Redis for caching
8. Configure email backend
9. Set up logging and monitoring
10. Run `python manage.py collectstatic`

See deployment guide in documentation for details.

---

## 📄 License

This project is developed for The Michuki National Polytechnic as part of an academic research project.

---

## 👥 Contributors

- **Stella Mwaura** - Project Developer (SCT221-D1-0071/2023)
- **Dr. Dennis Njagi (DON)** - Project Supervisor
- **MiNaP Guidance & Counselling Office** - Domain Experts

---

## 📞 Support

For technical support or questions:
- Review the documentation in the `/docs` folder
- Check the [QUICK_START.md](QUICK_START.md) guide
- Contact: MiNaP IT Department

---

## 🙏 Acknowledgments

- The Michuki National Polytechnic for institutional support
- Guidance and Counselling office for domain expertise
- Participating students for validation testing
- Open-source community (Django, scikit-learn, etc.)

---

## 📋 Project Information

- **Institution**: The Michuki National Polytechnic
- **Location**: Murang'a County, Kenya
- **Project Type**: Bachelor's Degree Final Year Project
- **Field**: Information Technology
- **Year**: 2023-2026
- **Status**: Implementation Complete ✅

---

## 🔗 Quick Links

- [Student Portal](/trainee/login/)
- [Register New Account](/trainee/register/)
- [Anonymous Screening](/screening/)
- [Counsellor Portal](/counsellor/login/)
- [Django Admin](/admin/)

---

## 📊 System Statistics

Based on project documentation:
- **Target Sample Size**: 150+ trainees
- **Screening Time**: ~10 minutes
- **Severity Levels**: 5 (Minimal, Mild, Moderate, Severe, Critical)
- **PCL-5 Items**: 20 (0-4 scale, total 0-80)
- **DSM-5 Clusters**: 4 (Intrusion, Avoidance, Cognition/Mood, Arousal/Reactivity)
- **Target Accuracy**: ≥80% (ML classifier)
- **Target SUS Score**: ≥70 ("Good" usability)

---

## 🎯 Research Objectives

This system supports the following research objectives:

1. **Establish prevalence** of PTSD symptoms among trainees
2. **Develop ML model** for severity classification
3. **Implement AI-based screening** and referral system
4. **Measure system accuracy** and usability

---

## 📖 Citation

If using this work for research:

```
Mwaura, S. (2026). MiNaP PTSD Indicator and Mitigation System: 
An AI-Based Mental Health Screening and Referral Platform. 
The Michuki National Polytechnic, Murang'a County, Kenya.
```

---

**Version**: 1.0.0  
**Last Updated**: June 22, 2026  
**Status**: Ready for Testing ✅

---

## 🌟 Key Differentiators

What makes MiNaP unique:

1. **Context-Aware**: Designed specifically for Kenyan institutional context
2. **Privacy-First**: Anonymous option for stigma reduction
3. **Dual Access**: Works with or without student accounts
4. **AI-Powered**: Machine learning for accurate classification
5. **Integrated Referral**: Seamless connection to counselling services
6. **Bilingual**: English and Kiswahili support
7. **Evidence-Based**: Uses validated PCL-5 instrument
8. **Scalable**: Can be deployed to other institutions

---

**Welcome to MiNaP! Your mental wellbeing matters. 💚**
