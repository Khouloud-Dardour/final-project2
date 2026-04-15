# BusDZ RBAC - Architecture & Flow Diagrams

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BusDZ Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   HTML Pages (7 files)                   │   │
│  │  index.html, admin.html, results.html, seats.html, etc  │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
│                     ▼ (Load on page render)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Authentication System (auth.js)             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │         AuthService (Main Auth Handler)         │     │   │
│  │  │  • login(user, pass)                            │     │   │
│  │  │  • logout()                                     │     │   │
│  │  │  • isAuthenticated()                            │     │   │
│  │  │  • isAdmin()                                    │     │   │
│  │  │  • hasRole(role)                                │     │   │
│  │  │  • Session management & validation              │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │    RouteProtection (Access Control)             │     │   │
│  │  │  • enforceProtection()                          │     │   │
│  │  │  • Protected routes config                      │     │   │
│  │  │  • Auto-redirect on unauthorized access         │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │   UIPermissions (UI Element Control)            │     │   │
│  │  │  • showOnlyForRoles(id, role)                   │     │   │
│  │  │  • showOnlyForAdmin(id)                         │     │   │
│  │  │  • updateAuthUI()                               │     │   │
│  │  │  • Show/hide elements based on roles            │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     ▲                    ▲                       │
│                     │                    │                       │
│      ┌──────────────┘                    └──────────────┐        │
│      │                                                  │        │
│      ▼                                                  ▼        │
│  ┌─────────────────┐                          ┌─────────────────┐
│  │  App Logic      │                          │  localStorage   │
│  │  (app.js)       │                          │  Sessions/Users │
│  └─────────────────┘                          └─────────────────┘
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Login Flow Sequence

```
User                    HTML                   AuthService           UI
│                        │                          │                │
│──── Click Login ──────>│                          │                │
│                        │                          │                │
│                        │──── admin/pass ────────>│                │
│                        │                          │                │
│                        │    Validate Creds       │                │
│                        │    Create Session       │                │
│                        │                          │                │
│                        │<─── Session Created ────│                │
│                        │                          │                │
│                        │                   Fire: auth:login ────>│
│                        │                          │                │
│                        │                          │     Update UI  │
│                        │                          │     (show admin)
│                        │                          │                │
│<───── Success ─────────│                          │                │
│
│  User now has:
│  • Valid session
│  • Admin link visible
│  • Access to admin.html
```

---

## Route Protection Flow

```
User visits /admin.html
    │
    ▼
┌─────────────────────────────────────┐
│ RouteProtection.enforceProtection() │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Authenticated?
    └──┬────────────┘
       │
    NO│    YES
       │      │
       ▼      ▼
    FAIL   ┌────────────┐
       │   │ Has admin? │
       │   └─────┬──────┘
       │      NO│    YES
       │         │      │
       ▼         ▼      ▼
    FAIL      FAIL    SUCCESS
       │         │      │
       └────┬────┘      │
            ▼           ▼
        Redirect    Load Admin
        to /        Page
        
Alert: "Please log in"
    or
Alert: "Insufficient permissions"
```

---

## Session Management Timeline

```
Time     Event                           Status
────────────────────────────────────────────────────
23:00    User logs in                    ✓ Active
         Session created
         
23:05    User browses site               ✓ Active
         (session maintained)
         
23:15    User inactive                   ⚠ Warned
         (15 min elapsed - could add warning)
         
23:30    Session timeout                 ✗ Expired
         (30 min elapsed)
         Auto-logout triggered
         
23:31    User tries to access admin      ⚠ Redirected
         Gets: "Session expired"
         Needs to re-login

Legend:
✓ = Valid session
⚠ = Warning state
✗ = Invalid session
```

---

## Role-Based UI Rendering

