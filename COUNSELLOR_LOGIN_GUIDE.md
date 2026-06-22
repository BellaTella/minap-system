# Counsellor Login Guide - MiNaP PTSD System

## 🏥 Counsellor Portal Access

---

## 1. Accessing the Counsellor Portal

### Login Page
**URL**: http://127.0.0.1:8000/counsellor/login/

### Credentials Format
- **Username**: Your assigned counsellor username
- **Password**: Your secure password

---

## 2. Default Test Accounts

### Test Counsellor Account
```
Username: counsellor1
Password: counsellor123
Role: Counsellor
Name: Dr. Jane Doe
Department: Guidance and Counselling
Specialization: PTSD Counselling
```

### Admin Account (Full Access)
```
Create using: python manage.py createsuperuser
Then set role='admin' in database
```

---

## 3. Creating New Counsellor Accounts

### Option 1: Django Shell
```bash
cd backend
python manage.py shell
```

```python
from users.models import User

# Create counsellor account
User.objects.create_user(
    username='counsellor2',
    password='secure_password_here',
    email='counsellor2@minap.ac.ke',
    role='counsellor',
    first_name='Dr. John',
    last_name='Smith',
    department='Guidance and Counselling',
    specialization='Trauma Counselling',
    license_number='KCL-2023-5678'
)
```

### Option 2: Admin Panel (Superuser)
1. Login to `/admin/`
2. Navigate to "Users"
3. Click "Add User"
4. Fill in details
5. Set role to "Counsellor"
6. Save

### Option 3: API (Admin Only)
```bash
POST /api/admin/users/
Authorization: Token YOUR_ADMIN_TOKEN

{
  "username": "new_counsellor",
  "password": "secure_password",
  "email": "counsellor@minap.ac.ke",
  "role": "counsellor",
  "first_name": "Dr. Sarah",
  "last_name": "Johnson",
  "department": "Guidance",
  "specialization": "Mental Health Counselling",
  "license_number": "KCL-2024-1234"
}
```

---

## 4. Counsellor Dashboard Features

### Overview Statistics
- **Total Screenings**: All-time count
- **This Month**: Recent screenings (last 30 days)
- **Pending Referrals**: Cases awaiting assignment
- **High Priority**: Unresolved severe/critical cases
- **Crisis Alerts**: NLP-detected crisis keywords

### Daily Trend Chart
- Visual bar chart showing screenings over last 7 days
- Hover to see daily counts

### Three Main Tabs

#### 🚨 Alerts Tab
- Displays high-priority cases (severe/critical)
- Unresolved cases requiring immediate attention
- Quick "Update" button for each alert

#### 📋 All Cases Tab
**Filters Available**:
- Severity: Minimal, Mild, Moderate, Severe, Critical
- Referral Status: Pending, In Progress, Resolved
- Date Range: From/To dates

**Information Displayed**:
- Case ID
- Date of screening
- Department & Gender
- PCL-5 Score
- Severity Level
- Referral Status
- Update Action

#### 🔗 Referrals Tab
**Filters Available**:
- Status: Pending, In Progress, Resolved, Escalated

**Information Displayed**:
- Referral ID
- Associated Case ID
- Severity
- Current Status
- Assigned Counsellor
- Follow-up Date
- Creation Date
- Update Action

---

## 5. Managing Cases

### Updating a Referral

1. **Click "Update" Button** on any case or referral
2. **Modal Opens** with form:
   - Status dropdown
   - Follow-up date picker
   - Notes textarea
3. **Make Changes**:
   - Update status (pending → in_progress → resolved)
   - Set follow-up date
   - Add counsellor notes
4. **Click "Save Changes"**
5. **Dashboard Refreshes** automatically

### Referral Statuses

| Status | Meaning | When to Use |
|--------|---------|-------------|
| **Pending** | New referral, not yet reviewed | Auto-set by system |
| **In Progress** | Counsellor actively working on case | First session scheduled |
| **Resolved** | Case closed, support provided | Counselling complete |
| **Escalated** | Requires higher-level intervention | Serious cases needing specialist |

---

## 6. Security Features

### Role Validation
- Only users with role='counsellor' or role='admin' can access
- Students attempting access are redirected
- Invalid tokens force re-login

### Token Authentication
- Secure token-based authentication
- Stored in browser localStorage
- Auto-expires on logout
- Validated on every API call

### Data Privacy
- No PII visible in dashboard
- All data anonymized
- Only see assigned cases
- Audit trail of all actions

---

## 7. Logout Process

### Method 1: Dashboard Button
1. Click "Logout" button in navigation
2. Token revoked on server
3. LocalStorage cleared
4. Redirected to login page

### Method 2: Manual
```javascript
// In browser console
localStorage.clear();
// Then navigate to /counsellor/login/
```

---

## 8. Troubleshooting

### Issue: "Invalid Credentials"
**Solution**:
- Verify username is correct (case-sensitive)
- Check password
- Ensure account exists in database
- Check account is active

### Issue: "This portal is for counsellors only"
**Solution**:
- Your account role is not 'counsellor'
- Contact admin to update your role
- Or use correct login page for your role

### Issue: Redirected to Login Immediately
**Solution**:
- Token expired
- Login again
- Check browser allows localStorage

### Issue: "Network Error"
**Solution**:
- Ensure backend server is running
- Check URL is correct
- Verify network connection

### Issue: Dashboard Not Loading Data
**Solution**:
- Open browser console (F12)
- Check for JavaScript errors
- Verify API endpoints are working
- Check authentication token is valid

