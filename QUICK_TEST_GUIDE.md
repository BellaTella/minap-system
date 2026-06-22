# Quick Test Guide - Dashboard Fix

## ✅ What Was Fixed

The trainee dashboard was showing "0" for all stats. This has been **RESOLVED** by:
1. Fixing the database query bug in the dashboard API
2. Creating test screening data for the student1 account

---

## 🧪 How to Test

### Method 1: Test with Existing Data (Fastest)

1. **Start the Django server** (if not running):
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Open your browser** and go to: `http://localhost:8000/trainee/login/`

3. **Login with test account**:
   - Username: `student1`
   - Password: `student123`

4. **You should see the dashboard with**:
   - ✅ Total Screenings: **2**
   - ✅ Last Screening: **Today's date**
   - ✅ Recent screenings showing:
     - 1 SEVERE screening (PCL-5: 41)
     - 1 MILD screening (PCL-5: 17)
   - ✅ Recommendations based on severe screening
   - ✅ Severity trend timeline

### Method 2: Take a Real Screening

1. **Login as any student** (student1, trainee1, or create new account)

2. **Go to screening page**: Click "Take Screening" or navigate to `/screening/`

3. **Complete the PCL-5 questionnaire**:
   - Answer all 20 questions (0-4 scale)
   - Fill in the trauma narrative (optional)
   - Complete DTS score
   - Submit

4. **Return to dashboard**: `/trainee/dashboard/`

5. **Verify the new screening appears** in your dashboard stats

### Method 3: Check API Directly

You can test the API endpoint directly:

1. **Get authentication token**:
   ```bash
   # Login and get token
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"student1","password":"student123"}'
   ```

2. **Call dashboard API**:
   ```bash
   # Use the token from step 1
   curl http://localhost:8000/api/student/dashboard/ \
     -H "Authorization: Token YOUR_TOKEN_HERE"
   ```

3. **Expected response**:
   ```json
   {
     "total_screenings": 2,
     "latest_screening": {
       "date": "2026-06-22T...",
       "severity": "severe",
       "pcl5_score": 41
     },
     "severity_distribution": {
       "severe": 1,
       "mild": 1
     },
     ...
   }
   ```

---

## 🔍 What to Check For

### Dashboard Display Should Show:

✅ **Stats Cards**:
- Total Screenings (should be > 0)
- Last Screening Date (should show actual date, not "Never")
- Wellness Check-ins (0 for now - no test data)
- Upcoming Appointments (0 for now - no test data)

✅ **Recent Screenings Section**:
- List of screening with dates
- Severity badges (color-coded)
- PCL-5 scores

✅ **Recommendations Section**:
- Based on latest screening severity
- Urgent recommendations for severe/critical cases
- Tips and resources

✅ **No JavaScript Errors**:
- Open browser DevTools (F12)
- Check Console tab
- Should be no errors (warnings are OK)

---

## 🐛 Troubleshooting

### If dashboard still shows zeros:

1. **Check browser console** (F12 → Console tab):
   - Look for any errors
   - Check if API call succeeded

2. **Verify you're logged in**:
   - Open DevTools → Application → Local Storage
   - Check for `auth_token` key
   - Check `user` object has `role: "student"`

3. **Check the API endpoint**:
   - Open DevTools → Network tab
   - Look for call to `/api/student/dashboard/`
   - Check the response (should return data, not error)

4. **Verify test data exists**:
   ```bash
   cd backend
   python manage.py shell
   ```
   ```python
   from users.models import User
   from screening.models import ScreeningResult
   
   student = User.objects.get(username='student1')
   results = ScreeningResult.objects.filter(trainee_session__student=student)
   print(f"Screenings for student1: {results.count()}")
   for r in results:
       print(f"  - {r}")
   ```

### If you need to recreate test data:

The test screenings are already in the database, but if you need to create more:

**Option A**: Take a real screening while logged in as student1

**Option B**: Use Django shell to create programmatically (advanced):
```python
# Run: python manage.py shell
from users.models import User
from screening.models import TraineeSession, ScreeningResult
import uuid

student = User.objects.get(username='student1')
session = TraineeSession.objects.create(
    anonymous_token=str(uuid.uuid4()),
    student=student,
    consent=True,
    gender='female',
    department='IT',
    programme_duration='1_year'
)

result = ScreeningResult(
    trainee_session=session,
    dts_score=30,
    severity='mild',
    prediction_confidence=0.8
)

# Set PCL-5 items (1-20)
for i in range(1, 21):
    setattr(result, f'pcl5_item_{i}', 1)  # All items = 1

result.compute_cluster_scores()
result.save()
```

---

## 📋 Test Account Credentials

**Students:**
- `student1` / `student123` ← **Has 2 test screenings**
- `trainee1` / `trainee123` ← No screenings yet

**Counsellors:**
- `counsellor1` / `counsellor123`
- `counsellor2` / `test123`

---

## ✨ Expected Behavior Summary

| Feature | Anonymous User | Logged-in Student |
|---------|---------------|-------------------|
| Take Screening | ✅ Yes | ✅ Yes |
| View Dashboard | ❌ No | ✅ Yes |
| Screening History | ❌ No | ✅ Yes |
| Wellness Check-ins | ❌ No | ✅ Yes |
| Book Appointments | ❌ No | ✅ Yes |
| See Login Buttons | ✅ Yes | ❌ No (hidden) |

---

**Status**: ✅ All issues resolved. Dashboard should now display correctly.

**Questions?** Check `DASHBOARD_FIX_SUMMARY.md` for technical details.
