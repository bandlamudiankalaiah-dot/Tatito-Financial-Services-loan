/**
 * Tatito Financial Services — SIP Calculator Controller (sip-calculator.js)
 * Computes compound future value of systematic investment plans,
 * renders comparative wealth projection SVG graphs, and enables one-click mandate creation.
 */

class SipCalculator {
  constructor() {
    this.monthlyInvestment = 5000;
    this.expectedReturnRate = 14.0; // 14% p.a.
    this.tenureYears = 10; // 10 years

    this.init();
  }

  init() {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('amount')) this.monthlyInvestment = parseInt(params.get('amount'), 10);
    if (params.get('return')) this.expectedReturnRate = parseFloat(params.get('return'));
    if (params.get('tenure')) this.tenureYears = parseInt(params.get('tenure'), 10);
    if (params.get('fund')) {
      const fundName = decodeURIComponent(params.get('fund'));
      const note = document.getElementById('sip-target-fund-note');
      if (note) {
        note.style.display = 'block';
        note.innerHTML = `Calculating projections for selected fund: <strong>${fundName}</strong>`;
      }
    }

    this.bindInputs();
    this.calculate();
  }

  bindInputs() {
    // Monthly amount
    const sliderAmt = document.getElementById('slider-sip-amount');
    const inputAmt = document.getElementById('input-sip-amount');
    if (sliderAmt && inputAmt) {
      sliderAmt.value = this.monthlyInvestment;
      inputAmt.value = this.monthlyInvestment;

      sliderAmt.addEventListener('input', (e) => {
        this.monthlyInvestment = Number(e.target.value);
        inputAmt.value = this.monthlyInvestment;
        this.calculate();
      });

      inputAmt.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (isNaN(val) || val < 500) val = 500;
        if (val > 500000) val = 500000;
        this.monthlyInvestment = val;
        sliderAmt.value = val;
        inputAmt.value = val;
        this.calculate();
      });
    }

    // Expected Return Rate
    const sliderRate = document.getElementById('slider-sip-rate');
    const inputRate = document.getElementById('input-sip-rate');
    if (sliderRate && inputRate) {
      sliderRate.value = this.expectedReturnRate;
      inputRate.value = this.expectedReturnRate;

      sliderRate.addEventListener('input', (e) => {
        this.expectedReturnRate = Number(e.target.value);
        inputRate.value = this.expectedReturnRate;
        this.calculate();
      });

      inputRate.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 35) val = 35;
        this.expectedReturnRate = val;
        sliderRate.value = val;
        inputRate.value = val;
        this.calculate();
      });
    }

    // Tenure
    const sliderTenure = document.getElementById('slider-sip-tenure');
    const inputTenure = document.getElementById('input-sip-tenure');
    if (sliderTenure && inputTenure) {
      sliderTenure.value = this.tenureYears;
      inputTenure.value = this.tenureYears;

      sliderTenure.addEventListener('input', (e) => {
        this.tenureYears = Number(e.target.value);
        inputTenure.value = this.tenureYears;
        this.calculate();
      });

      inputTenure.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 35) val = 35;
        this.tenureYears = val;
        sliderTenure.value = val;
        inputTenure.value = val;
        this.calculate();
      });
    }

    // Quick presets
    document.querySelectorAll('.btn-sip-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amt = parseInt(e.target.dataset.amount, 10);
        const rate = parseFloat(e.target.dataset.rate);
        const tenure = parseInt(e.target.dataset.tenure, 10);

        if (amt) { this.monthlyInvestment = amt; if (sliderAmt) sliderAmt.value = amt; if (inputAmt) inputAmt.value = amt; }
        if (rate) { this.expectedReturnRate = rate; if (sliderRate) sliderRate.value = rate; if (inputRate) inputRate.value = rate; }
        if (tenure) { this.tenureYears = tenure; if (sliderTenure) sliderTenure.value = tenure; if (inputTenure) inputTenure.value = tenure; }

        this.calculate();
      });
    });
  }

  calculate() {
    const P = this.monthlyInvestment;
    const i = (this.expectedReturnRate / 12) / 100;
    const n = this.tenureYears * 12;

    // Standard SIP Formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    let futureValue = 0;
    if (i <= 0) {
      futureValue = P * n;
    } else {
      futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }

    const totalInvested = P * n;
    const totalGains = Math.max(0, Math.round(futureValue - totalInvested));
    const finalAmount = Math.round(futureValue);

    const investedPct = Math.round((totalInvested / finalAmount) * 100);
    const gainsPct = 100 - investedPct;

    // DOM Display
    const elFinal = document.getElementById('calc-sip-total-wealth');
    if (elFinal) elFinal.textContent = formatINR(finalAmount);

    const elInvested = document.getElementById('calc-sip-invested-amount');
    if (elInvested) elInvested.textContent = formatINR(totalInvested);

    const elGains = document.getElementById('calc-sip-est-returns');
    if (elGains) elGains.textContent = formatINR(totalGains);

    const elInvPct = document.getElementById('calc-sip-invested-pct');
    if (elInvPct) elInvPct.textContent = `${investedPct}%`;

    const elGainPct = document.getElementById('calc-sip-gains-pct');
    if (elGainPct) elGainPct.textContent = `${gainsPct}%`;

    const barInvested = document.getElementById('bar-sip-invested');
    const barGains = document.getElementById('bar-sip-gains');
    if (barInvested && barGains) {
      barInvested.style.width = `${investedPct}%`;
      barGains.style.width = `${gainsPct}%`;
    }

    this.renderWealthProjectionSvg(P, i, this.tenureYears);
  }

  renderWealthProjectionSvg(P, i, years) {
    const container = document.getElementById('sip-projection-chart-svg');
    if (!container) return;

    // Build year-by-year curve points
    const step = Math.max(1, Math.floor(years / 5));
    const checkpoints = [];

    for (let y = 1; y <= years; y += step) {
      const months = y * 12;
      const fv = i <= 0 ? P * months : P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      const inv = P * months;
      checkpoints.push({ year: y, fv: Math.round(fv), inv: inv });
    }
    // Always include final year
    if (checkpoints[checkpoints.length - 1].year !== years) {
      const months = years * 12;
      const fv = i <= 0 ? P * months : P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      checkpoints.push({ year: years, fv: Math.round(fv), inv: P * months });
    }

    const maxVal = checkpoints[checkpoints.length - 1].fv * 1.1;
    const width = 420;
    const height = 180;
    const paddingX = 35;
    const paddingY = 30;

    const coords = checkpoints.map((pt, idx) => {
      const x = paddingX + (idx / (checkpoints.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (pt.fv / maxVal) * (height - 2 * paddingY);
      const yInv = height - paddingY - (pt.inv / maxVal) * (height - 2 * paddingY);
      return { x, y, yInv, year: pt.year, fv: pt.fv };
    });

    const polylineGains = coords.map(c => `${c.x},${c.y}`).join(' ');
    const polylineInv = coords.map(c => `${c.x},${c.yInv}`).join(' ');
    const area = `${coords[0].x},${height - paddingY} ${polylineGains} ${coords[coords.length - 1].x},${height - paddingY}`;

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 210px;">
        <defs>
          <linearGradient id="sipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="#CBD5E1" stroke-width="1" />
        <polygon points="${area}" fill="url(#sipGrad)" />
        <!-- Invested line (dashed) -->
        <polyline points="${polylineInv}" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="4" />
        <!-- Total Wealth line (green) -->
        <polyline points="${polylineGains}" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${coords.map(c => `
          <circle cx="${c.x}" cy="${c.y}" r="3.5" fill="#0B192C" stroke="#10B981" stroke-width="2" />
          <text x="${c.x}" y="${height - 10}" font-size="10" fill="#64748B" text-anchor="middle" font-family="system-ui">Yr ${c.year}</text>
        `).join('')}
      </svg>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('slider-sip-amount')) {
    window.tatitoSipCalc = new SipCalculator();
  }
});
