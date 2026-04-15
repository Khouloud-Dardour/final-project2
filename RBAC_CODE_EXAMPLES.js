/**
 * BusDZ RBAC - Quick Implementation Examples
 * Copy-paste ready code snippets for common scenarios
 */

/* ================================================================
   EXAMPLE 1: Basic Navigation with Role-Based Visibility
   ================================================================ */

// In HTML navbar:
<nav>
  <a href="index.html">Home</a>
  
  <!-- Show only to admins -->
  <a href="admin.html" 
     id="adminLink" 
     data-role-required="admin" 
     style="display:none;">
    Admin Dashboard
  </a>
  
  <!-- Show only to authenticated users -->
  <div id="userOptions" data-auth-required="true" style="display:none;">
    <span id="userName"></span>
    <button id="logoutBtn">Logout</button>
  </div>
</nav>

// In JavaScript:
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth to initialize
  setTimeout(() => {
    // Display current user
    if (window.auth.isAuthenticated()) {
      const user = window.auth.getCurrentUser();
      document.getElementById('userName').textContent = user.username;
    }
    
    // Update all role-based UI
    window.uiPermissions.updateAuthUI();
  }, 100);

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    window.auth.logout();
    window.location.href = 'index.html';
  });
});

/* ================================================================
   EXAMPLE 2: Protected Admin Panel
   ================================================================ */

// In admin.html JavaScript:
function initAdminPanel() {
  // Verify user is admin
  if (!window.auth.isAdmin()) {
    alert('Admin access required');
    window.location.href = 'index.html';
    return;
  }

  // Safe to show admin content
  document.getElementById('adminContent').style.display = 'block';
  
  console.log('Admin panel loaded for:', window.auth.getCurrentUser().username);
}

document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure auth.js has loaded
  setTimeout(initAdminPanel, 100);
});

/* ================================================================
   EXAMPLE 3: Conditional Form Submission
   ================================================================ */

document.getElementById('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();

  // Check if user is authenticated
  if (!window.auth.isAuthenticated()) {
    alert('Please log in to continue booking');
    window.location.href = 'index.html';
    return;
  }

  // User is authenticated, safe to proceed
  const formData = {
    from: document.getElementById('from').value,
    to: document.getElementById('to').value,
    date: document.getElementById('date').value,
  };

  console.log('Processing booking for:', window.auth.getCurrentUser().username);
  // Submit booking...
});

/* ================================================================
   EXAMPLE 4: Show Different Content Based on Role
   ================================================================ */

function renderDashboard() {
  const container = document.getElementById('dashboard');

  if (window.auth.isAdmin()) {
    // Show admin dashboard
    container.innerHTML = `
      <h2>Admin Dashboard</h2>
      <div>
        <h3>Users</h3>
        <button onclick="manageUsers()">Manage Users</button>
      </div>
      <div>
        <h3>Trips</h3>
        <button onclick="manageTrips()">Manage Trips</button>
      </div>
    `;
  } else if (window.auth.isAuthenticated()) {
    // Show user dashboard
    const user = window.auth.getCurrentUser();
    container.innerHTML = `
      <h2>Welcome, ${user.username}</h2>
      <div>
        <h3>My Bookings</h3>
        <button onclick="viewBookings()">View My Bookings</button>
      </div>
    `;
  } else {
    // Not logged in
    container.innerHTML = `
      <h2>Welcome</h2>
      <p><a href="admin.html">Login to continue</a></p>
    `;
  }
}

/* ================================================================
   EXAMPLE 5: Protect Sensitive Operations
   ================================================================ */