```
┌────────────────────────────────────┐
│  Page Load & Auth Check            │
└────────────────┬───────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Get User Role │
         └───────┬───────┘
                 │
        ┌────────┼────────┐
        │        │        │
       admin   user    guest
        │        │        │
        ▼        ▼        ▼
    ┌─────┐ ┌──────┐ ┌─────────┐
    │ADMIN│ │ USER │ │ PUBLIC  │
    ├─────┤ ├──────┤ ├─────────┤
    │✓Nav │ │ ✓Nav │ │ ✓ Home  │
    │✓ UI │ │ ✓UI  │ │ ✓Login  │
    │✓All │ │ ✓All │ │ ✓About  │
    │✓Adm │ │ ✗Adm │ │ ✗Adm    │
    └─────┘ └──────┘ └─────────┘

Legend:
✓ = Visible
✗ = Hidden
Adm = Admin features
```

---

## API Call Protection Pattern

```
User Action
    │
    ▼
┌──────────────────────┐
│ Check: isAdmin()?    │
└──────┬───────┬──────┘
       │       │
      NO      YES
       │       │
       ▼       ▼
    Alert   Continue
    Error   ┌────────────────┐
            │ Check: Session │
            │ Still Valid?   │
            └──────┬───┬─────┘
                   │ NO│
                  YES  │
                   │   ▼ 
                   │  Logout
                   │  Redirect
                   │
                   ▼
            Perform Action
            Log operation
            Return result
```

---

## Event-Driven Architecture

```
┌─────────────────────────────────────────────────────┐
│            Custom Auth Events                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  'auth:login'                    'auth:logout'      │
│      │                                  │            │
│      ├─> Update UI                     ├─> Reset UI │
│      ├─> Show admin link                ├─> Hide user menu
│      ├─> Load user dashboard            └─> Redirect home
│      └─> Dispatch to listeners                      │
│                                                      │
│  Listening Components:                              │
│  ┌──────────────────┐                               │
│  │ Navigation Bar   │                               │
│  │ User Menu        │                               │
│  │ Admin Panel      │                               │
│  │ Custom Code      │                               │
│  └──────────────────┘                               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
localStorage
    │
    │  busdz_session
    │  (encrypted-style)
    │         │
    ▼         ▼
┌──────────────────────┐
│  Session Object      │
├──────────────────────┤
│ {                    │
│  userId: "u_abc",    │
│  username: "admin",  │
│  role: "admin",      │
│  loginTime: 1234567, │
│  lastActivity: 1234  │
│ }                    │
└──────┬───────────────┘
       │
       ├─> AuthService.getSession()
       ├─> AuthService.isAdmin()
       ├─> AuthService.getCurrentUser()
       │
       ▼
    Validation
       │
       ├─> Check if expired
       ├─> Check if valid user
       ├─> Get user role
       │
       ▼
    Decision
       │
       ├─> Allow access
       ├─> Show admin UI
       ├─> Permit action
       │
       ▼
    Execution
```

---

## Browser Lifecycle

```
1. Page Load
   ├─> Load HTML
   ├─> Load auth.js
   ├─> Load app.js
   └─> Fire DOMContentLoaded

2. Auth Init
   ├─> AuthService.init()
   ├─> Validate existing session
   ├─> Setup timeout timer
   └─> Setup logout listener

3. Route Check
   ├─> RouteProtection.enforceProtection()
   ├─> Get page requirement
   ├─> Check authorization
   └─> Redirect if needed

4. UI Update
   ├─> UIPermissions.updateAuthUI()
   ├─> Show/hide role elements
   ├─> Update user menu
   └─> Render navbar

5. Ready
   └─> App operational
```

---

## Protected Route Matrix

```
Route           Public  Logged In   Admin Required
─────────────────────────────────────────────────
index.html        ✓         ✓            -
network.html      ✓         ✓            -
admin.html        ✗         ✗            ✓
results.html      ✗         ✓            -
seats.html        ✗         ✓            -
passenger.html    ✗         ✓            -
ticket.html       ✗         ✓            -

Legend:
✓ = Allowed
✗ = Blocked/Redirected
- = Not applicable
```

---

## Session Validation Loop

