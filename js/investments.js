/**
 * Tatito Financial Services — Investments Master Hub Controller (investments.js)
 * Coordinates asset allocation visualizer, net worth aggregator, market pulse,
 * and seamless navigation between Stocks, Mutual Funds, and Demat.
 */

function initInvestmentsMasterPage() {
  renderInvestmentPortfolioOverview();
  renderInvestmentsBreakdownTable();
  renderMarketPulseQuotes();
  bindInvestmentsEvents();
}

function bindInvestmentsEvents() {
  const btnAddFunds = document.getElementById('btn-add-investment-funds');
  if (btnAddFunds) {
    btnAddFunds.addEventListener('click', () => {
      openModal('modal-add-funds');
    });
  }

  const btnConfirmDeposit = document.getElementById('btn-confirm-funds-deposit');
  if (btnConfirmDeposit) {
    btnConfirmDeposit.addEventListener('click', executeSimulatedDeposit);
  }

  // Timeframe selector for SVG chart
  document.querySelectorAll('.btn-chart-timeframe').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-chart-timeframe').forEach(b => b.classList.remove('btn-primary'));
      document.querySelectorAll('.btn-chart-timeframe').forEach(b => b.classList.add('btn-outline'));
      e.target.classList.remove('btn-outline');
      e.target.classList.add('btn-primary');
      renderPortfolioTrendSvg(e.target.dataset.timeframe);
    });
  });
}

function renderInvestmentPortfolioOverview() {
  const holdings = window.TatitoStorage.getHoldings();
  const sips = window.TatitoStorage.getUserSips();
  const user = window.TatitoStorage.getCurrentUser();

  // Calculate totals
  let stockValue = 0;
  let stockCost = 0;
  holdings.forEach(h => {
    stockValue += (h.qty * h.currentPrice);
    stockCost += (h.qty * h.buyPrice);
  });

  const mfValue = 274485; // Baseline mutual funds holding
  const mfCost = 239400;

  const goldValue = 102675; // Gold ETF holding
  const goldCost = 90000;

  const bondValue = 50700; // Sovereign bonds
  const bondCost = 50000;

  const totalCurrentValue = stockValue + mfValue + goldValue + bondValue;
  const totalCostBasis = stockCost + mfCost + goldCost + bondCost;
  const totalProfit = totalCurrentValue - totalCostBasis;
  const profitPercentage = totalCostBasis > 0 ? (totalProfit / totalCostBasis) * 100 : 0;

  // DOM Updates
  const elPortfolioVal = document.getElementById('inv-total-portfolio-value');
  if (elPortfolioVal) elPortfolioVal.textContent = formatINR(totalCurrentValue);

  const elTotalProfit = document.getElementById('inv-total-returns');
  if (elTotalProfit) {
    const isUp = totalProfit >= 0;
    elTotalProfit.textContent = `${isUp ? '+' : ''}${formatINR(totalProfit)} (${formatPercentage(profitPercentage)})`;
    elTotalProfit.className = isUp ? 'text-emerald font-bold' : 'text-rose font-bold';
  }

  const elInvestedAmt = document.getElementById('inv-total-invested-amount');
  if (elInvestedAmt) elInvestedAmt.textContent = formatINR(totalCostBasis);

  const elWalletBal = document.getElementById('inv-wallet-available');
  if (elWalletBal) elWalletBal.textContent = formatINR(user.walletBalance);

  const elActiveSips = document.getElementById('inv-active-sips-count');
  if (elActiveSips) elActiveSips.textContent = `${sips.length} Mandates`;

  // Asset allocation percentages
  if (totalCurrentValue > 0) {
    const pctStocks = Math.round((stockValue / totalCurrentValue) * 100);
    const pctMf = Math.round((mfValue / totalCurrentValue) * 100);
    const pctGold = Math.round((goldValue / totalCurrentValue) * 100);
    const pctBonds = Math.max(0, 100 - (pctStocks + pctMf + pctGold));

    const barStocks = document.getElementById('bar-alloc-stocks');
    if (barStocks) { barStocks.style.width = `${pctStocks}%`; barStocks.title = `Direct Equity: ${pctStocks}%`; }

    const barMf = document.getElementById('bar-alloc-mf');
    if (barMf) { barMf.style.width = `${pctMf}%`; barMf.title = `Mutual Funds: ${pctMf}%`; }

    const barGold = document.getElementById('bar-alloc-gold');
    if (barGold) { barGold.style.width = `${pctGold}%`; barGold.title = `Gold ETFs: ${pctGold}%`; }

    const barBonds = document.getElementById('bar-alloc-bonds');
    if (barBonds) { barBonds.style.width = `${pctBonds}%`; barBonds.title = `Sovereign Bonds: ${pctBonds}%`; }

    const elLabelStocks = document.getElementById('alloc-lbl-stocks');
    if (elLabelStocks) elLabelStocks.textContent = `${pctStocks}% (${formatINR(stockValue)})`;

    const elLabelMf = document.getElementById('alloc-lbl-mf');
    if (elLabelMf) elLabelMf.textContent = `${pctMf}% (${formatINR(mfValue)})`;

    const elLabelGold = document.getElementById('alloc-lbl-gold');
    if (elLabelGold) elLabelGold.textContent = `${pctGold}% (${formatINR(goldValue)})`;

    const elLabelBonds = document.getElementById('alloc-lbl-bonds');
    if (elLabelBonds) elLabelBonds.textContent = `${pctBonds}% (${formatINR(bondValue)})`;
  }

  renderPortfolioTrendSvg('6M');
}