function deleteTrip(tripId) {
  // Step 1: Verify admin role
  if (!window.auth.isAdmin()) {
    console.error('Delete operation: Insufficient permissions');
    alert('Only admins can delete trips');
    return false;
  }

  // Step 2: Confirm action
  if (!confirm('Are you sure you want to delete this trip?')) {
    return false;
  }

  // Step 3: Check session still valid
  if (!window.auth.isAuthenticated()) {
    alert('Session expired. Please log in again.');
    window.location.href = 'index.html';
    return false;
  }

  // Step 4: Perform deletion
  console.log('Deleting trip:', tripId);
  console.log('Deleted by:', window.auth.getCurrentUser().username);
  
  // Your deletion logic here...
  return true;
}

/* ================================================================
   EXAMPLE 6: Listen to Auth Events
   ================================================================ */

// When user logs in
window.addEventListener('auth:login', (e) => {
  const session = e.detail;
  console.log('🔓 User signed in:', session.username);
  console.log('   Role:', session.role);
  
  // Update UI to show user-specific content
  window.uiPermissions.updateAuthUI();
  
  // Show personalized greeting
  const user = window.auth.getCurrentUser();
  alert(`Welcome back, ${user.username}!`);
});

// When user logs out
window.addEventListener('auth:logout', (e) => {
  console.log('🔒 User signed out');
  
  // Reset UI
  window.uiPermissions.updateAuthUI();
  
  // Redirect if on protected page
  if (document.body.id === 'page-admin') {
    window.location.href = 'index.html';
  }
});

/* ================================================================
   EXAMPLE 7: Admin User Management
   ================================================================ */

// Register new user (admin only)
function registerNewUser() {
  if (!window.auth.isAdmin()) {
    alert('Only admins can register users');
    return;
  }

  const username = prompt('Username:');
  if (!username) return;

  const password = prompt('Password:');
  if (!password) return;

  const role = confirm('Make admin? (OK=admin, Cancel=user)') ? 'admin' : 'user';

  const newUser = window.auth.registerUser(username, password, role);
  if (newUser) {
    alert(`User registered:\n${newUser.username}\nRole: ${newUser.role}`);
  } else {
    alert('Failed to register user');
  }
}

// Promote user to admin
function promoteUser(userId) {
  if (!window.auth.isAdmin()) {
    alert('Only admins can promote users');
    return;
  }

  if (window.auth.updateUserRole(userId, 'admin')) {
    alert('User promoted to admin');
  } else {
    alert('Failed to promote user');
  }
}

/* ================================================================
   EXAMPLE 8: Navbar Component with Role Visibility
   ================================================================ */

