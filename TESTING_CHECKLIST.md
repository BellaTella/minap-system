# MiNaP PTSD System - Testing Checklist

## Pre-Testing Setup

### ✅ Environment Setup
- [ ] Python 3.8+ installed
- [ ] Virtual environment activated
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] Database migrations applied (`python manage.py migrate`)
- [ ] Static files collected (if needed)
- [ ] Server starts without errors (`python manage.py runserver`)

### ✅ Test Data Created
- [ ] At least 1 test student account
- [ ] At least 1 test counsellor account
- [ ] At least 1 admin/superuser account
- [ ] Sample screening data (optional)

---

## 1. Student Registration Testing

### Test Case 1.1: Valid Registration
- [ ] Navigate to `/trainee/register/`
- [ ] Fill all required fields correctly
- [ ] Passwords match
- [ ] Click "Create Account"
- [ ] **Expected**: Success message, automatic login, redirect to dashboard
- [ ] **Verify**: New user in database (`User.objects.filter(username='...')`)

### Test Case 1.2: Duplicate Username
- [ ] Try registering with existing username
- [ ] **Expected**: Error message "Username already exists"

### Test Case 1.3: Duplicate Email
- [ ] Try registering with existing email
- [ ] **Expected**: Error message "Email already registered"

### Test Case 1.4: Duplicate Student ID
- [ ] Try registering with existing student ID
- [ ] **Expected**: Error message "Student ID already registered"

### Test Case 1.5: Password Mismatch
- [ ] Enter different passwords in password fields
- [ ] **Expected**: Error message "Passwords do not match"

### Test Case 1.6: Missing Required Fields
- [ ] Leave required field empty
- [ ] **Expected**: Browser validation or error message

### Test Case 1.7: Weak Password
- [ ] Enter password with < 8 characters
- [ ] **Expected**: Error message about password requirements

---

## 2. Student Login Testing

### Test Case 2.1: Valid Login
- [ ] Navigate to `/trainee/login/`
- [ ] Enter valid username and password
- [ ] Click "Login"
- [ ] **Expected**: Token stored, redirect to dashboard
- [ ] **Verify**: `localStorage.getItem('auth_token')` returns token

### Test Case 2.2: Invalid Credentials
- [ ] Enter wrong username or password
- [ ] **Expected**: Error message "Invalid credentials"

### Test Case 2.3: Role Restriction
- [ ] Login with counsellor credentials on student login page
- [ ] **Expected**: Error message "Students only"

### Test Case 2.4: Logout
- [ ] Click logout button on dashboard
- [ ] **Expected**: Token cleared, redirect to login
- [ ] **Verify**: `localStorage.getItem('auth_token')` returns null

---

## 3. Student Dashboard Testing

### Test Case 3.1: Dashboard Access (Authenticated)
- [ ] Login as student
- [ ] Navigate to `/trainee/dashboard/`
- [ ] **Expected**: Dashboard loads with user data

### Test Case 3.2: Dashboard Access (Unauthenticated)
- [ ] Clear localStorage
- [ ] Try accessing `/trainee/dashboard/` directly
- [ ] **Expected**: Redirect to login page

### Test Case 3.3: Statistics Display
- [ ] Verify "Total Screenings" shows correct count
- [ ] Verify "Last Screening Date" shows correct date
- [ ] Verify "Wellness Check-ins" shows correct count
- [ ] Verify "Upcoming Appointments" shows correct count

### Test Case 3.4: Screening History
- [ ] Verify recent screenings are displayed
- [ ] Check severity badges are correct colors
- [ ] Verify dates are formatted correctly
- [ ] Check "No screening history" message if empty

### Test Case 3.5: Recommendations
- [ ] Verify recommendations based on latest screening
- [ ] Check recommendation types (urgent/tip/info)
- [ ] Verify "Take screening" message if no history

### Test Case 3.6: Navigation
- [ ] Click "Take New Screening" button
- [ ] **Expected**: Navigate to screening page
- [ ] Click "Manage Appointments" button
- [ ] **Expected**: Navigate to appointments page (or show message)

---

## 4. Anonymous Screening Testing

### Test Case 4.1: Complete Anonymous Screening
- [ ] Navigate to `/screening/` (without login)
- [ ] Accept consent
- [ ] Fill demographic information
- [ ] Complete all 20 PCL-5 items
- [ ] Submit
- [ ] **Expected**: Instant feedback, severity classification
- [ ] **Verify**: TraineeSession created with no student link

### Test Case 4.2: Minimal Severity
- [ ] Answer all items with 0 (Not at all)
- [ ] **Expected**: Severity = "Minimal", PCL-5 score = 0
- [ ] **Verify**: No referral created

### Test Case 4.3: Moderate Severity
- [ ] Answer to get PCL-5 score 32-43
- [ ] **Expected**: Severity = "Moderate", referral created
- [ ] **Verify**: Referral exists with status="pending"

