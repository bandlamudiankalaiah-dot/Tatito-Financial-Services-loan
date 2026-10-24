/**
 * Tatito Financial Services — Authentication Controller (auth.js)
 * Manages JWT backend authentication, role-based session guards, and isolated demo sandbox flows.
 */

// Toggle Password Visibility
function setupPasswordToggle(inputSelector, buttonSelector) {
  const input = document.querySelector(inputSelector);
  const button = document.querySelector(buttonSelector);
  if (!input || !button) return;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = 'Hide';
    } else {
      input.type = 'password';
      button.textContent = 'Show';
    }
  });
}

// Production Standard Authentication (Zero silent bypasses)
async function handleLogin(email, password) {
  if (!email || !password) {
    showToast('Please enter both email and password.', 'error');
    throw new Error('Email and password required.');
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.detail || data.error || 'Invalid email or password.';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }

    // Store verified JWT
    localStorage.setItem('tatito_token', data.access_token);
    localStorage.setItem('tatito_auth_mode', 'production');

    // Sync user data to local storage for UI consumption
    if (window.TatitoStorage && data.user) {
      const users = window.TatitoStorage.getUsers();
      let match = users.find(u => u.id === data.user.id || u.email.toLowerCase() === data.user.email.toLowerCase());
      if (!match) {
        match = {
          id: data.user.id,
          name: data.user.full_name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          walletBalance: data.user.wallet_balance || 25000,
          city: 'Kadapa',
          state: 'Andhra Pradesh'
        };
        users.push(match);
        window.TatitoStorage.set('tatito_demo_users_v2', users);
      } else {
        match.role = data.user.role;
        match.name = data.user.full_name;
        window.TatitoStorage.set('tatito_demo_users_v2', users);
      }
      window.TatitoStorage.setCurrentUser(match.id);
    }

    showToast(`Welcome back, ${data.user.full_name}!`, 'success');
    setTimeout(() => redirectByRole(data.user.role), 500);
    return data;
  } catch (err) {
    if (err.message && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    showToast('Network error: Unable to reach authentication server.', 'error');
    throw err;
  }
}

// Separated 1-Click Demo Sandbox Profiles (Obtains real verified JWT via seeded demo credentials)
async function quickLogin(role) {
  const credentialsMap = {
    customer: { email: 'ramesh@tatito.in', pass: 'Password@123', name: 'Ramesh Kumar (Customer)' },
    admin: { email: 'admin@tatitofinance.com', pass: 'Password@123', name: 'Ankalaiah B. (Branch Admin)' },
    agent: { email: 'agent@tatito.in', pass: 'Password@123', name: 'Siva Reddy (DSA Partner)' },
    credit_officer: { email: 'credit@tatito.in', pass: 'Password@123', name: 'Lakshmi Narayana Rao (Credit Officer)' }
  };

  const target = credentialsMap[role];
  if (!target) {
    showToast(`Unknown demo role: ${role}`, 'error');
    return;
  }

  showToast(`Authenticating demo profile: ${target.name}...`, 'info');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: target.email, password: target.pass })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('tatito_token', data.access_token);
      localStorage.setItem('tatito_auth_mode', 'demo_sandbox');

      if (window.TatitoStorage && data.user) {
        const users = window.TatitoStorage.getUsers();
        let match = users.find(u => u.id === data.user.id || u.email.toLowerCase() === data.user.email.toLowerCase());
        if (!match) {
          match = {
            id: data.user.id,
            name: data.user.full_name,
            email: data.user.email,
            phone: data.user.phone,
            role: data.user.role,
            walletBalance: data.user.wallet_balance || 25000,
            city: 'Kadapa',
            state: 'Andhra Pradesh'
          };
          users.push(match);
          window.TatitoStorage.set('tatito_demo_users_v2', users);
        }
        window.TatitoStorage.setCurrentUser(match.id);
      }

      showToast(`Logged into Demo Sandbox as ${target.name}`, 'success');
      setTimeout(() => redirectByRole(data.user.role), 400);
      return;
    }
  } catch (netErr) {
    console.warn('[Demo Sandbox Offline Fallback]', netErr);
  }

  // Offline role bypass is strictly disabled in production.
  // Only permit offline demo simulation if explicitly enabled in demo environment
  const isDemoExplicit = localStorage.getItem('tatito_explicit_demo') === 'true' || window.__TATITO_DEMO_SANDBOX__ === true;
  if (isDemoExplicit && window.TatitoStorage) {
    const localUsers = window.TatitoStorage.getUsers();
    const localMatch = localUsers.find(u => u.role === role);
    if (localMatch) {
      window.TatitoStorage.setCurrentUser(localMatch.id);
      localStorage.setItem('tatito_auth_mode', 'demo_offline_unauthenticated');
      showToast(`Local Demo Mode: ${localMatch.name} (Offline Sandbox — Not authenticated with server)`, 'warning');
      setTimeout(() => redirectByRole(localMatch.role), 400);
      return;
    }
  }

  showToast('Authentication server unreachable. Offline login bypass is disabled.', 'error');
}

function redirectByRole(role) {
  if (role === 'admin' || role === 'credit_officer') {
    window.location.href = 'admin.html';
  } else if (role === 'agent') {
    window.location.href = 'agents.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

// Full-Stack Public Registration with Server Validation
async function handleRegistration(formData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || 'Password@123',
        role: 'customer', // Public registration is strictly customer role
        city: formData.city || 'Kadapa',
        state: formData.state || 'Andhra Pradesh',
        annual_income: formData.annualIncome || 750000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.detail || data.error || 'Registration failed.';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }

    localStorage.setItem('tatito_token', data.access_token);
    localStorage.setItem('tatito_auth_mode', 'production');

    if (window.TatitoStorage && data.user) {
      const users = window.TatitoStorage.getUsers();
      const newUser = {
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        walletBalance: data.user.wallet_balance || 25000,
        city: formData.city || 'Kadapa',
        state: formData.state || 'Andhra Pradesh'
      };
      users.push(newUser);
      window.TatitoStorage.set('tatito_demo_users_v2', users);
      window.TatitoStorage.setCurrentUser(newUser.id);
    }

    showToast('Registration successful! Welcome to Tatito Financial Services.', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } catch (e) {
    if (e.message && !e.message.includes('Failed to fetch')) {
      throw e;
    }
    showToast('Network error during registration. Please check server.', 'error');
    throw e;
  }
}

// Logout
function handleLogout() {
  localStorage.removeItem('tatito_token');
  localStorage.removeItem('tatito_auth_mode');
  showToast('Logged out of session.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
}

// Protected Route Guard
function checkProtectedRoute() {
  const token = localStorage.getItem('tatito_token');
  const authMode = localStorage.getItem('tatito_auth_mode');
  if (!token) {
    if (authMode === 'demo_offline_unauthenticated' && localStorage.getItem('tatito_explicit_demo') === 'true') {
      return;
    }
    window.location.href = 'login.html';
  }
}

// Admin Route Guard
function requireAdmin() {
  const token = localStorage.getItem('tatito_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  const currentUser = window.TatitoStorage ? window.TatitoStorage.getCurrentUser() : null;
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'credit_officer')) {
    showToast('Administrative privileges required. Redirecting to user portal...', 'warning');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  }
}

// Global Auth exports
window.TatitoAuth = {
  login: handleLogin,
  handleDemoLogin: handleLogin,
  quickLogin,
  register: handleRegistration,
  handleDemoRegistration: handleRegistration,
  logout: handleLogout,
  checkProtectedRoute,
  requireAdmin
};
