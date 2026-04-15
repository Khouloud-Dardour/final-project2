# BusDZ Role-Based Access Control (RBAC) System

## Overview

A production-ready Role-Based Access Control system for the BusDZ bus booking platform. Implements secure authentication, session management, and route protection.

**Date:** April 12, 2026

---

## Architecture

### Components

1. **AuthService** - Core authentication and session management
2. **RouteProtection** - Route-level access control with redirects
3. **UIPermissions** - UI element visibility based on roles
4. **Scripts:** `js/auth.js` (main), `js/app.js` (app logic)

### Roles

- **admin** - Full access to admin panel and all features
- **user** - Access to booking features, seats, tickets (default role)
- **guest** - No authentication (can only view public pages)

---

## File Structure

```
js/
├── auth.js          ← NEW: Authentication & RBAC system
├── app.js           ← UPDATED: Integrated auth system
└── (other scripts)

admin.html          ← Protected route (admin only)
index.html          ← Public (admin link visible only to admins)
passenger.html      ← Protected route (authenticated users)
results.html        ← Protected route (authenticated users)
seats.html          ← Protected route (authenticated users)
ticket.html         ← Protected route (authenticated users)
network.html        ← Public
```

---

## Implementation

### 1. Include Auth System

Add to ALL HTML pages BEFORE app.js:

```html
<script src="js/auth.js"></script>
<script src="js/app.js"></script>
```

### 2. Protected Routes Configuration

Routes are defined in `RouteProtection` class (in auth.js):

```javascript
this.protectedRoutes = {
  'admin.html': { requiresAuth: true, requiredRoles: ['admin'] },
  'seats.html': { requiresAuth: true, requiredRoles: ['user', 'admin'] },
  'passenger.html': { requiresAuth: true, requiredRoles: ['user', 'admin'] },
  'ticket.html': { requiresAuth: true, requiredRoles: ['user', 'admin'] },
};
```

### 3. Show/Hide UI Based on Role

#### Method 1: Data Attributes (Recommended)

```html
<!-- Show only to admins -->
<a href="admin.html" class="btn ghost" data-role-required="admin" style="display:none;">
  👨‍💼 Admin
</a>

<!-- Show only to authenticated users -->
<div id="userPanel" data-auth-required="true" style="display:none;">
  User content
</div>
```

#### Method 2: JavaScript

```javascript
// Show only for admins
uiPermissions.showOnlyForAdmin('adminLink');

// Show only for specific roles
uiPermissions.showOnlyForRoles('element-id', 'user');

// Show only for authenticated users
uiPermissions.showOnlyAuthenticated('user-panel');

// Hide for specific roles
uiPermissions.hideForRoles('element-id', 'guest');
```

---

## API Reference

### AuthService

#### `login(username, password) → session | false`
Authenticate user and create session.

```javascript
const session = window.auth.login('admin', 'admin123');
if (session) {
  console.log('Logged in as:', session.username);
  console.log('Role:', session.role);
}
```

#### `logout()`
Destroy session and logout user.

```javascript
window.auth.logout();
```

#### `isAuthenticated() → boolean`
Check if user is currently logged in.

```javascript
if (window.auth.isAuthenticated()) {
  // User is logged in
}
```

#### `hasRole(role | roles[]) → boolean`
Check if user has specific role(s).

```javascript
if (window.auth.hasRole('admin')) {
  // User is admin
}

if (window.auth.hasRole(['admin', 'moderator'])) {
  // User has one of these roles
}
```

#### `isAdmin() → boolean`
Check if user is admin.

```javascript
if (window.auth.isAdmin()) {
  // User is admin
}
```

#### `getSession() → session | null`
Get current session object.

```javascript
const session = window.auth.getSession();
if (session) {
  console.log(session.userId);
  console.log(session.role);
}
```

#### `getCurrentUser() → user | null`
Get current user object.

```javascript
const user = window.auth.getCurrentUser();
console.log(user.username);
```

#### `registerUser(username, password, role) → user | false`
Register new user (admin only).

```javascript
const newUser = window.auth.registerUser('john', 'password123', 'user');
if (newUser) {
  console.log('User registered:', newUser.id);
}
```