function renderNavbar() {
  const nav = document.querySelector('.navbar');
  const isAuth = window.auth.isAuthenticated();
  const isAdmin = window.auth.isAdmin();
  const currentUser = isAuth ? window.auth.getCurrentUser() : null;

  let navHTML = `
    <div class="nav-brand">BusDZ</div>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="network.html">Network</a>
  `;

  // Add admin link only for admins
  if (isAdmin) {
    navHTML += `<a href="admin.html" class="nav-link-admin">👨‍💼 Admin</a>`;
  }

  // Add user menu if logged in
  if (isAuth) {
    navHTML += `
      <div class="nav-user">
        <span>👤 ${currentUser.username}</span>
        <button onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    navHTML += `<a href="admin.html" class="nav-link-login">Login</a>`;
  }

  navHTML += `</div>`;
  nav.innerHTML = navHTML;
}

function logout() {
  if (confirm('Logout?')) {
    window.auth.logout();
    window.location.reload();
  }
}

/* ================================================================
   EXAMPLE 9: Debugging Helper
   ================================================================ */

// Call this in browser console to debug auth state
function debugAuth() {
  console.group('🔐 Auth Debug Info');
  
  console.log('Authenticated:', window.auth.isAuthenticated());
  console.log('Is Admin:', window.auth.isAdmin());
  
  const session = window.auth.getSession();
  console.log('Session:', session);
  
  const user = window.auth.getCurrentUser();
  console.log('Current User:', user);
  
  const allUsers = window.auth.getAllUsers();
  console.log('All Users:', allUsers);
  
  const routeProtection = window.routeProtection.getCurrentPageProtection();
  console.log('Current Page Protection:', routeProtection);
  
  console.groupEnd();
  
  // Return info for further inspection
  return {
    session,
    user,
    allUsers,
    isAdmin: window.auth.isAdmin(),
  };
}

/* ============================================================================
   EXAMPLE 10: Create Admin Link Component (Reusable)
   ============================================================================ */

class AdminLinkComponent {
  constructor(selector = '#adminLink') {
    this.element = document.querySelector(selector);
    this.init();
  }

  init() {
    // Listen for auth changes
    window.addEventListener('auth:login', () => this.update());
    window.addEventListener('auth:logout', () => this.update());
    
    // Initial update
    this.update();
  }

  update() {
    if (!this.element) return;
    
    if (window.auth.isAdmin()) {
      this.element.style.display = '';
      this.element.removeAttribute('hidden');
      this.element.classList.remove('disabled');
    } else {
      this.element.style.display = 'none';
      this.element.setAttribute('hidden', 'true');
      this.element.classList.add('disabled');
    }
  }
}

// Usage:
// new AdminLinkComponent('#adminLink');

/* ================================================================
   EXAMPLE 11: Session Check Before Sensitive Action
   ================================================================ */

async function processBooking() {
  try {
    // Check 1: Is user authenticated?
    if (!window.auth.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    // Check 2: Is session still valid?
    const session = window.auth.getSession();
    if (!session || (Date.now() - session.loginTime) > 1800000) { // 30 min
      throw new Error('Session expired');
    }

    // Check 3: Get user info for logging
    const user = window.auth.getCurrentUser();
    console.log(`Processing booking for user: ${user.username}`);

    // Check 4: Proceed with operation
    const bookingData = {
      user_id: session.userId,
      timestamp: new Date().toISOString(),
      // ... more data
    };

    console.log('✅ Booking processed successfully');
    return true;

  } catch (error) {
    console.error('❌ Booking failed:', error.message);
    alert(`Error: ${error.message}`);
    
    // Redirect to login if session issue
    if (error.message.includes('Session') || !window.auth.isAuthenticated()) {
      window.location.href = 'index.html';
    }
    
    return false;
  }
}

/* ================================================================
   EXAMPLE 12: Testing Script (for QA)
   ================================================================ */

async function testRBAC() {
  console.log('🧪 Starting RBAC Tests...\n');

  try {
    // Test 1: Login as admin
    console.log('Test 1: Admin Login');
    let result = window.auth.login('admin', 'admin123');
    console.log('✅ Result:', result ? 'SUCCESS' : 'FAILED');

    // Test 2: Check admin role
    console.log('\nTest 2: Check Admin Role');
    console.log('✅ Is Admin:', window.auth.isAdmin());

    // Test 3: Get session
    console.log('\nTest 3: Get Session');
    const session = window.auth.getSession();
    console.log('✅ Session:', session?.userId ? 'Valid' : 'Invalid');

    // Test 4: Logout
    console.log('\nTest 4: Logout');
    window.auth.logout();
    console.log('✅ Logged out:', !window.auth.isAuthenticated());

    // Test 5: Login with wrong credentials
    console.log('\nTest 5: Wrong Credentials');
    result = window.auth.login('admin', 'wrong');
    console.log('✅ Rejected:', result === false);

    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests: testRBAC();

/* ================================================================
   INLINE IMPLEMENTATION (For Quick Testing)
   ================================================================ */

// Add this snippet to your HTML to test immediately:
/*
<script>
document.addEventListener('DOMContentLoaded', () => {
  console.log('Auth initialized:', !!window.auth);
  console.log('Authenticated:', window.auth.isAuthenticated());
  console.log('Is Admin:', window.auth.isAdmin());
  
  // Auto-login for testing (remove in production)
  if (!window.auth.isAuthenticated() && location.pathname.includes('admin')) {
    window.auth.login('admin', 'admin123');
  }
});
</script>
*/
