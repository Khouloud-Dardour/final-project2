/**
 * Simple Admin Visibility System
 * Uses localStorage to detect admin access
 * Key: "isAdmin" with value "true" or "false"
 */

class AdminAuth {
  constructor() {
    this.ADMIN_KEY = 'isAdmin';
  }

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return localStorage.getItem(this.ADMIN_KEY) === 'true';
  }

  /**
   * Set admin status
   * @param {boolean} status
   */
  setAdmin(status) {
    localStorage.setItem(this.ADMIN_KEY, status ? 'true' : 'false');
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('admin:statusChanged', { detail: { isAdmin: status } }));
  }

  /**
   * Clear admin access (logout)
   */
  logout() {
    localStorage.removeItem(this.ADMIN_KEY);
    window.dispatchEvent(new CustomEvent('admin:statusChanged', { detail: { isAdmin: false } }));
  }

  /**
   * Update navbar to show/hide admin link based on admin status
   */
  updateNavbar() {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
      adminLink.style.display = this.isAdmin() ? 'inline-block' : 'none';
    }
  }

  /**
   * Protect admin page - redirect if not admin
   */
  protectAdminPage() {
    // Only run this on admin.html page
    if (!document.body.id.includes('admin')) return;

    if (!this.isAdmin()) {
      // Redirect to homepage after 1 second
      console.warn('[Admin Auth] Unauthorized access to admin page. Redirecting...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  }

  /**
   * Initialize the admin system
   */
  init() {
    // Update navbar on any page
    this.updateNavbar();

    // Listen for admin status changes
    window.addEventListener('admin:statusChanged', () => {
      this.updateNavbar();
    });

    // Protect admin page if user tries to access it
    this.protectAdminPage();
  }
}

// Initialize on page load
const adminAuth = new AdminAuth();
document.addEventListener('DOMContentLoaded', () => {
  adminAuth.init();
});
