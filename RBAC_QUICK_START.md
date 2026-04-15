# BusDZ RBAC - Quick Start Guide

**For developers implementing Role-Based Access Control**

---

## 🚀 5-Minute Setup

### Step 1: Files Are Already Updated ✅
- ✅ `js/auth.js` - Created (new authentication system)
- ✅ `js/app.js` - Updated (integrated auth)
- ✅ All HTML files - Updated (auth.js included)
- ✅ Navbar - Updated (admin link hidden/shown based on role)

### Step 2: Default Test Credentials
```
Username: admin
Password: admin123
```

Visit [admin.html](admin.html) and login with these credentials.

### Step 3: Test It Works
1. Open http://localhost/busdz (or your local URL)
2. Notice: ❌ **No "Admin" link in navbar**
3. Go to [admin.html](admin.html)
4. Login with `admin / admin123`
5. Notice: ✅ **"Admin" link now appears in navbar**
6. Click logout
7. Notice: ❌ **Admin link disappears again**

---

## 🔑 Key Concepts

### Roles
- **admin** - Full access to admin panel
- **user** - Can book tickets (default)
- **guest** - No authentication needed

### Protected Pages
| Page | Requires | Logout Redirects To |
|------|----------|---------------------|
| index.html | None (Public) | - |
| network.html | None (Public) | - |
| admin.html | **admin role** | index.html |
| results.html | Logged in | index.html |
| seats.html | Logged in | index.html |
| passenger.html | Logged in | index.html |
| ticket.html | Logged in | index.html |

### What Happens When...

**Not logged in → Try to visit /admin**
```
Redirected to index.html
Alert: "Please log in first"
```

**Logged in as user → Try to visit /admin**
```
Redirected to index.html
Alert: "You do not have permission"
```

**Logged in as admin → Visit /admin**
```
✅ Full access to admin panel
✅ Admin link visible in navbar
```

---

## 📝 Common Tasks

### Task 1: Show Element Only to Admins

**Quick Method (HTML):**
```html
<a href="admin.html" data-role-required="admin" style="display:none;">
  Admin Panel
</a>
```
This automatically shows/hides based on user role.

**Manual Method (JavaScript):**
```javascript
if (window.auth.isAdmin()) {
  document.getElementById('adminPanel').style.display = 'block';
}
```

### Task 2: Log In Programmatically

```javascript
const session = window.auth.login('admin', 'admin123');
if (session) {
  console.log('Logged in as:', session.username);
}
```

### Task 3: Check If User is Admin

```javascript
if (window.auth.isAdmin()) {
  // Admin-only code here
}
```

### Task 4: Get Current User Info

```javascript
const user = window.auth.getCurrentUser();
console.log(user.username);
console.log(user.role);
```

### Task 5: Logout

```javascript
window.auth.logout();
window.location.href = 'index.html';
```

### Task 6: Register New User (Admin Only)

```javascript
if (window.auth.isAdmin()) {
  const newUser = window.auth.registerUser('john', 'password123', 'user');
}
```

### Task 7: Protect a Button/Action

```javascript
document.getElementById('deleteBtn').addEventListener('click', () => {
  if (!window.auth.isAdmin()) {
    alert('Admin access required');
    return;
  }
  
  // Safe to delete
  console.log('Deleting...');
});
```

### Task 8: React to Login/Logout

```javascript
// When user logs in
window.addEventListener('auth:login', (e) => {
  console.log('User logged in:', e.detail.username);
  // Update UI here
});

// When user logs out
window.addEventListener('auth:logout', () => {
  console.log('User logged out');
  // Reset UI here
});
```

---

## 🛡️ Security Features

### Automatic
- ✅ Session timeout (30 minutes)
- ✅ Route protection
- ✅ Cross-tab logout detection
- ✅ Input validation
- ✅ Role verification before actions

### To Test
```javascript
// In browser console:
// See current auth state
window.auth.getSession()

// See if user is admin
window.auth.isAdmin()

// See current user
window.auth.getCurrentUser()

// See all users
window.auth.getAllUsers()
```

---

## ⚠️ Important Changes from Old System

### Before
```javascript
// Anyone could click Admin link
// Anyone could visit admin.html
// No session management
// UI just hidden, not protected
```

### After
```javascript
// Admin link hidden for regular users
// Non-admins auto-redirected from admin.html
// Sessions managed with timeout
// Routes protected server-side style
```

---

## 🧪 Test Scenarios

