/**
 * Tatito Financial Services — Interactive EMI Calculator (emi-calculator.js)
 * Implements the standard reducing-balance EMI formula, SVG visual breakdown,
 * full month-by-month amortization schedule, and CSV export.
 */

class EmiCalculator {
  constructor() {
    this.amount = 1000000; // ₹10,00,000 default
    this.rate = 11.0; // 11% p.a. default
    this.tenureMonths = 36; // 36 months default
    this.tenureUnit = 'months'; // 'months' or 'years'

    this.init();
  }

  init() {
    // Parse URL params if directed from loan catalog
    const params = new URLSearchParams(window.location.search);
    if (params.get('amount')) this.amount = parseInt(params.get('amount'), 10);
    if (params.get('rate')) this.rate = parseFloat(params.get('rate'));
    if (params.get('tenure')) this.tenureMonths = parseInt(params.get('tenure'), 10);

    this.bindInputs();
    this.calculate();
  }

  bindInputs() {
    // Amount slider & input
    const sliderAmt = document.getElementById('slider-amount');
    const inputAmt = document.getElementById('input-amount');
    if (sliderAmt && inputAmt) {
      sliderAmt.value = this.amount;
      inputAmt.value = this.amount;

      sliderAmt.addEventListener('input', (e) => {
        this.amount = Number(e.target.value);
        inputAmt.value = this.amount;
        this.calculate();
      });

      inputAmt.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (isNaN(val) || val < 10000) val = 10000;
        if (val > 10000000) val = 10000000;
        this.amount = val;
        sliderAmt.value = val;
        inputAmt.value = val;
        this.calculate();
      });
    }

    // Rate slider & input
    const sliderRate = document.getElementById('slider-rate');
    const inputRate = document.getElementById('input-rate');
    if (sliderRate && inputRate) {
      sliderRate.value = this.rate;
      inputRate.value = this.rate;

      sliderRate.addEventListener('input', (e) => {
        this.rate = Number(e.target.value);
        inputRate.value = this.rate;
        this.calculate();
      });

      inputRate.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 36) val = 36;
        this.rate = val;
        sliderRate.value = val;
        inputRate.value = val;
        this.calculate();
      });
    }

    // Tenure slider & input
    const sliderTenure = document.getElementById('slider-tenure');
    const inputTenure = document.getElementById('input-tenure');
    if (sliderTenure && inputTenure) {
      sliderTenure.value = this.tenureMonths;
      inputTenure.value = this.tenureMonths;

      sliderTenure.addEventListener('input', (e) => {
        this.tenureMonths = Number(e.target.value);
        inputTenure.value = this.tenureMonths;
        this.calculate();
      });

      inputTenure.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (isNaN(val) || val < 3) val = 3;
        if (val > 240) val = 240;
        this.tenureMonths = val;
        sliderTenure.value = val;
        inputTenure.value = val;
        this.calculate();
      });
    }

    // Preset buttons
    document.querySelectorAll('.btn-emi-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amt = parseInt(e.target.dataset.amount, 10);
        const rate = parseFloat(e.target.dataset.rate);
        const tenure = parseInt(e.target.dataset.tenure, 10);

        if (amt) { this.amount = amt; if (sliderAmt) sliderAmt.value = amt; if (inputAmt) inputAmt.value = amt; }
        if (rate) { this.rate = rate; if (sliderRate) sliderRate.value = rate; if (inputRate) inputRate.value = rate; }
        if (tenure) { this.tenureMonths = tenure; if (sliderTenure) sliderTenure.value = tenure; if (inputTenure) inputTenure.value = tenure; }

        this.calculate();
      });
    });

    // CSV Export button
    const btnExport = document.getElementById('btn-export-amortization');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportToCSV());
    }
  }

  calculate() {
    const P = this.amount;
    const annualRate = this.rate;
    const n = this.tenureMonths;

    let emi = 0;
    if (annualRate <= 0) {
      emi = Math.round(P / n);
    } else {
      const r = (annualRate / 12) / 100;
      emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }

    const totalRepayment = emi * n;
    const totalInterest = Math.max(0, totalRepayment - P);
    const principalPct = Math.round((P / totalRepayment) * 100);
    const interestPct = 100 - principalPct;

    // Update DOM Display
    const elEmi = document.getElementById('calc-monthly-emi');
    if (elEmi) elEmi.textContent = formatINR(emi);

    const elTotalInt = document.getElementById('calc-total-interest');
    if (elTotalInt) elTotalInt.textContent = formatINR(totalInterest);

    const elTotalPay = document.getElementById('calc-total-payment');
    if (elTotalPay) elTotalPay.textContent = formatINR(totalRepayment);

    const elPrincPct = document.getElementById('calc-principal-pct');
    if (elPrincPct) elPrincPct.textContent = `${principalPct}%`;

    const elIntPct = document.getElementById('calc-interest-pct');
    if (elIntPct) elIntPct.textContent = `${interestPct}%`;

    // Visual Split Bar
    const barPrincipal = document.getElementById('bar-principal');
    const barInterest = document.getElementById('bar-interest');
    if (barPrincipal && barInterest) {
      barPrincipal.style.width = `${principalPct}%`;
      barInterest.style.width = `${interestPct}%`;
    }

    // Amortization Table Schedule
    this.schedule = this.generateAmortizationSchedule(P, annualRate, n, emi);
    this.renderScheduleTable(this.schedule);

    // Update Apply button link
    const btnApply = document.getElementById('btn-calc-apply');
    if (btnApply) {
      btnApply.href = `loan-application.html?amount=${P}&tenure=${n}&rate=${annualRate}`;
    }
  }

  generateAmortizationSchedule(principal, annualRate, tenureMonths, emi) {
    const r = (annualRate / 12) / 100;
    let balance = principal;
    const schedule = [];

    for (let m = 1; m <= tenureMonths; m++) {
      const interestPayment = Math.round(balance * r);
      let principalPayment = emi - interestPayment;

      if (m === tenureMonths || balance - principalPayment < 0) {
        principalPayment = balance;
        balance = 0;
      } else {
        balance -= principalPayment;
      }

      schedule.push({
        month: m,
        emi: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  renderScheduleTable(schedule) {
    const tbody = document.getElementById('amortization-tbody');
    if (!tbody) return;

    // Show first 12 months preview + summaries
    tbody.innerHTML = schedule.slice(0, 18).map(row => `
      <tr>
        <td class="font-bold text-navy">Month ${row.month}</td>
        <td class="font-bold text-teal">${formatINR(row.emi)}</td>
        <td class="font-medium text-navy">${formatINR(row.principal)}</td>
        <td class="font-medium text-amber">${formatINR(row.interest)}</td>
        <td class="font-bold text-muted">${formatINR(row.balance)}</td>
      </tr>
    `).join('');

    if (schedule.length > 18) {
      tbody.innerHTML += `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 1rem;">
            ... Remaining ${schedule.length - 18} installments follow the same reducing balance progression. Click "Export CSV" for complete breakdown.
          </td>
        </tr>
      `;
    }
  }

  exportToCSV() {
    if (!this.schedule || this.schedule.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,Month,EMI (INR),Principal Paid (INR),Interest Paid (INR),Remaining Balance (INR)\n";
    this.schedule.forEach(row => {
      csvContent += `${row.month},${row.emi},${row.principal},${row.interest},${row.balance}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tatito_Amortization_Schedule_${this.amount}_INR.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Amortization schedule exported to CSV!", "success");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('slider-amount')) {
    window.tatitoEmiCalc = new EmiCalculator();
  }
});
