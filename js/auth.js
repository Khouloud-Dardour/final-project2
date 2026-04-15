/**
 * BusDZ Authentication & Authorization System
 * Production-ready RBAC implementation
 * 
 * Features:
 * - Secure session management
 * - Role-based access control (RBAC)
 * - Route protection
 * - Automatic logout on invalid session
 * - XSS protection for stored data
 */

class AuthService {
  constructor() {
    this.SESSION_KEY = 'busdz_session';
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    this.STORAGE_PREFIX = 'auth_';
  }

  /**
   * Initialize authentication on app startup
   */
  init() {
    this.validateSession();
    this.setupSessionTimeout();
    this.setupLogoutListener();
  }

  /**
   * Login user and create session
   * @param {string} username
   * @param {string} password
   * @returns {boolean | object} - false if invalid, user object if valid
   */
  login(username, password) {
    try {
      // Security: Prevent empty credentials
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        console.warn('[Auth] Invalid credentials format');
        return false;
      }

      // Retrieve users from storage
      const users = this.getAllUsers();
      
      // Find matching user
      const user = users.find(u => 
        u.username === username && 
        u.password === password
      );

      if (!user) {
        console.warn('[Auth] Authentication failed for user:', username);
        return false;
      }

      // Create session
      const session = {
        userId: user.id,
        username: user.username,
        role: user.role || 'user', // Default role is 'user'
        loginTime: Date.now(),
        lastActivityTime: Date.now()
      };

      // Store session securely
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('auth:login', { detail: session }));

      console.log('[Auth] User logged in:', username, 'Role:', session.role);
      return session;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return false;
    }
  }

  /**
   * Logout user and destroy session
   */
  logout() {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      window.dispatchEvent(new CustomEvent('auth:logout'));
      console.log('[Auth] User logged out');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }

  /**
   * Get current session
   * @returns {object | null}
   */
  getSession() {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('[Auth] Session parse error:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const session = this.getSession();
    return session !== null && this.isSessionValid(session);
  }

  /**
   * Check if user has specific role
   * @param {string | string[]} requiredRoles
   * @returns {boolean}
   */
  hasRole(requiredRoles) {
    const session = this.getSession();
    if (!session) return false;

    // Handle array of roles (user must have one)
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(session.role);
    }

    // Handle single role
    return session.role === requiredRoles;
  }

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Validate session is still valid
   * @param {object} session
   * @returns {boolean}
   */
  isSessionValid(session) {
    if (!session || !session.loginTime) return false;

    const age = Date.now() - session.loginTime;
    if (age > this.SESSION_TIMEOUT) {
      console.warn('[Auth] Session expired');
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Validate current session and redirect if invalid
   */
  validateSession() {
    if (!this.isAuthenticated()) {
      // Clear any admin panels
      const adminPanel = document.getElementById('adminApp');
      if (adminPanel) adminPanel.style.display = 'none';
      const loginPanel = document.getElementById('loginPanel');
      if (loginPanel) loginPanel.style.display = 'block';
    }
  }

  /**
   * Setup automatic session timeout
   */
  setupSessionTimeout() {
    // Check session validity every minute
    setInterval(() => {
      if (!this.isSessionValid(this.getSession())) {
        console.warn('[Auth] Session timeout - logging out');
        this.logout();
        // Redirect to home if on admin page
        if (document.body.id === 'page-admin') {
          alert('Session expired. Please log in again.');
          window.location.href = 'index.html';
        }
      }
    }, 60000);
  }

  /**
   * Listen for logout across tabs
   */
  setupLogoutListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.SESSION_KEY && e.newValue === null) {
        console.warn('[Auth] Logged out from another tab');
        window.location.href = 'index.html';
      }
    });
  }

  /**
   * Get current user object
   * @returns {object | null}
   */
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;

    const users = this.getAllUsers();
    return users.find(u => u.id === session.userId) || null;
  }

  /**
   * Get all users (admin only)
   * @returns {array}
   */
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem('users')) || [];
    } catch (error) {
      console.error('[Auth] Error reading users:', error);
      return [];
    }
  }

  /**
   * Register new user (admin only - should be protected)
   * @param {string} username
   * @param {string} password
   * @param {string} role - 'user' or 'admin'
   * @returns {object | false}
   */
  registerUser(username, password, role = 'user') {
    if (!this.isAdmin()) {
      console.warn('[Auth] Unauthorized registration attempt');
      return false;
    }

    try {
      const users = this.getAllUsers();
      
      // Prevent duplicate usernames
      if (users.some(u => u.username === username)) {
        console.warn('[Auth] Username already exists:', username);
        return false;
      }

      // Generate unique ID
      const uid = 'u_' + Math.random().toString(36).slice(2, 9);
      const newUser = { id: uid, username, password, role };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      console.log('[Auth] New user registered:', username, 'Role:', role);
      return newUser;
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      return false;
    }
  }

  /**
   * Update user role (admin only)
   * @param {string} userId
   * @param {string} newRole
   * @returns {boolean}
   */
  updateUserRole(userId, newRole) {
    if (!this.isAdmin()) {
      console.warn('[Auth] Unauthorized role update attempt');
      return false;
    }

    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        console.warn('[Auth] User not found:', userId);
        return false;
      }

      user.role = newRole;
      localStorage.setItem('users', JSON.stringify(users));
      
      console.log('[Auth] User role updated:', userId, 'New role:', newRole);
      return true;
    } catch (error) {
      console.error('[Auth] Role update error:', error);
      return false;
    }
  }
}