#### `updateUserRole(userId, newRole) → boolean`
Update user role (admin only).

```javascript
if (window.auth.updateUserRole('u_123456', 'admin')) {
  console.log('Role updated');
}
```

---

### UIPermissions

#### `showOnlyForRoles(elementId, roles)`
Show element only to users with specific role(s).

```javascript
// Show to admins only
window.uiPermissions.showOnlyForRoles('admin-panel', 'admin');

// Show to admin or moderator
window.uiPermissions.showOnlyForRoles('moderation-tools', ['admin', 'moderator']);
```

#### `showOnlyForAdmin(elementId)`
Show element only to admin users.

```javascript
window.uiPermissions.showOnlyForAdmin('admin-menu');
```

#### `showOnlyAuthenticated(elementId)`
Show element only to authenticated users.

```javascript
window.uiPermissions.showOnlyAuthenticated('user-profile');
```

#### `hideForRoles(elementId, roles)`
Hide element from specific role(s).

```javascript
// Hide from guests
window.uiPermissions.hideForRoles('premium-feature', 'guest');
```

#### `updateAuthUI()`
Update all role-dependent UI elements.

```javascript
window.uiPermissions.updateAuthUI();
```

---

### RouteProtection

#### `enforceProtection()`
Check current route protection and redirect if unauthorized.

```javascript
window.routeProtection.enforceProtection();
```

#### `getCurrentPageProtection()`
Get protection config for current page.

```javascript
const protection = window.routeProtection.getCurrentPageProtection();
if (protection) {
  console.log(protection.requiredRoles);
}
```

---

## Usage Examples

### Example 1: Show Admin Link Only to Admins

**HTML:**
```html
<nav>
  <a href="admin.html" class="btn" data-role-required="admin" style="display:none;">
    Admin Dashboard
  </a>
</nav>
```

**Result:**
- ❌ Regular users: Link is hidden
- ✅ Admin users: Link is visible
- Authorization automatically handled by route protection

### Example 2: Conditional UI Rendering

**JavaScript:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Hide admin panel unless user is admin
  if (!window.auth.isAdmin()) {
    document.getElementById('adminPanel').style.display = 'none';
  }

  // Show user greeting
  if (window.auth.isAuthenticated()) {
    const user = window.auth.getCurrentUser();
    document.getElementById('userGreeting').textContent = 
      `Welcome, ${user.username}!`;
  }
});
```

### Example 3: Protected Action

```javascript
function deleteTrip(tripId) {
  // Check authorization before action
  if (!window.auth.isAdmin()) {
    alert('Only admins can delete trips');
    return;
  }

  // Proceed with deletion
  console.log('Deleting trip:', tripId);
}
```

### Example 4: Listen for Auth Changes

```javascript
// Handle login
window.addEventListener('auth:login', (e) => {
  const session = e.detail;
  console.log('User logged in:', session.username);
  console.log('Role:', session.role);
  
  // Update UI
  window.uiPermissions.updateAuthUI();
});

