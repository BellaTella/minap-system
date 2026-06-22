# Dashboard Stats Fix - Summary

## Issue Resolved ✅

**Problem**: Trainee dashboard was showing "0" for all statistics and "Never" for last screening date.

**Root Causes Identified**:
1. **No completed screenings**: The user had started a screening session but never completed it (session existed but no ScreeningResult was saved)
2. **Query bug**: The dashboard was using `.count()` on a sliced QuerySet which doesn't work properly in Django
3. **Invalid field reference**: The query was trying to filter on `student_id_hash` through a ForeignKey relationship incorrectly

## Changes Made

### 1. Fixed Dashboard Query (`backend/users/views.py`)
**Before**:
```python
screenings = ScreeningResult.objects.filter(
    Q(trainee_session__student=request.user) | 
    Q(trainee_session__student_id_hash=request.user.student_id_hash)
).select_related('trainee_session').order_by('-created_at')[:10]

return Response({
    'total_screenings': screenings.count(),  # ❌ BUG: count() on sliced queryset
    ...
})
```

**After**:
```python
# Get all screening history for this student
all_screenings = ScreeningResult.objects.filter(
    trainee_session__student=request.user
).select_related('trainee_session').order_by('-created_at')

# Get total count
total_screenings = all_screenings.count()  # ✅ Count before slicing

# Get recent screenings for display
screenings = all_screenings[:10]

return Response({
    'total_screenings': total_screenings,
    ...
})
```

**Key Fixes**:
- Removed invalid `Q(trainee_session__student_id_hash=...)` query
- Count screenings BEFORE slicing the queryset
- Use proper variable names for clarity

### 2. Fixed Screening History Query
Also fixed the same issue in `student_screening_history()` view - removed the invalid `student_id_hash` reference.

## Test Data Created

Created 2 test screenings for `student1` user:

1. **Screening #5** (Today):
   - PCL-5 Score: 41/80
   - Severity: **Severe**
   - Cluster Scores: Intrusion=11, Avoidance=4, Cognition/Mood=13, Arousal/Reactivity=13

2. **Screening #6** (3 days ago):
   - PCL-5 Score: 17/80
   - Severity: **Mild**
   - Shows improvement trend

## API Response Verification

Dashboard endpoint (`/api/student/dashboard/`) now returns:
```json
{
  "total_screenings": 2,
  "severity_distribution": {
    "severe": 1,
    "mild": 1
  },
  "severity_timeline": [
    {
      "date": "2026-06-19",
      "severity": "mild",
      "pcl5_score": 17
    },
    {
      "date": "2026-06-22",
      "severity": "severe",
      "pcl5_score": 41
    }
  ],
  "latest_screening": {
    "date": "2026-06-22T16:59:09.288297+00:00",
    "severity": "severe",
    "pcl5_score": 41
  },
  "wellness_checkins_count": 0,
  "recent_wellness": [],
  "upcoming_appointments": [],
  "recent_appointments": [],
  "recommendations": [
    {
      "type": "urgent",
      "title": "Professional Support Recommended",
      "message": "Your recent screening indicates you may benefit from professional support. Please book a counselling appointment.",
      "action": "book_appointment"
    },
    {
      "type": "info",
      "title": "Track Your Progress",
      "message": "Daily wellness check-ins help you monitor your mental health journey.",
      "action": "checkin"
    }
  ]
}
```

## How to Test

### Option 1: Use Existing Test Data
1. **Login as student1**: Username: `student1`, Password: `student123`
2. **Go to trainee dashboard**: Navigate to `/trainee/dashboard/`
3. **Verify stats display**:
   - ✅ Total Screenings: 2
   - ✅ Last Screening: Today's date
   - ✅ Wellness Check-ins: 0
   - ✅ Upcoming Appointments: 0
   - ✅ Recent screenings showing both mild and severe results
   - ✅ Recommendations displayed

### Option 2: Take a Real Screening
1. **Login as student1** or any student account
2. **Go to**: `/screening/` or click "Take Screening" button
3. **Complete the full PCL-5 questionnaire** (20 questions)
4. **Submit the screening**
5. **Return to dashboard** - stats should update

## Anonymous vs Authenticated Screening

**✅ CONFIRMED**: The system supports BOTH modes per design requirements:

1. **Anonymous Screening** (No login required):
   - Anyone can take screening without creating an account
   - Session is created with UUID token
   - `student` field in `TraineeSession` remains `NULL`
   - Privacy-first design for sensitive data

2. **Authenticated Screening** (Logged in):
   - Student must be logged in
   - Session is created with link to student account
   - `student` field in `TraineeSession` is set to the logged-in user
   - Enables dashboard tracking and history
   - Screenings appear on student dashboard

**How Authentication Works**:
```python
# In screening/views.py submit_screening()
student_user = None
if request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'student':
    student_user = request.user

session = TraineeSession.objects.create(
    anonymous_token=token,
    student=student_user,  # None for anonymous, User instance for authenticated
    consent=data['consent'],
    gender=data['gender'],
    department=data['department'],
    programme_duration=data.get('programme_duration', '1_year'),
)
```

## Files Modified

1. ✅ `backend/users/views.py` - Fixed dashboard query logic
2. ✅ Created test data scripts for verification

## Next Steps for User

1. **Test the dashboard**: Login as student1 and verify the stats are displaying correctly
2. **Take live screening**: Have a student take an actual screening while logged in
3. **Check browser console**: Open DevTools (F12) and check for any JavaScript errors
4. **Verify timeline chart**: Make sure the severity timeline is rendering properly

## Technical Notes

- **QuerySet Slicing**: In Django, `.count()` should be called BEFORE slicing (e.g., `[:10]`)
- **ForeignKey Filters**: Cannot directly filter on fields of the related object through the foreign key using dot notation in Q objects incorrectly
- **Correct Pattern**: `trainee_session__student=user` ✅
- **Incorrect Pattern**: `trainee_session__student_id_hash=hash` ❌ (student_id_hash is not on TraineeSession)

## Test Account Credentials

**Students**:
- Username: `student1` | Password: `student123` (Has 2 test screenings)
- Username: `trainee1` | Password: `trainee123`

**Counsellors**:
- Username: `counsellor1` | Password: `counsellor123`
- Username: `counsellor2` | Password: `test123`

---

**Status**: ✅ **RESOLVED** - Dashboard now correctly displays screening statistics and history for authenticated students.
