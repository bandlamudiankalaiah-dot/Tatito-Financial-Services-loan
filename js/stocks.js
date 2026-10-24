/**
 * Tatito Financial Services — Simulated Stock Trading Controller (stocks.js)
 * Live simulated quotes, SVG price graphs, watchlist management, and simulated buy/sell orders.
 */

let selectedStock = null;
let orderMode = 'buy'; // 'buy' or 'sell'

function initStocksPage() {
  renderStockTable();
  renderHoldingsTable();
  renderWatchlistPills();
  selectStock('RELIANCE');
  bindStockEvents();
}

function bindStockEvents() {
  const searchInput = document.getElementById('stock-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderStockTable(e.target.value, document.getElementById('sector-filter')?.value || 'all');
    });
  }

  const sectorSelect = document.getElementById('sector-filter');
  if (sectorSelect) {
    sectorSelect.addEventListener('change', (e) => {
      renderStockTable(document.getElementById('stock-search-input')?.value || '', e.target.value);
    });
  }

  // Order modal quantity / amount sync
  const qtyInput = document.getElementById('order-qty');
  if (qtyInput) {
    qtyInput.addEventListener('input', updateOrderCalculation);
  }

  const btnConfirmOrder = document.getElementById('btn-confirm-order');
  if (btnConfirmOrder) {
    btnConfirmOrder.addEventListener('click', executeOrder);
  }
}

