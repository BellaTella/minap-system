# Navigation Updates - Role-Based UI

## ✅ Updates Complete

The navigation now dynamically adapts based on user login status and role.

---

## 🎯 **How It Works**

### **Not Logged In (Anonymous User)**
**Navigation Bar:**
- Take Screening (button)
- Trainee Login (link)
- Counsellor Login (link)

**Home Page:**
- ✦ Start Screening (button)
- 🎓 Trainee Login (button)
- Links: "New Trainee? Register here" | "Counsellor Portal"

---

### **Logged In as Trainee/Student**
**Navigation Bar:**
- Take Screening (button)
- 👤 [User's Name] (displayed)
- Logout (button)
- ❌ No login links visible

**Home Page:**
- ✦ Start Screening (button)
- 📊 My Dashboard (button - goes to student dashboard)
- ❌ No login/register links visible

---

### **Logged In as Counsellor**
**Navigation Bar:**
- Take Screening (button)
- 👤 [User's Name] (displayed)
- Logout (button)
- ❌ No login links visible

**Home Page:**
- ✦ Start Screening (button)
- 🏥 Counsellor Dashboard (button - goes to counsellor dashboard)
- ❌ No login/register links visible

---

## 🔧 **Technical Implementation**

### **Files Modified:**

1. **`templates/base.html`**
   - Added dynamic navigation elements with IDs
   - Added global JavaScript to check login status
   - Shows/hides elements based on user role
   - Global `handleLogout()` function

2. **`templates/home.html`**
   - Added multiple buttons with role-specific visibility
   - JavaScript checks user role and shows appropriate buttons
   - Hides irrelevant links when logged in

3. **`templates/trainee/dashboard.html`**
   - Removed duplicate logout button
   - Removed duplicate logout function
   - Uses global logout from base template

---

## 📝 **JavaScript Logic**

```javascript
// Check if user is logged in
const token = localStorage.getItem('auth_token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (token && user.role) {
  // User is logged in
  // Hide login links
  // Show user name
  // Show logout button
  
  if (user.role === 'student') {
    // Show student-specific buttons
  } else if (user.role === 'counsellor') {
    // Show counsellor-specific buttons
  }
} else {
  // User not logged in
  // Show login links
  // Hide user info
}
```

---

## 🧪 **Testing**

### Test Scenario 1: Anonymous User
1. **Clear localStorage**: `localStorage.clear()` in console
2. **Visit**: http://127.0.0.1:8000/
3. **Expect**: See all login links and buttons

### Test Scenario 2: Student Login
1. **Login as**: `student1` / `student123`
2. **Visit**: http://127.0.0.1:8000/
3. **Expect**: 
   - Nav shows "👤 Alice" and "Logout"
   - Home shows "My Dashboard" button
   - No login links visible

### Test Scenario 3: Counsellor Login
1. **Login as**: `counsellor1` / `counsellor123`
2. **Visit**: http://127.0.0.1:8000/
3. **Expect**:
   - Nav shows "👤 Dr. Jane" and "Logout"
   - Home shows "Counsellor Dashboard" button
   - No login links visible

### Test Scenario 4: Logout
1. **While logged in**, click "Logout"
2. **Expect**:
   - Confirmation dialog
   - Redirect to home page
   - Login links reappear

---

## 🎨 **UI Behavior**

### Navigation Elements IDs:
- `nav-trainee-login` - Trainee login link
- `nav-counsellor-login` - Counsellor login link
- `nav-user-info` - User name display
- `nav-logout-btn` - Logout button

### Home Page Elements IDs:
- `home-trainee-login` - Trainee login button
- `home-trainee-dashboard` - Student dashboard button
- `home-counsellor-dashboard` - Counsellor dashboard button
- `home-register-link` - Registration link
- `home-counsellor-link` - Counsellor portal link

---

## ✅ **Benefits**

1. **Clean UI**: Users only see relevant options
2. **Role-Based**: Different experience for students vs counsellors
3. **No Confusion**: Can't see login when already logged in
4. **Quick Access**: Dashboard buttons appear when logged in
5. **Consistent**: Same navigation logic across all pages
6. **Secure**: Still requires authentication at API level

---

## 🚀 **Next Steps**

1. **Refresh browser** to see changes
2. **Test all three scenarios** (anonymous, student, counsellor)
3. **Verify logout** works correctly
4. **Check mobile responsive** behavior

---

## 📱 **Mobile Behavior**

- Login links have `hide-mobile` class
- Will be hidden on small screens
- User info and logout remain visible
- Dashboard buttons are always visible

---

## 🔐 **Security Note**

This is **UI-only** protection. The actual security is enforced at:
- **API Level**: Token authentication required
- **View Level**: Role checking in Django views
- **Frontend**: Just improves UX, not security

Always rely on backend authentication, not frontend hiding!

---

**Version**: 1.1  
**Date**: June 22, 2026  
**Status**: ✅ Complete