function renderPortfolioTrendSvg(timeframe = '6M') {
  const container = document.getElementById('inv-trend-chart-svg');
  if (!container) return;

  // Curvature points
  let points = [];
  if (timeframe === '1M') {
    points = [
      { x: 20, y: 140, label: 'W1' },
      { x: 120, y: 120, label: 'W2' },
      { x: 220, y: 95, label: 'W3' },
      { x: 320, y: 70, label: 'W4' },
      { x: 420, y: 55, label: 'Now' }
    ];
  } else if (timeframe === '1Y') {
    points = [
      { x: 20, y: 155, label: 'Oct 25' },
      { x: 100, y: 135, label: 'Jan 26' },
      { x: 180, y: 110, label: 'Apr 26' },
      { x: 260, y: 85, label: 'Jul 26' },
      { x: 340, y: 65, label: 'Sep 26' },
      { x: 420, y: 45, label: 'Oct 26' }
    ];
  } else {
    // 6M default
    points = [
      { x: 20, y: 150, label: 'May' },
      { x: 100, y: 130, label: 'Jun' },
      { x: 180, y: 140, label: 'Jul' },
      { x: 260, y: 100, label: 'Aug' },
      { x: 340, y: 75, label: 'Sep' },
      { x: 420, y: 50, label: 'Oct' }
    ];
  }

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const area = `20,180 ${polyline} 420,180`;

  container.innerHTML = `
    <svg viewBox="0 0 440 200" style="width: 100%; height: 210px;">
      <defs>
        <linearGradient id="invChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00ADB5" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#00ADB5" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      <line x1="20" y1="40" x2="420" y2="40" stroke="#F1F5F9" stroke-width="1" />
      <line x1="20" y1="90" x2="420" y2="90" stroke="#F1F5F9" stroke-width="1" />
      <line x1="20" y1="140" x2="420" y2="140" stroke="#F1F5F9" stroke-width="1" />
      
      <!-- Area & Line -->
      <polygon points="${area}" fill="url(#invChartGrad)" />
      <polyline points="${polyline}" fill="none" stroke="#00ADB5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Dots & Labels -->
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#0B192C" stroke="#00ADB5" stroke-width="2" />
        <text x="${p.x}" y="195" font-size="11" fill="#64748B" text-anchor="middle" font-family="system-ui">${p.label}</text>
      `).join('')}
    </svg>
  `;
}

function renderInvestmentsBreakdownTable() {
  const tbody = document.getElementById('inv-holdings-breakdown-tbody');
  if (!tbody) return;

  const holdings = window.TatitoStorage.getHoldings();

  // Composite holding records
  const allHoldings = [
    ...holdings.map(h => ({
      asset: h.name,
      symbol: h.symbol,
      type: 'Direct Equity',
      qty: h.qty,
      avgPrice: h.buyPrice,
      currentPrice: h.currentPrice,
      currentValue: h.qty * h.currentPrice,
      pnl: (h.qty * h.currentPrice) - (h.qty * h.buyPrice),
      isDirect: true
    })),
    {
      asset: 'UTI Nifty 50 Index Fund Direct-Growth',
      symbol: 'UTI_NIFTY50',
      type: 'Mutual Fund (SIP)',
      qty: 124.5,
      avgPrice: 1200.0,
      currentPrice: 1380.0,
      currentValue: 171810,
      pnl: 22410,
      isDirect: false
    },
    {
      asset: 'Nippon India Gold ETF (BeES)',
      symbol: 'GOLDBEES',
      type: 'Commodity ETF',
      qty: 1500,
      avgPrice: 60.0,
      currentPrice: 68.45,
      currentValue: 102675,
      pnl: 12675,
      isDirect: false
    },
    {
      asset: '7.18% GS 2033 Sovereign Bond',
      symbol: 'GOI_2033',
      type: 'Govt Sovereign Bond',
      qty: 500,
      avgPrice: 100.0,
      currentPrice: 101.40,
      currentValue: 50700,
      pnl: 700,
      isDirect: false
    }
  ];

  tbody.innerHTML = allHoldings.map(row => {
    const isUp = row.pnl >= 0;
    const pnlPct = ((row.pnl / (row.currentValue - row.pnl)) * 100).toFixed(2);

    return `
      <tr>
        <td>
          <div class="font-bold text-navy">${row.asset}</div>
          <div class="text-xs text-muted font-mono">${row.symbol}</div>
        </td>
        <td><span class="badge badge-navy">${row.type}</span></td>
        <td class="font-semibold text-navy">${row.qty}</td>
        <td>${formatINRDecimal(row.avgPrice)}</td>
        <td class="font-bold text-navy">${formatINRDecimal(row.currentPrice)}</td>
        <td class="font-extrabold text-teal">${formatINR(row.currentValue)}</td>
        <td class="font-bold ${isUp ? 'text-emerald' : 'text-rose'}">
          ${isUp ? '+' : ''}${formatINR(row.pnl)}<br>
          <span class="text-xs">(${isUp ? '+' : ''}${pnlPct}%)</span>
        </td>
        <td style="white-space: nowrap;">
          ${row.isDirect ? `
            <a href="stocks.html" class="btn btn-primary btn-sm">Trade</a>
          ` : `
            <a href="mutual-funds.html" class="btn btn-outline btn-sm">View</a>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function renderMarketPulseQuotes() {
  const container = document.getElementById('market-pulse-ticker-container');
  if (!container) return;

  const stocks = window.TatitoStorage.getStocks();
  const topQuotes = stocks.slice(0, 5);

  container.innerHTML = topQuotes.map(s => {
    const isUp = s.change >= 0;
    return `
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem 1rem; min-width: 170px; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <strong class="font-bold text-navy" style="font-size: 0.875rem;">${s.symbol}</strong>
          <span class="text-xs font-bold ${isUp ? 'text-emerald' : 'text-rose'}">${isUp ? '+' : ''}${formatPercentage(s.changePct)}</span>
        </div>
        <div class="font-extrabold text-navy" style="font-size: 1.1rem;">${formatINRDecimal(s.price)}</div>
        <div class="text-xs text-muted">${s.name}</div>
      </div>
    `;
  }).join('');
}

function executeSimulatedDeposit() {
  const inputAmt = document.getElementById('deposit-amount-input');
  const amt = parseInt(inputAmt?.value, 10);

  if (isNaN(amt) || amt <= 0) {
    alert('Please enter a valid deposit amount in INR');
    return;
  }

  const user = window.TatitoStorage.getCurrentUser();
  user.walletBalance = (user.walletBalance || 0) + amt;
  window.TatitoStorage.set('tatito_demo_current_user_v2', user);

  showToast(`Simulated deposit of ${formatINR(amt)} added to wallet!`, 'success');
  closeModal('modal-add-funds');
  initInvestmentsMasterPage();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('inv-total-portfolio-value')) {
    initInvestmentsMasterPage();
  }
});
