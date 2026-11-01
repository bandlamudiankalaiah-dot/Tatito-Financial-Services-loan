/**
 * Tatito Financial Services — Core Application Utilities (app.js)
 * Global formatters, UI controllers, toast notices, navigation, and API Config.
 */

// --- Centralized API Client Module (Live Express Backend) ---
const TatitoApiClient = {
  BASE_URL: '/api',
  getHeaders: function() {
    const token = localStorage.getItem('tatito_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },
  async get(endpoint) {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.warn(`GET ${endpoint} failed:`, e);
      return null;
    }
  },
  async post(endpoint, body = {}) {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.warn(`POST ${endpoint} failed:`, e);
      return null;
    }
  },
  async patch(endpoint, body = {}) {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.warn(`PATCH ${endpoint} failed:`, e);
      return null;
    }
  },
  async put(endpoint, body = {}) {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.warn(`PUT ${endpoint} failed:`, e);
      return null;
    }
  },
  async delete(endpoint) {
    try {
      const res = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (e) {
      console.warn(`DELETE ${endpoint} failed:`, e);
      return null;
    }
  }
};
window.TatitoApiClient = TatitoApiClient;

// --- Currency & Number Formatting (Indian Format) ---
function formatINR(number) {
  if (number === null || number === undefined || isNaN(number)) return '₹0';
  const val = Math.round(Number(number));
  return '₹' + val.toLocaleString('en-IN');
}

function formatINRDecimal(number) {
  if (number === null || number === undefined || isNaN(number)) return '₹0.00';
  return '₹' + Number(number).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPercentage(val) {
  if (isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${Number(val).toFixed(2)}%`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
}

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '⚠';

  toast.innerHTML = `
    <span style="font-weight: 800; font-size: 1.1rem;">${icon}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Modals Management ---
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modals when clicking backdrop
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// --- Sidebar Toggle for Mobile ---
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.querySelector('.app-sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show-sidebar');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show-sidebar');
      backdrop.classList.remove('show');
    });
  }
}

// --- Update Topbar Unread Badge ---
function updateNotificationBadge() {
  const badge = document.getElementById('topbar-notif-badge');
  if (badge && window.TatitoStorage) {
    const unread = window.TatitoStorage.getNotifications().filter(n => !n.isRead).length;
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// --- Quick Role Switcher (Customer / Admin / Agent) ---
function switchUserRole(role) {
  const users = window.TatitoStorage.getUsers();
  const target = users.find(u => u.role === role);
  if (target) {
    window.TatitoStorage.setCurrentUser(target.id);
    showToast(`Switched active profile to ${target.name} (${role.toUpperCase()})`, 'success');
    setTimeout(() => {
      if (role === 'admin') window.location.href = 'admin.html';
      else if (role === 'agent') window.location.href = 'agents.html';
      else window.location.href = 'dashboard.html';
    }, 400);
  }
}

// --- Reset Demo Data Confirmation ---
function confirmResetDemoData() {
  if (confirm('Are you sure you want to reset all simulated balances, active loans, and applications back to factory Kadapa defaults?')) {
    window.TatitoStorage.resetAllData();
    showToast('All demo datasets have been reset.', 'success');
    setTimeout(() => window.location.reload(), 600);
  }
}

// --- Initialize Common UI on DOM Load ---
document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  updateNotificationBadge();

  // Populate active user name in topbar if element exists
  const userNameEl = document.getElementById('current-user-name');
  if (userNameEl && window.TatitoStorage) {
    userNameEl.textContent = window.TatitoStorage.getCurrentUser().name;
  }
});
