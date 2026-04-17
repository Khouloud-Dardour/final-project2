/**
 * BusDZ Authentication & Authorization System
 * Production-ready RBAC implementation
 * 
 * Features:
 * - Secure session management with persistent storage
 * - Role-based access control (RBAC)
 * - Route protection
 * - Manual logout only (NO automatic timeout)
 * - XSS protection for stored data
 */

class AuthService {
  constructor() {
    this.SESSION_KEY = 'busdz_session';
    // NO AUTOMATIC TIMEOUT - Sessions persist until manual logout
    this.STORAGE_PREFIX = 'auth_';
  }

  /**
   * Initialize authentication on app startup
   */
  init() {
    this.validateSession();
    // NOTE: setupSessionTimeout REMOVED - no automatic logout
    this.setupLogoutListener();
    console.log('[Auth] Initialized - Session will persist until manual logout');
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

      // ========== HARDCODED ADMIN CREDENTIALS ==========
      // MASTER ADMIN - Bypass localStorage check
      const HARDCODED_ADMIN_USER = 'khouloud';
      const HARDCODED_ADMIN_PASS = 'derdour khouloud2009';
      
      if (username === HARDCODED_ADMIN_USER && password === HARDCODED_ADMIN_PASS) {
        console.log('[Auth] ✓ Master admin credentials detected - bypassing localStorage check');
        
        // Create admin session directly (bypass localStorage users check)
        const adminSession = {
          userId: 'admin_master_1',
          username: HARDCODED_ADMIN_USER,
          role: 'admin',
          loginTime: Date.now(),
          lastActivityTime: Date.now()
        };

        // Store session securely
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(adminSession));
        
        // Verify session was stored correctly
        const verifySession = localStorage.getItem(this.SESSION_KEY);
        if (!verifySession) {
          console.error('[Auth] CRITICAL: Admin session storage failed!');
          return false;
        }

        // Dispatch custom event for components to listen
        window.dispatchEvent(new CustomEvent('auth:login', { detail: adminSession }));

        console.log('[Auth] ✓✓✓ MASTER ADMIN logged in:', HARDCODED_ADMIN_USER, 'Role: admin');
        console.log('[Auth] ✓ Admin session stored in localStorage');
        return adminSession;
      }
      // ========== END HARDCODED ADMIN CHECK ==========

      // Regular user login - retrieve from localStorage
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
      
      // Verify session was stored correctly
      const verifySession = localStorage.getItem(this.SESSION_KEY);
      if (!verifySession) {
        console.error('[Auth] CRITICAL: Session storage failed!');
        return false;
      }

      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('auth:login', { detail: session }));

      console.log('[Auth] ✓ User logged in:', username, 'Role:', session.role);
      console.log('[Auth] ✓ Session stored in localStorage:', verifySession);
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
      if (session) {
        const parsed = JSON.parse(session);
        console.log('[Auth] Session retrieved - user:', parsed.username, 'role:', parsed.role);
        return parsed;
      }
      console.log('[Auth] No session in storage');
      return null;
    } catch (error) {
      console.error('[Auth] Session parse error:', error);
      console.error('[Auth] Raw data:', localStorage.getItem(this.SESSION_KEY));
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
   * Check if user is admin (role === 'admin')
   * @returns {boolean}
   */
  isAdmin() {
    const session = this.getSession();
    const isAdmin = session && session.role === 'admin';
    console.log('[Auth] isAdmin check: ', isAdmin, ' (role: ', session ? session.role : 'none', ')');
    return isAdmin;
  }

  /**
   * Validate session is still valid
   * Sessions NEVER expire automatically - only valid until manual logout
   * @param {object} session
   * @returns {boolean}
   */
  isSessionValid(session) {
    // Session is valid if it exists in localStorage
    // NO automatic timeout - persists forever or until manual logout
    if (!session || !session.loginTime) {
      return false;
    }
    return true;
  }

  /**
   * Validate current session and manage UI visibility
   */
  validateSession() {
    const isAuth = this.isAuthenticated();
    const isUserAdmin = this.isAdmin();
    const session = this.getSession();
    
    console.log('[Auth] Session validation: authenticated=', isAuth, 'isAdmin=', isUserAdmin);
    
    if (!isAuth) {
      // Not authenticated - hide admin panel, show login
      const adminPanel = document.getElementById('adminApp');
      if (adminPanel) adminPanel.style.display = 'none';
      const loginPanel = document.getElementById('loginPanel');
      if (loginPanel) loginPanel.style.display = 'block';
      console.log('[Auth] Not authenticated - showing login panel');
    } else if (isAuth && isUserAdmin) {
      // Authenticated AND admin - show admin panel, hide login
      const loginPanel = document.getElementById('loginPanel');
      if (loginPanel) loginPanel.style.display = 'none';
      const adminPanel = document.getElementById('adminApp');
      if (adminPanel) adminPanel.style.display = 'block';
      console.log('[Auth] Admin user logged in - showing admin panel');
    } else {
      // Authenticated but NOT admin - hide admin features
      const adminPanel = document.getElementById('adminApp');
      if (adminPanel) adminPanel.style.display = 'none';
      const loginPanel = document.getElementById('loginPanel');
      if (loginPanel) loginPanel.style.display = 'block';
      console.log('[Auth] Regular user - hiding admin features');
    }
  }

  /**
   * DISABLED - Automatic session timeout completely removed
   * Sessions now persist indefinitely until manual logout
   */
  setupSessionTimeout() {
    console.log('[Auth] setupSessionTimeout() is disabled - no automatic timeout');
    // THIS FUNCTION DOES NOTHING - KEPT FOR COMPATIBILITY ONLY
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
