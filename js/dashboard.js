/**
 * Tatito Financial Services — Customer Dashboard Controller (dashboard.js)
 * Computes portfolio metrics, renders interactive SVG charts, active loans, and recent transactions.
 */

function initDashboard() {
  const user = window.TatitoStorage.getCurrentUser();
  const holdings = window.TatitoStorage.getHoldings();
  const activeLoans = window.TatitoStorage.getActiveLoans();
  const sips = window.TatitoStorage.getUserSips();
  const apps = window.TatitoStorage.getUserApplications();

  // 1. Calculate Portfolio Value
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + (h.qty * h.currentPrice), 0);
  const totalHoldingsCost = holdings.reduce((sum, h) => sum + (h.qty * h.buyPrice), 0);
  const totalNetWorth = totalHoldingsValue + user.walletBalance;
  const portfolioReturns = totalHoldingsValue - totalHoldingsCost;
  const returnsPct = totalHoldingsCost > 0 ? (portfolioReturns / totalHoldingsCost) * 100 : 0;

  // 2. Calculate Loan Metrics
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const nextLoanDue = activeLoans[0] || null;

  // 3. Update Metric Cards in DOM
  const elPortfolio = document.getElementById('stat-portfolio-value');
  if (elPortfolio) elPortfolio.textContent = formatINR(totalNetWorth);

  const elPortfolioReturn = document.getElementById('stat-portfolio-return');
  if (elPortfolioReturn) {
    elPortfolioReturn.textContent = `${portfolioReturns >= 0 ? '+' : ''}${formatINR(portfolioReturns)} (${returnsPct.toFixed(2)}%)`;
    elPortfolioReturn.className = `metric-sub ${portfolioReturns >= 0 ? 'positive' : 'negative'}`;
  }

  const elHoldingsVal = document.getElementById('stat-holdings-val');
  if (elHoldingsVal) elHoldingsVal.textContent = formatINR(totalHoldingsValue);

  const elWalletBal = document.getElementById('stat-wallet-bal');
  if (elWalletBal) elWalletBal.textContent = formatINR(user.walletBalance);

  const elLoansCount = document.getElementById('stat-loans-count');
  if (elLoansCount) elLoansCount.textContent = `${activeLoans.length} Active`;

  const elLoansOutstanding = document.getElementById('stat-loans-outstanding');
  if (elLoansOutstanding) elLoansOutstanding.textContent = formatINR(totalOutstanding);

  const elUpcomingEmi = document.getElementById('stat-upcoming-emi');
  if (elUpcomingEmi) {
    elUpcomingEmi.textContent = nextLoanDue ? formatINR(nextLoanDue.monthlyEmi) : '₹0';
  }

  const elUpcomingEmiDate = document.getElementById('stat-upcoming-date');
  if (elUpcomingEmiDate) {
    elUpcomingEmiDate.textContent = nextLoanDue ? `Due on ${formatDate(nextLoanDue.nextEmiDate)}` : 'No dues pending';
  }

  const elSipCount = document.getElementById('stat-sip-count');
  if (elSipCount) elSipCount.textContent = `${sips.length} Active SIP${sips.length !== 1 ? 's' : ''}`;

  // 4. Render SVG Allocation Doughnut Chart
  renderAllocationChart(holdings);

  // 5. Render SVG Growth Trend Chart
  renderTrendChart();

  // 6. Render Active Loans Table
  renderActiveLoansTable(activeLoans);

  // 7. Render Recent Applications Cards
  renderApplicationsList(apps);
}

// Render SVG Allocation Chart
function renderAllocationChart(holdings) {
  const container = document.getElementById('chart-allocation-svg');
  if (!container) return;

  // Group by category
  let equity = 0, gold = 0, mf = 0;
  holdings.forEach(h => {
    const val = h.qty * h.currentPrice;
    if (h.category === 'gold') gold += val;
    else if (h.category === 'mutual_fund') mf += val;
    else equity += val;
  });

  const total = equity + gold + mf || 1;
  const eqPct = Math.round((equity / total) * 100);
  const goldPct = Math.round((gold / total) * 100);
  const mfPct = 100 - eqPct - goldPct;

  // SVG Donut calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~377

  const eqDash = (eqPct / 100) * circumference;
  const goldDash = (goldPct / 100) * circumference;
  const mfDash = (mfPct / 100) * circumference;

  const svg = `
    <svg viewBox="0 0 200 200" style="width: 180px; height: 180px; transform: rotate(-90deg);">
      <circle cx="100" cy="100" r="${radius}" fill="transparent" stroke="#E2E8F0" stroke-width="24" />
      <circle cx="100" cy="100" r="${radius}" fill="transparent" stroke="#00ADB5" stroke-width="24"
        stroke-dasharray="${eqDash} ${circumference}" stroke-dashoffset="0" />
      <circle cx="100" cy="100" r="${radius}" fill="transparent" stroke="#F59E0B" stroke-width="24"
        stroke-dasharray="${goldDash} ${circumference}" stroke-dashoffset="-${eqDash}" />
      <circle cx="100" cy="100" r="${radius}" fill="transparent" stroke="#10B981" stroke-width="24"
        stroke-dasharray="${mfDash} ${circumference}" stroke-dashoffset="-${eqDash + goldDash}" />
    </svg>
    <div style="margin-left: 2rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem;">
        <span style="width: 12px; height: 12px; border-radius: 3px; background: #00ADB5;"></span>
        <strong>Equities & ETFs:</strong> ${eqPct}% (${formatINR(equity)})
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem;">
        <span style="width: 12px; height: 12px; border-radius: 3px; background: #F59E0B;"></span>
        <strong>Gold (24K ETF):</strong> ${goldPct}% (${formatINR(gold)})
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem;">
        <span style="width: 12px; height: 12px; border-radius: 3px; background: #10B981;"></span>
        <strong>Mutual Funds:</strong> ${mfPct}% (${formatINR(mf)})
      </div>
    </div>
  `;

  container.innerHTML = svg;
}