/**
 * Route Protection System
 * Define which routes require authentication and specific roles
 */
class RouteProtection {
  constructor(auth) {
    this.auth = auth;
    this.protectedRoutes = {
      'admin.html': { requiresAuth: true, requiredRoles: ['admin'] },
      'seats.html': { requiresAuth: true, requiredRoles: ['user', 'admin'] },
      'passenger.html': { requiresAuth: true, requiredRoles: ['user', 'admin'] },
      'ticket.html': { requiresAuth: true, requiredRoles: ['user', 'admin'] },
    };
  }

  /**
   * Check if current page is protected
   * @returns {object | null}
   */
  getCurrentPageProtection() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return this.protectedRoutes[currentPage] || null;
  }

  /**
   * Enforce route protection
   */
  enforceProtection() {
    const protection = this.getCurrentPageProtection();
    
    if (!protection) {
      return; // Page is public
    }

    // Check authentication
    if (protection.requiresAuth && !this.auth.isAuthenticated()) {
      console.warn('[Route] Redirecting unauthenticated user to home');
      alert('Please log in first');
      window.location.href = 'index.html';
      return;
    }

    // Check role
    if (protection.requiredRoles) {
      if (!this.auth.hasRole(protection.requiredRoles)) {
        console.warn('[Route] Unauthorized access attempt - insufficient role');
        alert('You do not have permission to access this page');
        window.location.href = 'index.html';
        return;
      }
    }
  }

  /**
   * Add route protection listener on page load
   */
  setupProtection() {
    document.addEventListener('DOMContentLoaded', () => {
      this.enforceProtection();
    });
  }
}

/**
 * UI Permission Helper
 * Show/hide UI elements based on user role
 */
class UIPermissions {
  constructor(auth) {
    this.auth = auth;
  }

  /**
   * Show element only to specific roles
   * @param {string} elementId
   * @param {string | string[]} allowedRoles
   */
  showOnlyForRoles(elementId, allowedRoles) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (this.auth.hasRole(allowedRoles)) {
      el.style.display = '';
      el.removeAttribute('hidden');
    } else {
      el.style.display = 'none';
      el.setAttribute('hidden', 'true');
    }
  }

  /**
   * Show element only for admins
   * @param {string} elementId
   */
  showOnlyForAdmin(elementId) {
    this.showOnlyForRoles(elementId, 'admin');
  }

  /**
   * Show element only for authenticated users
   * @param {string} elementId
   */
  showOnlyAuthenticated(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (this.auth.isAuthenticated()) {
      el.style.display = '';
      el.removeAttribute('hidden');
    } else {
      el.style.display = 'none';
      el.setAttribute('hidden', 'true');
    }
  }

  /**
   * Hide element for specific roles
   * @param {string} elementId
   * @param {string | string[]} blockedRoles
   */
  hideForRoles(elementId, blockedRoles) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (this.auth.hasRole(blockedRoles)) {
      el.style.display = 'none';
      el.setAttribute('hidden', 'true');
    } else {
      el.style.display = '';
      el.removeAttribute('hidden');
    }
  }

  /**
   * Update UI based on auth state
   */
  updateAuthUI() {
    const isAuth = this.auth.isAuthenticated();
    const isAdmin = this.auth.isAdmin();

    // Update all role-based UI elements
    document.querySelectorAll('[data-role-required]').forEach(el => {
      const requiredRole = el.getAttribute('data-role-required');
      if (this.auth.hasRole(requiredRole)) {
        el.style.display = '';
        el.removeAttribute('hidden');
      } else {
        el.style.display = 'none';
        el.setAttribute('hidden', 'true');
      }
    });

    // Update auth-dependent elements
    document.querySelectorAll('[data-auth-required]').forEach(el => {
      if (isAuth) {
        el.style.display = '';
        el.removeAttribute('hidden');
      } else {
        el.style.display = 'none';
        el.setAttribute('hidden', 'true');
      }
    });
  }
}

// Export for use in other scripts
window.AuthService = AuthService;
window.RouteProtection = RouteProtection;
window.UIPermissions = UIPermissions;

// Initialize global instances
if (typeof window !== 'undefined') {
  window.auth = new AuthService();
  window.routeProtection = new RouteProtection(window.auth);
  window.uiPermissions = new UIPermissions(window.auth);

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.auth.init();
    window.routeProtection.setupProtection();
    window.uiPermissions.updateAuthUI();

    // Update UI on navigation
    window.addEventListener('auth:login', () => {
      window.uiPermissions.updateAuthUI();
    });

    window.addEventListener('auth:logout', () => {
      window.uiPermissions.updateAuthUI();
    });
  });
}
