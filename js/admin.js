/**
 * Tatito Financial Services — Admin Operations Console (admin.js)
 * Manages loan underwriting, status decisions, user roster, and CSV reporting.
 */

let currentReviewApp = null;

function initAdminPage() {
  requireAdmin();
  updateAdminKpis();
  renderAdminLoansTable();
  bindAdminEvents();
}

function bindAdminEvents() {
  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAdminLoansTable(e.target.value, document.getElementById('admin-status-filter')?.value || 'all');
    });
  }

  const statusFilter = document.getElementById('admin-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      renderAdminLoansTable(document.getElementById('admin-search-input')?.value || '', e.target.value);
    });
  }

  // Decision buttons
  const btnApprove = document.getElementById('btn-decision-approve');
  if (btnApprove) {
    btnApprove.addEventListener('click', () => submitDecision('approved'));
  }

  const btnReview = document.getElementById('btn-decision-review');
  if (btnReview) {
    btnReview.addEventListener('click', () => submitDecision('under_review'));
  }

  const btnReject = document.getElementById('btn-decision-reject');
  if (btnReject) {
    btnReject.addEventListener('click', () => submitDecision('rejected'));
  }

  // Export CSV
  const btnExport = document.getElementById('btn-export-admin-csv');
  if (btnExport) {
    btnExport.addEventListener('click', exportApplicationsCSV);
  }
}

function updateAdminKpis() {
  const users = window.TatitoStorage.getUsers();
  const apps = window.TatitoStorage.getApplications();
  const activeLoans = window.TatitoStorage.get('tatito_demo_loans_v2') || [];
  const holdings = window.TatitoStorage.getHoldings();

  const totalUsers = users.length;
  const pendingApps = apps.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedApps = apps.filter(a => a.status === 'approved').length;
  const totalDisbursed = activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalInvVolume = holdings.reduce((sum, h) => sum + (h.qty * h.currentPrice), 0);

  const elUsers = document.getElementById('admin-stat-users');
  if (elUsers) elUsers.textContent = totalUsers;

  const elPending = document.getElementById('admin-stat-pending');
  if (elPending) elPending.textContent = pendingApps;

  const elApproved = document.getElementById('admin-stat-approved');
  if (elApproved) elApproved.textContent = approvedApps;

  const elDisbursed = document.getElementById('admin-stat-disbursed');
  if (elDisbursed) elDisbursed.textContent = formatINR(totalDisbursed);

  const elInvVol = document.getElementById('admin-stat-investment');
  if (elInvVol) elInvVol.textContent = formatINR(totalInvVolume);
}

function renderAdminLoansTable(search = '', status = 'all') {
  const tbody = document.getElementById('admin-loans-tbody');
  if (!tbody) return;

  const apps = window.TatitoStorage.getApplications();

  const filtered = apps.filter(a => {
    const matchesSearch = a.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
                          a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
                          a.phone.includes(search);
    const matchesStatus = status === 'all' || a.status === status;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No matching loan applications found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    let statusClass = 'badge-amber';
    if (a.status === 'approved') statusClass = 'badge-emerald';
    if (a.status === 'rejected') statusClass = 'badge-rose';

    return `
      <tr>
        <td class="font-mono font-bold text-navy">${a.applicationNo}</td>
        <td>
          <div class="font-bold text-navy">${a.applicantName}</div>
          <div class="text-xs text-muted">${a.phone}</div>
        </td>
        <td>
          <strong class="text-navy">${a.loanName}</strong><br>
          <span class="text-xs text-muted">${a.interestRate}% p.a.</span>
        </td>
        <td>
          <div class="font-extrabold text-teal">${formatINR(a.requestedAmount)}</div>
          <div class="text-xs text-muted">${a.tenureMonths} Mo</div>
        </td>
        <td>${formatDate(a.createdAt)}</td>
        <td><span class="badge ${statusClass}">${a.status.replace('_', ' ')}</span></td>
        <td>
          <button class="btn btn-navy btn-sm" onclick="openReviewModal('${a.id}')">
            Review Dossier
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openReviewModal(appId) {
  const apps = window.TatitoStorage.getApplications();
  const app = apps.find(a => a.id === appId);
  if (!app) return;

  currentReviewApp = app;

  const detailsEl = document.getElementById('review-app-details');
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem; font-size: 0.8125rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div><span class="text-muted">Application #:</span><br><strong class="font-mono text-navy">${app.applicationNo}</strong></div>
          <div><span class="text-muted">Applicant:</span><br><strong class="text-navy">${app.applicantName}</strong></div>
          <div><span class="text-muted">Contact:</span><br><strong>${app.phone}</strong> (${app.email})</div>
          <div><span class="text-muted">Location:</span><br><strong>${app.city || 'Kadapa, AP'}</strong></div>
          <div><span class="text-muted">Requested Amount:</span><br><strong class="text-teal" style="font-size: 1.1rem;">${formatINR(app.requestedAmount)}</strong></div>
          <div><span class="text-muted">Tenure & Rate:</span><br><strong>${app.tenureMonths} Mo @ ${app.interestRate}% p.a.</strong></div>
          <div><span class="text-muted">Monthly Income:</span><br><strong>${formatINR(app.monthlyIncome || 65000)}</strong></div>
          <div><span class="text-muted">Current Status:</span><br><strong class="text-uppercase">${app.status}</strong></div>
        </div>
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
          <span class="text-muted">Stated Purpose:</span><br>
          <em>"${app.purpose || 'Business expansion'}"</em>
        </div>
      </div>
    `;
  }

  const remarksInput = document.getElementById('review-decision-remarks');
  if (remarksInput) remarksInput.value = app.adminRemarks || '';

  openModal('modal-review-app');
}

function submitDecision(newStatus) {
  if (!currentReviewApp) return;

  const remarks = document.getElementById('review-decision-remarks')?.value.trim() || 
                  `Decided by Kadapa Credit Officer (${newStatus.toUpperCase()})`;

  try {
    window.TatitoStorage.updateApplicationStatus(currentReviewApp.id, newStatus, remarks);
    showToast(`Application #${currentReviewApp.applicationNo} marked as ${newStatus.toUpperCase()}`, 'success');
    closeModal('modal-review-app');
    updateAdminKpis();
    renderAdminLoansTable();
  } catch (e) {
    alert(e.message);
  }
}

function exportApplicationsCSV() {
  const apps = window.TatitoStorage.getApplications();
  if (apps.length === 0) {
    alert('No applications to export.');
    return;
  }

  let csv = "data:text/csv;charset=utf-8,Application No,Applicant Name,Phone,Email,Loan Product,Amount (INR),Tenure (Mo),Status,Remarks,Date\n";
  apps.forEach(a => {
    csv += `"${a.applicationNo}","${a.applicantName}","${a.phone}","${a.email}","${a.loanName}",${a.requestedAmount},${a.tenureMonths},"${a.status}","${(a.adminRemarks||'').replace(/"/g, '""')}","${a.createdAt}"\n`;
  });

  const uri = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", uri);
  link.setAttribute("download", `Tatito_Loan_Applications_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Exported loan applications to CSV!", "success");
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admin-loans-tbody')) {
    initAdminPage();
  }
});