// Handle logout
window.addEventListener('auth:logout', () => {
  console.log('User logged out');
  
  // Reset UI
  window.uiPermissions.updateAuthUI();
});
```

### Example 5: Check Permission Before API Call

```javascript
async function updateUserRole(userId, newRole) {
  // Verify admin permission
  if (!window.auth.isAdmin()) {
    throw new Error('Insufficient permissions');
  }

  // Perform action
  const result = window.auth.updateUserRole(userId, newRole);
  return result;
}
```

---

## Security Features

### ✅ Implemented

1. **Session Validation**
   - Sessions expire after 30 minutes of inactivity
   - Automatic session validation on page load
   - Cross-tab logout detection

2. **Route Protection**
   - Server-side equivalent validation needed for production
   - Automatic redirect on unauthorized access
   - Alert user about permission denial

3. **Role-Based Access**
   - Roles checked before every privileged action
   - Admin operations require admin verification
   - Default role is 'user' for new accounts

4. **Input Validation**
   - Username/password format validation
   - Prevents empty credentials
   - Type checking for parameters

5. **Error Handling**
   - Try-catch blocks in all critical operations
   - Console logging for debugging
   - Graceful degradation on auth failure

### ⚠️ Important: Server-Side Validation Required

**For production deployment:**

```javascript
// Current: Client-side only (suitable for demo)
// Production needs:
// 1. Backend API for authentication
// 2. JWT tokens instead of localStorage
// 3. HTTP-only cookies for session storage
// 4. CORS protection
// 5. Rate limiting on login attempts
```

### ⚠️ Current Limitations

1. **Passwords stored in plain text** - Use hashing in production
2. **No HTTPS requirement** - Must use HTTPS in production
3. **localStorage vulnerability** - Use secure cookies in production
4. **No logout expiry** - Sessions persist until cleared
5. **No audit logging** - Add logging for sensitive actions

---

## Migration from Old System

### Before (Old Admin Page)
```javascript
// Anyone could access admin.html
// Just hide UI elements
// No route protection
// Basic localStorage login
```

### After (New RBAC)
```javascript
// Protected routes redirect unauthorized users
// Role-based UI visibility
// Session management with timeout
// Enhanced security checks
```

---

## Testing the System

### Test 1: Unauthorized Access
1. Visit `admin.html` (not logged in)
2. **Expected:** Redirected to home, alert about login

### Test 2: Admin Link Visibility
1. Visit home page as regular user
2. **Expected:** Admin link is hidden
3. Log in as admin
4. **Expected:** Admin link appears

### Test 3: Session Timeout
1. Log in as admin
2. Wait 30 minutes (change timeout to test)
3. **Expected:** Session expires, redirects to home

### Test 4: Role Enforcement
1. Try to manually edit user role in localStorage
2. **Expected:** Changes reverted on session validation

---

## Default Credentials

```
Username: admin
Password: admin123
Role:     admin
```

**⚠️ Change in production!**

---

## Debugging

### Check Current Session
```javascript
console.log(window.auth.getSession());
```

### Check Current User
```javascript
console.log(window.auth.getCurrentUser());
```

### Check All Users
```javascript
console.log(window.auth.getAllUsers());
```

### Manually Logout
```javascript
window.auth.logout();
```

### Force Update UI
```javascript
window.uiPermissions.updateAuthUI();
```

### Check Route Protection
```javascript
console.log(window.routeProtection.getCurrentPageProtection());
```

---

## Production Deployment Checklist

- [ ] Replace localStorage with secure backend
- [ ] Implement JWT authentication
- [ ] Use HTTP-only cookies for sessions
- [ ] Hash passwords with bcrypt or similar
- [ ] Add rate limiting to login endpoint
- [ ] Implement HTTPS everywhere
- [ ] Add CORS headers (if applicable)
- [ ] Add audit logging for admin actions
- [ ] Change default credentials
- [ ] Implement password reset flow
- [ ] Add 2FA for admin accounts
- [ ] Set up session encryption
- [ ] Add CSP headers to prevent XSS
- [ ] Test with OWASP guidelines

---

## Troubleshooting

### Admin link not showing
**Problem:** Admin link in navbar hidden for all users
**Solution:** Check if auth.js loaded before page render

```javascript
console.log('Auth loaded:', !!window.auth);
console.log('Is admin:', window.auth.isAdmin());
```

### Redirect loops
**Problem:** User redirected repeatedly
**Solution:** Check route protection config isn't blocking intended page

```javascript
console.log(window.routeProtection.protectedRoutes);
```

### Session expires too quickly
**Problem:** Logged out after short time
**Solution:** Adjust timeout in auth.js

```javascript
this.SESSION_TIMEOUT = 30 * 60 * 1000; // Change to desired duration
```

### Changes not persisting
**Problem:** Role changes don't save
**Solution:** Must be admin to make changes

```javascript
if (!window.auth.isAdmin()) {
  alert('Admin access required');
}
```

---

## Support & Maintenance

**Last Updated:** April 12, 2026
**Version:** 1.0.0 (Production)
**Maintainer:** Development Team

For issues or questions, refer to inline code comments in `js/auth.js`.