### Scenario 1: Admin Access
1. Go to http://localhost/busdz
2. **Expected:** No admin link visible
3. Manually go to [admin.html](admin.html)
4. **Expected:** Login form shown
5. Enter: `admin` / `admin123`
6. **Expected:** Admin dashboard shown, admin link appears in navbar
7. ✅ **PASS**

### Scenario 2: Regular User Blocked
1. Go to [admin.html](admin.html) directly
2. **Expected:** Login form shown
3. Create account with role `user` (or modify localStorage)
4. Try to login
5. **Expected:** Redirected to home, error message
6. ✅ **PASS**

### Scenario 3: Session Expiry
1. Login as admin
2. Wait 30 minutes (or change `SESSION_TIMEOUT` in auth.js for testing)
3. Try any action
4. **Expected:** Session expired alert, redirected to home
5. ✅ **PASS**

### Scenario 4: Logout
1. Login as admin
2. Check navbar - **Expected:** admin link visible
3. Click logout
4. Check navbar - **Expected:** admin link hidden
5. ✅ **PASS**

---

## 📚 Documentation

- **Full docs:** [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md)
- **Code examples:** [RBAC_CODE_EXAMPLES.js](RBAC_CODE_EXAMPLES.js)
- **Auth source:** [js/auth.js](js/auth.js)

---

## 🐛 Troubleshooting

### Admin link not showing
**Problem:** Admin link hidden for all users
**Fix:** 
1. Check browser console for errors
2. Verify auth.js loaded: 
   ```javascript
   console.log(window.auth);
   ```

### Can't login to admin
**Problem:** "Invalid credentials" error
**Fix:**
1. Use default creds: `admin` / `admin123`
2. Check localStorage for user data:
   ```javascript
   console.log(window.auth.getAllUsers());
   ```

### Redirect loop
**Problem:** Visiting admin.html causes infinite redirect
**Fix:**
1. Check that auth.js is loaded BEFORE app.js
2. Verify `<script src="js/auth.js"></script>` appears before `<script src="js/app.js"></script>`

### Session expires too fast
**Problem:** Logged out after short time
**Fix:**
Edit `js/auth.js` line with:
```javascript
this.SESSION_TIMEOUT = 30 * 60 * 1000; // Change here
```

---

## 💡 Tips & Tricks

### Quick Debug
Open browser console and run:
```javascript
debugAuth(); // Shows full auth state
```

### Test Login
```javascript
window.auth.login('admin', 'admin123');
```

### Test Logout
```javascript
window.auth.logout();
```

### See All Users
```javascript
window.auth.getAllUsers();
```

### Register Test User
```javascript
window.auth.registerUser('testuser', 'password', 'user');
```

### Check If Current User is Admin
```javascript
console.log(window.auth.isAdmin());
```

---

## 🔄 Production Deployment

### Pre-Deployment Checklist
- [ ] Change default admin password
- [ ] Move to backend authentication (not localStorage)
- [ ] Use JWT tokens instead of plain sessions
- [ ] Implement HTTPS
- [ ] Add rate limiting to login
- [ ] Add password hashing (bcrypt)
- [ ] Add audit logging
- [ ] Test all redirect scenarios

### Minimal Backend Integration
```python
# Flask example
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password(data['password'], user.password):
        return {'error': 'Invalid credentials'}, 401
    
    token = create_jwt_token(user)
    return {'token': token, 'role': user.role}
```

---

## ✅ Quick Checklist

After implementing RBAC:
- [ ] auth.js loaded in all HTML files
- [ ] Auth system working (default creds work)
- [ ] Admin link hidden for non-admins
- [ ] Admin panel protected (redirects non-admins)
- [ ] Navbar updates when user logs in/out
- [ ] Session timeout works
- [ ] All protected routes enforced
- [ ] Logout clears session properly

---

## 🚀 Next Steps

1. **Test the system** using scenarios above
2. **Read full docs** (RBAC_IMPLEMENTATION.md)
3. **Review code examples** (RBAC_CODE_EXAMPLES.js)
4. **Deploy with caution** - add backend in production
5. **Monitor sessions** - add logging

---

## 📞 Need Help?

1. Check browser console for errors
2. Review code comments in `js/auth.js`
3. See full documentation in `RBAC_IMPLEMENTATION.md`
4. Test with debug commands in console

**Remember:** This is a client-side system suitable for demo/learning. Production needs backend validation!

---

**Last Updated:** April 12, 2026
**Version:** 1.0.0