function renderStockTable(search = '', sector = 'all') {
  const tbody = document.getElementById('stocks-table-tbody');
  if (!tbody) return;

  const stocks = window.TatitoStorage.getStocks();
  const watchlist = window.TatitoStorage.getWatchlist();

  const filtered = stocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          s.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sector === 'all' || s.sector.toLowerCase() === sector.toLowerCase();
    return matchesSearch && matchesSector;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No matching stocks found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isWatch = watchlist.includes(s.symbol);
    const isUp = s.change >= 0;

    return `
      <tr style="cursor: pointer;" onclick="selectStock('${s.symbol}')">
        <td>
          <div class="font-bold text-navy">${s.symbol}</div>
          <div class="text-xs text-muted">${s.name}</div>
        </td>
        <td><span class="badge badge-navy">${s.sector}</span></td>
        <td class="font-bold text-navy">${formatINRDecimal(s.price)}</td>
        <td class="font-bold ${isUp ? 'text-emerald' : 'text-rose'}">
          ${isUp ? '+' : ''}${formatINRDecimal(s.change)} (${formatPercentage(s.changePct)})
        </td>
        <td class="text-xs text-muted">
          H: ${formatINRDecimal(s.high)}<br>L: ${formatINRDecimal(s.low)}
        </td>
        <td style="white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); toggleWatchlistStock('${s.symbol}')" title="Watchlist">
            ${isWatch ? '★ Saved' : '☆ Watch'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openOrderModal('${s.symbol}', 'buy')">
            Trade
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderHoldingsTable() {
  const tbody = document.getElementById('holdings-table-tbody');
  if (!tbody) return;

  const holdings = window.TatitoStorage.getHoldings();

  if (holdings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No stock holdings in portfolio yet. Buy demo stocks above!</td></tr>`;
    return;
  }

  tbody.innerHTML = holdings.map(h => {
    const totalCost = h.qty * h.buyPrice;
    const currentVal = h.qty * h.currentPrice;
    const pnl = currentVal - totalCost;
    const pnlPct = (pnl / totalCost) * 100;
    const isProfit = pnl >= 0;

    return `
      <tr>
        <td>
          <div class="font-bold text-navy">${h.symbol}</div>
          <div class="text-xs text-muted">${h.name}</div>
        </td>
        <td class="font-semibold text-navy">${h.qty}</td>
        <td>${formatINRDecimal(h.buyPrice)}</td>
        <td class="font-bold text-navy">${formatINRDecimal(h.currentPrice)}</td>
        <td class="font-extrabold text-navy">${formatINR(currentVal)}</td>
        <td class="font-bold ${isProfit ? 'text-emerald' : 'text-rose'}">
          ${isProfit ? '+' : ''}${formatINR(pnl)}<br>
          <span class="text-xs">${formatPercentage(pnlPct)}</span>
        </td>
        <td style="white-space: nowrap;">
          <button class="btn btn-primary btn-sm" onclick="openOrderModal('${h.symbol}', 'buy')">Buy</button>
          <button class="btn btn-danger btn-sm" onclick="openOrderModal('${h.symbol}', 'sell')">Sell</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderWatchlistPills() {
  const container = document.getElementById('watchlist-pills-container');
  if (!container) return;

  const watchlist = window.TatitoStorage.getWatchlist();
  const stocks = window.TatitoStorage.getStocks();

  if (watchlist.length === 0) {
    container.innerHTML = `<span class="text-xs text-muted">No items in watchlist.</span>`;
    return;
  }

  container.innerHTML = watchlist.map(sym => {
    const s = stocks.find(st => st.symbol === sym);
    if (!s) return '';
    const isUp = s.change >= 0;

    return `
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.5rem 0.85rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" onclick="selectStock('${s.symbol}')">
        <div>
          <strong class="text-navy text-xs">${s.symbol}</strong>
          <div class="text-xs text-muted">${formatINRDecimal(s.price)}</div>
        </div>
        <span class="text-xs font-bold ${isUp ? 'text-emerald' : 'text-rose'}">${formatPercentage(s.changePct)}</span>
      </div>
    `;
  }).join('');
}

function selectStock(symbol) {
  const stocks = window.TatitoStorage.getStocks();
  const s = stocks.find(st => st.symbol === symbol) || stocks[0];
  selectedStock = s;

  const nameEl = document.getElementById('selected-stock-name');
  if (nameEl) nameEl.textContent = `${s.name} (${s.symbol})`;

  const priceEl = document.getElementById('selected-stock-price');
  if (priceEl) priceEl.textContent = formatINRDecimal(s.price);

  const changeEl = document.getElementById('selected-stock-change');
  if (changeEl) {
    const isUp = s.change >= 0;
    changeEl.textContent = `${isUp ? '+' : ''}${formatINRDecimal(s.change)} (${formatPercentage(s.changePct)})`;
    changeEl.className = isUp ? 'text-emerald font-bold' : 'text-rose font-bold';
  }

  renderStockSvgChart(s);
}

function renderStockSvgChart(s) {
  const container = document.getElementById('stock-price-chart-svg');
  if (!container) return;

  const basePrice = s.price;
  // Deterministic 7-point curve
  const points = [
    { x: 30, y: 130 },
    { x: 90, y: 110 },
    { x: 150, y: 125 },
    { x: 210, y: 90 },
    { x: 270, y: 105 },
    { x: 330, y: 65 },
    { x: 390, y: 40 }
  ];

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
  const area = `30,170 ${polyline} 390,170`;

  const isUp = s.change >= 0;
  const strokeColor = isUp ? '#10B981' : '#EF4444';

  container.innerHTML = `
    <svg viewBox="0 0 420 180" style="width: 100%; height: 200px;">
      <defs>
        <linearGradient id="stockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <line x1="20" y1="40" x2="400" y2="40" stroke="#F1F5F9" stroke-width="1" />
      <line x1="20" y1="90" x2="400" y2="90" stroke="#F1F5F9" stroke-width="1" />
      <line x1="20" y1="140" x2="400" y2="140" stroke="#F1F5F9" stroke-width="1" />
      <polygon points="${area}" fill="url(#stockGrad)" />
      <polyline points="${polyline}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function toggleWatchlistStock(symbol) {
  window.TatitoStorage.toggleWatchlist(symbol);
  renderStockTable();
  renderWatchlistPills();
  showToast(`Updated watchlist for ${symbol}`, 'info');
}

function openOrderModal(symbol, mode = 'buy') {
  const stocks = window.TatitoStorage.getStocks();
  selectedStock = stocks.find(s => s.symbol === symbol) || stocks[0];
  orderMode = mode;

  const modalTitle = document.getElementById('order-modal-title');
  if (modalTitle) modalTitle.textContent = `${mode.toUpperCase()} Order — ${selectedStock.symbol}`;

  const stockInfo = document.getElementById('order-stock-info');
  if (stockInfo) {
    stockInfo.textContent = `${selectedStock.name} • Price: ${formatINRDecimal(selectedStock.price)}`;
  }

  const btnConfirm = document.getElementById('btn-confirm-order');
  if (btnConfirm) {
    btnConfirm.textContent = mode === 'buy' ? 'Confirm Simulated BUY' : 'Confirm Simulated SELL';
    btnConfirm.className = mode === 'buy' ? 'btn btn-primary' : 'btn btn-danger';
  }

  document.getElementById('order-qty').value = '10';
  updateOrderCalculation();
  openModal('modal-order');
}

function updateOrderCalculation() {
  if (!selectedStock) return;
  const qty = parseInt(document.getElementById('order-qty').value, 10) || 0;
  const total = Math.round(qty * selectedStock.price);

  const totalEl = document.getElementById('order-total-amount');
  if (totalEl) totalEl.textContent = formatINR(total);

  const walletEl = document.getElementById('order-wallet-balance');
  if (walletEl) {
    const user = window.TatitoStorage.getCurrentUser();
    walletEl.textContent = `Available Wallet: ${formatINR(user.walletBalance)}`;
  }
}

function executeOrder() {
  if (!selectedStock) return;
  const qty = parseInt(document.getElementById('order-qty').value, 10);
  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid positive quantity');
    return;
  }

  try {
    if (orderMode === 'buy') {
      window.TatitoStorage.buyStock(selectedStock.symbol, qty);
      showToast(`Bought ${qty} shares of ${selectedStock.symbol}`, 'success');
    } else {
      window.TatitoStorage.sellStock(selectedStock.symbol, qty);
      showToast(`Sold ${qty} shares of ${selectedStock.symbol}`, 'success');
    }

    closeModal('modal-order');
    renderHoldingsTable();
    initStocksPage();
  } catch (e) {
    alert(e.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stocks-table-tbody')) {
    initStocksPage();
  }
});