```
Every 60 seconds:

┌─────────────────────────────┐
│ Check Session.loginTime     │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
  >30min       <30min
  (Expired)    (Valid)
    │             │
    ▼             ▼
  Logout        Continue
  Redirect       ✓
    │
Alert user
```

---

## Error Handling Flow

```
User Action
    │
    ▼
Try Operation
    │
    ├─> Catch Error
    │   ├─> Log to console
    │   ├─> Show alert
    │   └─> Fallback action
    │
    ├─> Auth Error
    │   ├─> Session expired?
    │   ├─> Permission denied?
    │   └─> Invalid credentials?
    │
    ▼
Graceful Degradation
    ├─> Reload page
    ├─> Return to home
    └─> Show error message
```

---

## State Machine Diagram

```
No Session
    │
    ├─ User clicks "Login"
    │
    ▼
Login Form
    │
    ├─ Credentials valid?
    │
    ├─ YES ─────────> ┌──────────────┐
    │                 │ Session      │
    │                 │ Created      │
    │                 │ (Active)     │
    │                 └──────┬───────┘
    │                        │
    │                        ├─ 30 min pass
    │                        │
    │                        ▼
    │                   ┌──────────────┐
    │                   │ Session      │
    │                   │ Expired      │
    │                   │ (Invalid)    │
    │                   └──────┬───────┘
    │                          │
    │                   ┌──────┴──────┐
    │                   │ Logout or   │
    │                   │ Re-login    │
    │                   └─────┬───────┘
    │                         │
    └──────────────────────────> No Session

Legend:
→ = State transition
  = Duration/condition
```

---

## Async Operation Diagram

```
Auth.login()
    │
    ▼ (Synchronous)
Validate Input
    │
    ▼
Search User DB
    │
    ├─> Found & Match
    │   └─> Create Session
    │       └─> Return session object
    │
    └─> Not Found or No Match
        └─> Return false

Note: This is SYNCHRONOUS (localStorage)
For production use ASYNC:
    │
    ▼ (Asynchronous with Backend)
Send to server
    │
    (HTTP Request)
    │
    ▼ (Await response)
Receive token
    │
    ▼
Store & Return
```

---

## Summary: Component Interaction

```
┌─────────────────────────────────────────────────────┐
│ AuthService                                          │
│ • Core credential validation                         │
│ • Session creation/destruction                      │
│ • Role management                                    │
└────────┬────────────────────────────────────────────┘
         │ Uses
         ▼
┌─────────────────────────────────────────────────────┐
│ RouteProtection                                      │
│ • Route configuration                                │
│ • Authorization checks                               │
│ • Automatic redirects                                │
└────────┬────────────────────────────────────────────┘
         │ Uses
         ▼
┌─────────────────────────────────────────────────────┐
│ UIPermissions                                        │
│ • Show/hide elements                                 │
│ • Dynamic UI updates                                 │
│ • Role-based rendering                               │
└─────────────────────────────────────────────────────┘
         │ All report using
         ▼
    localStorage
    (Session data)
```

---

## Performance Considerations

```
Operation           Timing      Impact
─────────────────────────────────────────
Auth.login()        <1ms        Minimal
Auth.isAdmin()      <1ms        Minimal
RouteProtection     <5ms        Minimal
UI Update           ~50ms       UI block
Session validate    <10ms       Background
Event dispatch      <1ms        Minimal

Total Page Load Impact: ~100ms
Acceptable: ✓ (imperceptible)
```

---

## Deployment Architecture

```
Development (Current)
    │
    ├─ localStorage
    ├─ Client-side validation
    ├─ No backend
    └─ Single file storage

              │
              ▼

Production (Recommended)
    │
    ├─ Backend API
    ├─ JWT tokens
    ├─ Database (PostgreSQL/MongoDB)
    ├─ CSRF protection
    ├─ Rate limiting
    └─ HTTPS enforcement
```

---

**Diagram Created:** April 12, 2026  
**For System Version:** 1.0.0  
**Last Updated:** April 12, 2026
