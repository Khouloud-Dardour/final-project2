# BusDZ Admin Visibility System - Implementation Guide

## Overview

A simple admin visibility system that uses **localStorage** to control admin access. When you login as admin, your browser remembers your admin status using localStorage, and the Admin link appears in the navbar across all pages.

---

## How It Works

### 1. **localStorage Key: "isAdmin"**
- **Value: `"true"`** → Admin access granted, Admin link visible
- **Value: `"false"` or not set** → Admin access denied, Admin link hidden

### 2. **Key Components**

#### **admin-auth.js** - Main Admin Authentication Module
Located in `js/admin-auth.js`, this file handles:
- ✅ Detecting admin status from localStorage
- ✅ Showing/hiding the Admin link in the navbar
- ✅ Protecting the `/admin` page from unauthorized access
- ✅ Listening for status changes across pages

**Key Methods:**
```javascript
adminAuth.isAdmin()           // Returns true if user is admin
adminAuth.setAdmin(true)      // Grant admin access
adminAuth.logout()            // Revoke admin access
```

#### **admin.html** - Protected Admin Page
- Includes login form with credentials: **admin / admin123**
- Upon successful login, sets `localStorage.isAdmin = "true"`
- Displays the admin dashboard
- Logout button clears the admin flag

#### **Navbar (all HTML files)**
```html
<a id="adminLink" href="admin.html" class="btn ghost" 
   data-role-required="admin" style="display:none;">👨‍💼 Admin</a>
```
- Hidden by default (`display:none`)
- Shown automatically when admin logs in
- Consistent across all pages: index.html, network.html, results.html, seats.html, passenger.html, ticket.html

---

## Setup Instructions

### 1. **File Structure** (Already Done)
```
js/
├── admin-auth.js        ← New admin system
├── auth.js              ← Existing auth module
└── app.js               ← Main app logic

admin.html              ← Admin dashboard (protected)
index.html              ← Home page
results.html            ← Search results
network.html            ← Network map
seats.html              ← Seat selection
passenger.html          ← Passenger info
ticket.html             ← Ticket confirmation
```

### 2. **All HTML Files Include**
```html
<script src="js/admin-auth.js"></script>
```
This initializes the admin system on every page load.

---

## Usage

### **For Users (Non-Admin)**
1. Open website normally → Admin link NOT visible
2. Try accessing `/admin.html` directly → Automatically redirected to home page
3. Admin panel is completely hidden

### **For Admin (You)**
1. Click the **Admin** link in navbar (appears after logging in)
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Login successful → Admin dashboard opens
4. Admin link now shows on every page
5. Access admin features freely
6. Click **Logout** to clear admin access

### **Across Multiple Pages**
- Once logged in as admin, the Admin link appears on:
  - 🏠 Home (index.html)
  - 🗺️ Network (network.html)
  - 🔍 Results (results.html)
  - 🪑 Seats (seats.html)
  - 👤 Passenger (passenger.html)
  - 🎫 Ticket (ticket.html)

---

## How to Enable Admin Access Manually (For Testing)

If you want to test without using the login form:

**Open Browser Console:**
```javascript
// Grant admin access
localStorage.setItem('isAdmin', 'true');
// Then refresh the page - Admin link appears!

// Revoke admin access
localStorage.setItem('isAdmin', 'false');
// Or remove it entirely:
localStorage.removeItem('isAdmin');
// Refresh the page - Admin link disappears
```

---

## Code Walkthrough

### **admin-auth.js** - The Core System

```javascript
class AdminAuth {
  isAdmin() {
    // Check if localStorage has admin flag set to "true"
    return localStorage.getItem('isAdmin') === 'true';
  }

  setAdmin(status) {
    // Save admin status and notify other pages
    localStorage.setItem('isAdmin', status ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('admin:statusChanged', ...));
  }

  updateNavbar() {
    // Show/hide admin link based on isAdmin status
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
      adminLink.style.display = this.isAdmin() ? 'inline-block' : 'none';
    }
  }

  protectAdminPage() {
    // If not admin and on admin page, redirect to home
    if (!this.isAdmin()) {
      setTimeout(() => location.href = 'index.html', 1000);
    }
  }
}
```

### **admin.html** - Login Handler

```javascript
// When login form submitted:
if (username === 'admin' && password === 'admin123') {
  adminAuth.setAdmin(true);  // ← Sets localStorage flag
  loginPanel.style.display = 'none';
  adminApp.style.display = 'block';  // ← Show dashboard
}
```

---

## Security Notes

⚠️ **For Development/Student Projects Only:**
- This system uses client-side localStorage (NOT secure for production)
- Credentials are hardcoded in the front-end (demo purposes only)
- Real applications should use server-side authentication (JWT tokens, sessions, etc.)

✅ **For This Project:**
- Simple and easy to understand
- Works completely offline (browser-based)
- Perfect for learning
- No server needed

---

## Testing Checklist

- [ ] Admin link is hidden when you first open the website
- [ ] Can navigate to pages and link stays hidden
- [ ] Admin page redirects to home if you try to access directly
- [ ] Admin link appears after successful login
- [ ] Admin link visible on all pages (home, results, network, seats, etc.)
- [ ] Logout removes the admin link
- [ ] Console test: `adminAuth.isAdmin()` returns true/false correctly

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Admin link not showing after login | Clear browser cache, refresh page |
| Stuck on login screen | Check console for errors |
| Admin page not redirect works | Ensure `admin-auth.js` is loaded before `app.js` |
| Can access admin without login | Check localStorage is enabled in browser |

---

## Where to Customize

### **Change Admin Credentials**
Edit `admin.html`:
```javascript
if (username === 'admin' && password === 'admin123') {
  // ↑ Change these values
}
```

### **Change localStorage Key**
Edit `admin-auth.js`:
```javascript
constructor() {
  this.ADMIN_KEY = 'isAdmin';  // ← Change key name here
}
```

### **Change Admin Link Text/Icon**
Edit all HTML files (navbar):
```html
<a id="adminLink" ... >👨‍💼 Admin</a>
<!-- Change "👨‍💼 Admin" to your text -->
```

---

## Summary

Your admin system is now:
✅ Simple and easy to understand
✅ Uses localStorage for persistence
✅ Protects the admin page from unauthorized access
✅ Shows admin link only when logged in
✅ Ready for your student project!

Enjoy your BusDZ bus booking platform! 🚌
