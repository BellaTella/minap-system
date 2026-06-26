# MiNaP PTSD System - Quick Start Guide

## Getting Started

### 1. Start the Development Server

```bash
cd backend
python manage.py runserver
```

The server will start at: **http://127.0.0.1:8000**

---

## 2. Access Points

### For Trainees/Students

#### 🏠 Home Page
```
http://127.0.0.1:8000/
```
- Overview of the system
- Start anonymous screening
- Links to login/register

#### 📝 Register New Account
```
http://127.0.0.1:8000/trainee/register/
```
**Required Information**:
- First Name and Last Name
- Student ID (unique)
- Email (unique)
- Username (unique)
- Password (minimum 8 characters)
- Department
- Programme

**Optional Information**:
- Year of Study
- Gender
- Phone Number

#### 🔐 Student Login
```
http://127.0.0.1:8000/trainee/login/
```
**Credentials**: Username/Password

#### 📊 Student Dashboard
```
http://127.0.0.1:8000/trainee/dashboard/
```
**Features**:
- View screening history
- Check statistics
- See recommendations
- Manage appointments
- Take new screening

#### 📋 Anonymous Screening
```
http://127.0.0.1:8000/screening/
```
- No login required
- Completely anonymous
- Instant results

---

### For Counsellors

#### 🔐 Counsellor Login
```
http://127.0.0.1:8000/counsellor/login/
```

#### 📈 Counsellor Dashboard
```
http://127.0.0.1:8000/counsellor/dashboard/
```

---

## 3. Test Scenarios

### Scenario 1: New Student Registration

1. Go to `http://127.0.0.1:8000/trainee/register/`
2. Fill in the registration form:
   ```
   First Name: John
   Last Name: Doe
   Student ID: SCT221-D1-0100/2023
   Email: john.doe@minap.ac.ke
   Username: johndoe
   Password: SecurePass123
   Confirm Password: SecurePass123
   Department: Information Technology
   Programme: Diploma in IT
   Year of Study: 2
   Gender: Male
   ```
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### Scenario 2: Student Login

1. Go to `http://127.0.0.1:8000/trainee/login/`
2. Enter credentials:
   ```
   Username: johndoe
   Password: SecurePass123
   ```
3. Click "Login"
4. You'll be redirected to your dashboard

### Scenario 3: Take Screening (Logged In)

1. Login to your student account
2. From dashboard, click "Take New Screening"
3. Complete the PCL-5 questionnaire
4. Submit and receive instant feedback
5. Your screening will be saved to your history
6. Return to dashboard to see updated statistics

### Scenario 4: Anonymous Screening

1. Go to `http://127.0.0.1:8000/screening/`
2. Complete the consent form
3. Fill in basic demographics (anonymous)
4. Complete the PCL-5 questionnaire
5. Receive instant results and recommendations
6. If severity is moderate+, automatic referral is created

---

## 4. API Testing

### Using curl or Postman

#### Register New Student
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/student/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@minap.ac.ke",
    "password": "TestPass123",
    "password2": "TestPass123",
    "first_name": "Test",
    "last_name": "User",
    "student_id": "SCT221-D1-0999/2023",
    "department": "IT",
    "programme": "Diploma in IT"
  }'
```

#### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }'
```

**Response**:
```json
{
  "token": "abc123xyz...",
  "user": {
    "id": 1,
    "username": "testuser",
    "role": "student",
    ...
  }
}
```

#### Get Dashboard Data
```bash
curl -X GET http://127.0.0.1:8000/api/student/dashboard/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

---

## 5. Troubleshooting

### Issue: Port already in use
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or use a different port
python manage.py runserver 8080
```

### Issue: Database not found
```bash
# Run migrations
python manage.py migrate
```

### Issue: Static files not loading
```bash
# Collect static files
python manage.py collectstatic --noinput
```

### Issue: Admin account needed
```bash
# Create superuser
python manage.py createsuperuser
```

---

## 6. Default Test Accounts

### Create Test Data

```bash
# Start Python shell
python manage.py shell
```

```python
from users.models import User

# Create test student
student = User.objects.create_user(
    username='student1',
    email='student1@minap.ac.ke',
    password='student123',
    first_name='Alice',
    last_name='Wanjiru',
    role='student',
    student_id='SCT221-D1-0001/2023',
    department='Information Technology',
    programme='Diploma in IT',
    year_of_study=2,
    gender='female'
)

# Create test counsellor
counsellor = User.objects.create_user(
    username='counsellor1',
    email='counsellor1@minap.ac.ke',
    password='counsellor123',
    first_name='Dr. James',
    last_name='Mwangi',
    role='counsellor',
    department='Guidance and Counselling',
    specialization='PTSD and Trauma Counselling',
    license_number='KCL-2020-1234'
)

print("Test accounts created!")
```

**Test Credentials**:
- **Student**: `student1` / `student123`
- **Counsellor**: `counsellor1` / `counsellor123`

---

## 7. Key Features to Test

### ✅ Student Features
- [ ] Registration
- [ ] Login
- [ ] Dashboard view
- [ ] Take screening (authenticated)
- [ ] View screening history
- [ ] View recommendations
- [ ] Book appointments (if implemented)
- [ ] Logout

### ✅ Anonymous Features
- [ ] Take screening without login
- [ ] Receive instant feedback
- [ ] Automatic referral creation

### ✅ System Features
- [ ] PCL-5 score calculation
- [ ] Severity classification
- [ ] Cluster sub-scores
- [ ] NLP text analysis (if narrative provided)
- [ ] Referral creation for moderate+ cases

---

## 8. Browser Console Commands

### Check if logged in
```javascript
console.log(localStorage.getItem('auth_token'));
console.log(JSON.parse(localStorage.getItem('user')));
```

### Clear session
```javascript
localStorage.clear();
```

### Test API call
```javascript
fetch('/api/auth/me/', {
    headers: {
        'Authorization': 'Token ' + localStorage.getItem('auth_token')
    }
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## 9. Expected System Behavior

### Anonymous Screening
1. No authentication required
2. Generate unique session token
3. Store demographic data (not PII)
4. Calculate PCL-5 scores
5. Classify severity using ML model
6. Create referral if moderate/severe/critical
7. Display personalized feedback

### Authenticated Screening
1. Detect logged-in student
2. Link screening to student account
3. All anonymous features +
4. Save to screening history
5. Update dashboard statistics
6. Enable longitudinal tracking

### Dashboard Features
1. Total screenings count
2. Last screening date and severity
3. Severity trend visualization
4. Personalized recommendations
5. Recent screenings list
6. Wellness check-ins (if used)
7. Appointments overview

---

## 10. Production Checklist

Before deploying to production:

- [ ] Change `DEBUG = False` in settings.py
- [ ] Set strong `SECRET_KEY`
- [ ] Configure proper database (PostgreSQL recommended)
- [ ] Enable HTTPS/TLS
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up CORS properly
- [ ] Configure email backend
- [ ] Set up backup system
- [ ] Configure logging
- [ ] Run security audit
- [ ] Test all user flows
- [ ] Load test the system
- [ ] Set up monitoring

---

## Support & Documentation

- **Full Documentation**: See `README.md` and `SYSTEM_WORKFLOWS.md`
- **Project Proposal**: See `PROJECT-PROPOSAL-STELLA-MWAURA.docx`
- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/

---

**Happy Testing! 🚀**
