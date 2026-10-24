/**
 * Tatito Financial Services — Mutual Funds & SIP Controller (mutual-funds.js)
 * Manages fund exploration, risk filtering, and simulated SIP registration.
 */

let selectedFund = null;

function initMutualFundsPage() {
  renderFundCatalog();
  renderActiveSipsList();
  bindMutualFundEvents();
}

function bindMutualFundEvents() {
  const categoryFilter = document.getElementById('mf-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      renderFundCatalog(e.target.value);
    });
  }

  const btnConfirmSip = document.getElementById('btn-confirm-sip');
  if (btnConfirmSip) {
    btnConfirmSip.addEventListener('click', executeSipCreation);
  }
}

function renderFundCatalog(category = 'all') {
  const container = document.getElementById('mf-catalog-grid');
  if (!container) return;

  const funds = window.TatitoStorage.getMutualFunds();

  const filtered = funds.filter(f => {
    return category === 'all' || f.category.toLowerCase().includes(category.toLowerCase());
  });

  container.innerHTML = filtered.map(f => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <h3 class="font-extrabold text-navy" style="font-size: 1.1rem;">${f.name}</h3>
            <span class="text-xs text-muted">${f.category}</span>
          </div>
          <span class="badge ${f.risk.includes('Very') ? 'badge-rose' : f.risk.includes('High') ? 'badge-amber' : 'badge-emerald'}">${f.risk} Risk</span>
        </div>

        <div style="background: #F8FAFC; padding: 0.85rem; border-radius: var(--radius-md); margin: 0.75rem 0; border: 1px solid var(--border-color); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8125rem;">
          <div>
            <span class="text-muted text-xs">3Y CAGR:</span><br>
            <strong class="text-emerald font-bold">+${f.cagr3y}%</strong>
          </div>
          <div>
            <span class="text-muted text-xs">5Y CAGR:</span><br>
            <strong class="text-emerald font-bold">+${f.cagr5y}%</strong>
          </div>
          <div>
            <span class="text-muted text-xs">NAV:</span><br>
            <strong class="text-navy">₹${f.nav}</strong>
          </div>
          <div>
            <span class="text-muted text-xs">AUM:</span><br>
            <strong class="text-navy">${f.fundSize}</strong>
          </div>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
          <div>Expense Ratio: <strong class="text-navy">${f.expenseRatio}</strong> • Min SIP: <strong class="text-teal">₹${f.minSip}</strong></div>
          <div>Fund Manager: <strong class="text-navy">${f.manager}</strong></div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; pt: 0.75rem; border-top: 1px solid var(--border-color);">
        <a href="sip-calculator.html?fund=${encodeURIComponent(f.name)}&return=${f.cagr3y}" class="btn btn-outline btn-sm" style="flex: 1;">
          SIP Calc
        </a>
        <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="openSipModal('${f.id}')">
          Start SIP →
        </button>
      </div>
    </div>
  `).join('');
}

function renderActiveSipsList() {
  const tbody = document.getElementById('active-sips-tbody');
  if (!tbody) return;

  const sips = window.TatitoStorage.getUserSips();

  if (sips.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No active SIP mandates registered. Start your first SIP above!</td></tr>`;
    return;
  }

  tbody.innerHTML = sips.map(sip => `
    <tr>
      <td><strong class="text-navy font-bold">${sip.fundName}</strong></td>
      <td class="font-bold text-teal">${formatINR(sip.monthlyAmount)} / month</td>
      <td>${sip.debitDay}th of each month</td>
      <td>${formatDate(sip.nextDebitDate)}</td>
      <td><span class="badge badge-emerald">${sip.status.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-outline btn-sm text-rose" onclick="cancelSip('${sip.id}')">Pause</button>
      </td>
    </tr>
  `).join('');
}

function openSipModal(fundId) {
  const funds = window.TatitoStorage.getMutualFunds();
  selectedFund = funds.find(f => f.id === fundId) || funds[0];

  const nameEl = document.getElementById('sip-modal-fund-name');
  if (nameEl) nameEl.textContent = selectedFund.name;

  const inputAmt = document.getElementById('sip-monthly-amount');
  if (inputAmt) inputAmt.value = selectedFund.minSip;

  openModal('modal-sip');
}

function executeSipCreation() {
  if (!selectedFund) return;
  const amt = parseInt(document.getElementById('sip-monthly-amount').value, 10);
  const day = parseInt(document.getElementById('sip-debit-day').value, 10);

  if (isNaN(amt) || amt < selectedFund.minSip) {
    alert(`Minimum SIP amount for this fund is ${formatINR(selectedFund.minSip)}`);
    return;
  }

  try {
    window.TatitoStorage.createSip(selectedFund.name, amt, day);
    showToast(`SIP for ${selectedFund.name} started successfully!`, 'success');
    closeModal('modal-sip');
    renderActiveSipsList();
  } catch (e) {
    alert(e.message);
  }
}

function cancelSip(sipId) {
  if (confirm('Do you want to pause or cancel this SIP mandate?')) {
    const sips = window.TatitoStorage.getUserSips();
    const updated = sips.filter(s => s.id !== sipId);
    window.TatitoStorage.set('tatito_demo_user_sips_v2', updated);
    showToast('SIP mandate paused.', 'info');
    renderActiveSipsList();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mf-catalog-grid')) {
    initMutualFundsPage();
  }
});