---

## 9. API Endpoints Used

### Dashboard Data
```
GET /api/dashboard/summary/
Authorization: Token YOUR_TOKEN

Returns:
- total_screenings
- recent_screenings
- referral_status breakdown
- high_priority_unresolved count
- crisis_alerts_total
- daily_trend (7 days)
```

### High-Priority Alerts
```
GET /api/dashboard/alerts/
Authorization: Token YOUR_TOKEN

Returns: Array of unresolved severe/critical cases
```

### Cases List
```
GET /api/dashboard/cases/?severity=X&referral_status=Y&date_from=Z
Authorization: Token YOUR_TOKEN

Returns: Paginated screening results with filters
```

### Referrals List
```
GET /api/referrals/?status=X
Authorization: Token YOUR_TOKEN

Returns: Paginated referrals with status filter
```

### Update Referral
```
POST /api/referrals/{id}/update/
Authorization: Token YOUR_TOKEN
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Met with trainee. Scheduled follow-up.",
  "follow_up_date": "2026-07-01"
}
```

---

## 10. Best Practices

### Daily Workflow
1. **Login** to counsellor portal
2. **Check Alerts** tab for urgent cases
3. **Review Pending** referrals
4. **Update Cases** as you work on them
5. **Set Follow-ups** for ongoing cases
6. **Add Notes** for record-keeping
7. **Mark Resolved** when complete

### Case Management Tips
- **Respond to alerts within 24 hours**
- **Update referral status** after each session
- **Use notes field** to document progress
- **Set follow-up dates** for accountability
- **Escalate when needed** to specialists
- **Mark resolved** only when appropriate

### Data Privacy
- **Never screenshot** with PII visible
- **Don't share credentials** with others
- **Logout** when done or leaving computer
- **Report issues** to system admin
- **Follow institutional** privacy policies

---

## 11. System Capabilities

### What Counsellors Can Do
✅ View all screening results (anonymized)
✅ Filter and search cases
✅ See high-priority alerts
✅ Update referral statuses
✅ Add case notes
✅ Set follow-up dates
✅ View institutional analytics
✅ Access crisis alerts
✅ Export data (planned feature)

### What Counsellors Cannot Do
❌ View trainee personal information (PII)
❌ Delete screening results
❌ Modify PCL-5 scores
❌ Create new user accounts
❌ Access system configuration
❌ View other counsellors' notes (privacy)

---

## 12. Training Resources

### For New Counsellors
1. **System Tour**: Request from IT admin
2. **PCL-5 Reference**: See documentation in `/docs`
3. **Severity Guidelines**: Refer to clinical manual
4. **Crisis Protocol**: Follow institutional procedures
5. **Contact IT Support**: For technical issues

### Continuing Education
- Regular training on PTSD screening
- Updates on system features
- Best practices for case management
- Data privacy and compliance
- Ethics in digital mental health

---

## 13. Support Contacts

### Technical Support
- **IT Department**: [Contact]
- **System Admin**: [Contact]
- **Email**: it.support@minap.ac.ke

### Clinical Support
- **Head Counsellor**: [Contact]
- **Clinical Supervisor**: [Contact]
- **Department**: guidance@minap.ac.ke

### Emergency
- **Crisis Line**: 0800 723 253 (Befrienders Kenya)
- **Emergency Services**: 999 / 112
- **Campus Security**: [Contact]

---

## 14. Quick Reference Card

### URLs
- **Login**: `/counsellor/login/`
- **Dashboard**: `/counsellor/dashboard/`
- **Admin**: `/admin/` (superuser only)

### Keyboard Shortcuts
- **F5**: Refresh dashboard
- **Esc**: Close modal
- **Tab**: Navigate form fields

### Status Codes
- **🚨 Critical**: PCL-5 ≥ 60, immediate action
- **⚠️ Severe**: PCL-5 44-59, urgent attention
- **⚡ Crisis**: NLP-detected keywords

---

## 15. Frequently Asked Questions

### Q: How do I reset my password?
**A**: Contact IT admin or use password reset feature (if enabled).

### Q: Can I access from mobile?
**A**: Yes, dashboard is responsive and works on tablets/phones.

### Q: How often is data updated?
**A**: Real-time. Click refresh button to see latest.

### Q: What happens to old cases?
**A**: Archived but remain accessible for institutional records.

### Q: Can I see trainee names?
**A**: No. System is privacy-first. All data anonymized.

### Q: How do I escalate a case?
**A**: Set referral status to "Escalated" and add notes.

### Q: What if I make a mistake?
**A**: Update the referral again. All changes are logged.

### Q: Can I undo changes?
**A**: No undo, but you can update to correct information.

---

## 16. Compliance & Ethics

### Data Protection
- Compliant with Kenya Data Protection Act (2019)
- GDPR principles followed
- Audit trail maintained
- Regular security reviews

### Ethical Guidelines
- Maintain confidentiality
- Follow professional standards
- Document all interactions
- Refer when appropriate
- Seek supervision when needed

---

## 17. Version Information

- **System Version**: 1.0.0
- **Last Updated**: June 22, 2026
- **Documentation Version**: 1.0
- **Status**: Production Ready

---

## 📞 Need Help?

1. **Check this guide first**
2. **Review system documentation**
3. **Contact IT support**
4. **Reach out to supervisor**

---

**Welcome to the MiNaP Counsellor Portal! 🏥**

*Your role is critical in supporting trainee mental health. Thank you for your service.*