### Test Case 4.4: Severe Severity
- [ ] Answer to get PCL-5 score 44-59
- [ ] **Expected**: Severity = "Severe", urgent alert
- [ ] **Verify**: Referral created, crisis message shown

### Test Case 4.5: Critical Severity
- [ ] Answer to get PCL-5 score 60-80
- [ ] **Expected**: Severity = "Critical", high-priority alert
- [ ] **Verify**: Referral created, immediate help message

---

## 5. Authenticated Screening Testing

### Test Case 5.1: Login and Screen
- [ ] Login as student
- [ ] Click "Take New Screening" from dashboard
- [ ] Complete screening
- [ ] **Expected**: Screening linked to student account
- [ ] **Verify**: TraineeSession.student_id is not null

### Test Case 5.2: View History After Screening
- [ ] Complete screening while logged in
- [ ] Return to dashboard
- [ ] **Expected**: New screening appears in history
- [ ] **Verify**: Total screenings count increased

### Test Case 5.3: Multiple Screenings (Longitudinal)
- [ ] Take screening with score X
- [ ] Wait (or change date)
- [ ] Take another screening with score Y
- [ ] **Expected**: Both screenings in history
- [ ] **Verify**: Trend visible in dashboard

---

## 6. API Endpoint Testing

### Test Case 6.1: Registration API
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/student/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "api_test",
    "email": "api@test.com",
    "password": "testpass123",
    "password2": "testpass123",
    "first_name": "API",
    "last_name": "Test",
    "student_id": "API-001/2023",
    "department": "IT",
    "programme": "Diploma"
  }'
```
- [ ] **Expected**: 201 Created, token returned

### Test Case 6.2: Login API
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "api_test",
    "password": "testpass123"
  }'
```
- [ ] **Expected**: 200 OK, token and user data returned

### Test Case 6.3: Dashboard API (Authenticated)
```bash
curl -X GET http://127.0.0.1:8000/api/student/dashboard/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```
- [ ] **Expected**: 200 OK, dashboard data returned

### Test Case 6.4: Dashboard API (Unauthenticated)
```bash
curl -X GET http://127.0.0.1:8000/api/student/dashboard/
```
- [ ] **Expected**: 401 Unauthorized

### Test Case 6.5: Screening Submission API
```bash
curl -X POST http://127.0.0.1:8000/api/screening/submit/ \
  -H "Content-Type: application/json" \
  -d '{
    "consent": true,
    "gender": "male",
    "department": "IT",
    "programme_duration": "1_year",
    "pcl5_item_1": 2,
    "pcl5_item_2": 2,
    ... (all 20 items)
    "dts_score": 50
  }'
```
- [ ] **Expected**: 201 Created, feedback returned

---

## 7. UI/UX Testing

### Test Case 7.1: Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] **Expected**: Layout adapts properly

### Test Case 7.2: Browser Compatibility
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Edge
- [ ] Test on Safari (if available)
- [ ] **Expected**: Works consistently

### Test Case 7.3: Form Validation
- [ ] Try submitting empty forms
- [ ] Try invalid email formats
- [ ] Try mismatched passwords
- [ ] **Expected**: Clear error messages

### Test Case 7.4: Loading States
- [ ] Check loading indicators during API calls
- [ ] Verify disabled buttons during submission
- [ ] **Expected**: User feedback during async operations

### Test Case 7.5: Error Handling
- [ ] Stop server and try API call
- [ ] Invalid token in request
- [ ] **Expected**: User-friendly error messages

---

## 8. Security Testing

### Test Case 8.1: Token Validation
- [ ] Use expired/invalid token
- [ ] **Expected**: 401 Unauthorized, redirect to login

### Test Case 8.2: Role-Based Access
- [ ] Try accessing counsellor endpoints as student
- [ ] **Expected**: 403 Forbidden

### Test Case 8.3: SQL Injection Prevention
- [ ] Try SQL injection in form fields
- [ ] **Expected**: Django ORM prevents, no errors

### Test Case 8.4: XSS Prevention
- [ ] Try entering `<script>alert('xss')</script>` in forms
- [ ] **Expected**: Escaped/sanitized output

### Test Case 8.5: CSRF Protection
- [ ] Check CSRF token in forms
- [ ] Try POST without CSRF token
- [ ] **Expected**: 403 Forbidden

---

## 9. Data Integrity Testing

### Test Case 9.1: PCL-5 Score Calculation
- [ ] Enter known item values
- [ ] Verify total score = sum of items
- [ ] **Expected**: Score 0-80, accurate calculation

### Test Case 9.2: Cluster Scores
- [ ] Verify cluster_intrusion = items 1-5
- [ ] Verify cluster_avoidance = items 6-7
- [ ] Verify cluster_cognition_mood = items 8-14
- [ ] Verify cluster_arousal_reactivity = items 15-20
- [ ] **Expected**: Correct sub-scores