// Render SVG Growth Trend Chart
function renderTrendChart() {
  const container = document.getElementById('chart-trend-svg');
  if (!container) return;

  // 6 months timeline: May, Jun, Jul, Aug, Sep, Oct
  // Values: 320k -> 345k -> 362k -> 390k -> 408k -> 428k
  const points = [
    { m: 'May', v: 320000, x: 40, y: 150 },
    { m: 'Jun', v: 345000, x: 120, y: 130 },
    { m: 'Jul', v: 362000, x: 200, y: 115 },
    { m: 'Aug', v: 390000, x: 280, y: 85 },
    { m: 'Sep', v: 408000, x: 360, y: 65 },
    { m: 'Oct', v: 428203, x: 440, y: 35 }
  ];

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `40,180 ${polylinePoints} 440,180`;

  let labels = '';
  points.forEach(p => {
    labels += `<text x="${p.x}" y="195" font-size="11" fill="#64748B" text-anchor="middle" font-weight="600">${p.m}</text>`;
    labels += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#00ADB5" stroke="#FFFFFF" stroke-width="2" />`;
  });

  const svg = `
    <svg viewBox="0 0 500 210" style="width: 100%; height: 180px;">
      <defs>
        <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00ADB5" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#00ADB5" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <!-- Grid Lines -->
      <line x1="30" y1="40" x2="470" y2="40" stroke="#F1F5F9" stroke-width="1" />
      <line x1="30" y1="90" x2="470" y2="90" stroke="#F1F5F9" stroke-width="1" />
      <line x1="30" y1="140" x2="470" y2="140" stroke="#F1F5F9" stroke-width="1" />
      
      <!-- Area & Line -->
      <polygon points="${areaPoints}" fill="url(#trendGrad)" />
      <polyline points="${polylinePoints}" fill="none" stroke="#00ADB5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Dots & Labels -->
      ${labels}
    </svg>
  `;

  container.innerHTML = svg;
}

// Render Active Loans Table
function renderActiveLoansTable(activeLoans) {
  const tbody = document.getElementById('active-loans-tbody');
  if (!tbody) return;

  if (activeLoans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No active loans found. Explore our loan products below!</td></tr>`;
    return;
  }

  tbody.innerHTML = activeLoans.map(loan => {
    const progressPct = Math.round((loan.emisPaid / loan.totalEmis) * 100);
    return `
      <tr>
        <td>
          <div class="font-bold text-navy">${loan.loanName}</div>
          <div class="text-xs text-muted font-mono">${loan.loanAccountNo}</div>
        </td>
        <td>
          <div class="font-bold text-navy">${formatINR(loan.principalAmount)}</div>
          <div class="text-xs text-muted">${loan.interestRate}% p.a.</div>
        </td>
        <td>
          <div class="font-bold text-teal">${formatINR(loan.monthlyEmi)}</div>
          <div class="text-xs text-muted">${loan.emisPaid} of ${loan.totalEmis} paid</div>
        </td>
        <td>
          <div style="width: 120px; height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden; margin-bottom: 0.25rem;">
            <div style="width: ${progressPct}%; height: 100%; background: #00ADB5;"></div>
          </div>
          <span class="text-xs text-muted">${progressPct}% completed</span>
        </td>
        <td>
          <div class="font-semibold text-navy">${formatDate(loan.nextEmiDate)}</div>
          <span class="badge badge-emerald">On Schedule</span>
        </td>
        <td>
          <button class="btn btn-navy btn-sm" onclick="promptPayEmi('${loan.loanAccountNo}', ${loan.monthlyEmi})">
            Pay EMI
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Applications List
function renderApplicationsList(apps) {
  const container = document.getElementById('recent-apps-container');
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = `<div class="empty-state"><p class="text-muted text-sm">No loan applications submitted yet.</p></div>`;
    return;
  }

  container.innerHTML = apps.slice(0, 3).map(app => {
    let statusClass = 'badge-amber';
    if (app.status === 'approved') statusClass = 'badge-emerald';
    if (app.status === 'rejected') statusClass = 'badge-rose';

    return `
      <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.75rem; background: #FFFFFF;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <strong class="text-navy text-sm">${app.loanName}</strong>
            <div class="text-xs text-muted font-mono">${app.applicationNo}</div>
          </div>
          <span class="badge ${statusClass}">${app.status.replace('_', ' ')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--text-muted);">
          <span>Requested: <strong class="text-navy">${formatINR(app.requestedAmount)}</strong></span>
          <span>Tenure: ${app.tenureMonths} Mo</span>
        </div>
        <div class="text-xs text-muted" style="margin-top: 0.35rem; font-style: italic;">
          "${app.adminRemarks || 'Under verification'}"
        </div>
      </div>
    `;
  }).join('');
}

// Pay EMI Prompt
function promptPayEmi(accountNo, amount) {
  const user = window.TatitoStorage.getCurrentUser();
  if (confirm(`Confirm simulated EMI repayment of ${formatINR(amount)} for loan ${accountNo}?\n\nAmount will be deducted from your Tatito Pay wallet balance (${formatINR(user.walletBalance)}).`)) {
    try {
      window.TatitoStorage.payEmi(accountNo);
      showToast(`EMI of ${formatINR(amount)} paid successfully!`, 'success');
      initDashboard();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});