### Test Case 9.3: Severity Classification
- [ ] Score 0-19 → Minimal
- [ ] Score 20-31 → Mild
- [ ] Score 32-43 → Moderate
- [ ] Score 44-59 → Severe
- [ ] Score 60-80 → Critical
- [ ] **Expected**: Correct severity band

### Test Case 9.4: Referral Creation
- [ ] Moderate screening → Referral created
- [ ] Mild screening → No referral
- [ ] **Expected**: Auto-referral logic works

### Test Case 9.5: Anonymous Token Uniqueness
- [ ] Create multiple anonymous sessions
- [ ] **Expected**: Each has unique token

---

## 10. Integration Testing

### Test Case 10.1: End-to-End (Anonymous)
1. [ ] Visit home page
2. [ ] Click "Start Screening"
3. [ ] Complete screening
4. [ ] Receive feedback
5. [ ] **Expected**: Complete workflow without errors

### Test Case 10.2: End-to-End (New Student)
1. [ ] Visit home page
2. [ ] Click "Register"
3. [ ] Create account
4. [ ] Auto-login to dashboard
5. [ ] Click "Take Screening"
6. [ ] Complete screening
7. [ ] Return to dashboard
8. [ ] See screening in history
9. [ ] **Expected**: Complete workflow, data persisted

### Test Case 10.3: End-to-End (Returning Student)
1. [ ] Login
2. [ ] View dashboard with history
3. [ ] Take new screening
4. [ ] See updated statistics
5. [ ] Logout
6. [ ] Login again
7. [ ] History still visible
8. [ ] **Expected**: Data persistence across sessions

---

## 11. Performance Testing

### Test Case 11.1: Page Load Times
- [ ] Measure home page load time
- [ ] Measure dashboard load time
- [ ] **Expected**: < 3 seconds on broadband

### Test Case 11.2: API Response Times
- [ ] Measure dashboard API response
- [ ] Measure screening submission
- [ ] **Expected**: < 1 second for most endpoints

### Test Case 11.3: Concurrent Users
- [ ] Simulate 10+ concurrent screenings
- [ ] **Expected**: No errors, reasonable response times

---

## 12. Accessibility Testing

### Test Case 12.1: Keyboard Navigation
- [ ] Navigate forms using Tab key
- [ ] Submit using Enter key
- [ ] **Expected**: Fully keyboard accessible

### Test Case 12.2: Screen Reader
- [ ] Test with screen reader (if available)
- [ ] **Expected**: Meaningful labels and descriptions

### Test Case 12.3: Color Contrast
- [ ] Check severity badges
- [ ] Check buttons and links
- [ ] **Expected**: WCAG AA compliance

---

## 13. Edge Cases

### Test Case 13.1: Empty Dashboard
- [ ] New student with no screenings
- [ ] **Expected**: Empty state messages, no errors

### Test Case 13.2: Long Text Input
- [ ] Enter very long narrative (2000+ chars)
- [ ] **Expected**: Handled gracefully or truncated

### Test Case 13.3: Special Characters
- [ ] Use special chars in text fields
- [ ] **Expected**: Properly escaped/stored

### Test Case 13.4: Multiple Browser Tabs
- [ ] Login in two tabs
- [ ] Take action in one tab
- [ ] **Expected**: Consistent state or sync

---

## 14. Counsellor Testing

### Test Case 14.1: Counsellor Login
- [ ] Login with counsellor credentials
- [ ] **Expected**: Access to counsellor dashboard

### Test Case 14.2: View Referrals
- [ ] Check referrals list
- [ ] Filter by severity
- [ ] **Expected**: See student referrals (anonymous)

### Test Case 14.3: Update Referral
- [ ] Update referral status
- [ ] Add notes
- [ ] **Expected**: Changes saved

---

## 15. Documentation Testing

### Test Case 15.1: README Accuracy
- [ ] Follow README instructions
- [ ] **Expected**: Successful setup

### Test Case 15.2: Quick Start Guide
- [ ] Follow QUICK_START.md
- [ ] **Expected**: Can complete all test scenarios

### Test Case 15.3: API Documentation
- [ ] Test all documented endpoints
- [ ] **Expected**: Endpoints work as described

---

## Test Results Summary

### Passed: ____ / ____
### Failed: ____ / ____
### Blocked: ____ / ____
### Not Tested: ____ / ____

---

## Critical Issues Found

1. 
2. 
3. 

---

## Recommendations

1. 
2. 
3. 

---

## Sign-Off

- **Tester Name**: ________________
- **Date**: ________________
- **Status**: ☐ Pass  ☐ Pass with Issues  ☐ Fail
- **Signature**: ________________

---

## Notes

Additional observations or comments:

_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Version**: 1.0.0  
**Last Updated**: June 22, 2026
