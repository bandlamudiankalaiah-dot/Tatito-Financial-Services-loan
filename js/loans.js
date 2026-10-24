/**
 * Tatito Financial Services — Loans & Multi-Step Application Controller (loans.js)
 * Manages loan catalog display and the 5-step loan application wizard.
 */

// --- Render Loan Catalog on loans.html ---
function renderLoanCatalog() {
  const container = document.getElementById('loans-catalog-grid');
  if (!container) return;

  const products = window.TatitoStorage.getLoanProducts();

  container.innerHTML = products.map(prod => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <h3 class="font-extrabold text-navy" style="font-size: 1.15rem;">${prod.name}</h3>
            <span class="text-xs text-muted">${prod.tagline}</span>
          </div>
          <span class="badge badge-teal">${prod.id.toUpperCase()}</span>
        </div>

        <div style="background: #F8FAFC; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.8125rem;">
            <span class="text-muted">Illustrative Rate:</span>
            <strong class="text-teal">From ${prod.minRate}% p.a.</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.8125rem;">
            <span class="text-muted">Maximum Limit:</span>
            <strong class="text-navy">${formatINR(prod.maxAmount)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8125rem;">
            <span class="text-muted">Tenure:</span>
            <strong class="text-navy">Up to ${prod.maxTenureMonths} Months (${(prod.maxTenureMonths/12).toFixed(0)} Yrs)</strong>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div class="text-xs font-bold text-navy" style="text-transform: uppercase; margin-bottom: 0.4rem;">Eligibility & Highlights</div>
          <p class="text-xs text-muted" style="margin-bottom: 0.5rem;">${prod.eligibility}</p>
          <ul style="font-size: 0.75rem; color: #475569; display: flex; flex-direction: column; gap: 0.25rem;">
            ${prod.features.map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        <a href="emi-calculator.html?type=${prod.id}&rate=${prod.minRate}" class="btn btn-outline btn-sm" style="flex: 1;">
          Calculate EMI
        </a>
        <a href="loan-application.html?type=${prod.id}" class="btn btn-primary btn-sm" style="flex: 1;">
          Apply Now →
        </a>
      </div>
    </div>
  `).join('');
}

// --- 5-Step Loan Application Wizard (loan-application.html) ---
class LoanApplicationWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.formData = {
      loanType: 'personal',
      loanName: 'Personal Loan',
      requestedAmount: 300000,
      tenureMonths: 24,
      interestRate: 14.0,
      applicantName: '',
      phone: '',
      email: '',
      city: 'Kadapa',
      employmentType: 'Salaried',
      monthlyIncome: 65000,
      employerName: '',
      securityType: 'unsecured',
      collateralDetails: '',
      guarantorName: '',
      purpose: ''
    };

    this.init();
  }

  init() {
    // Check URL parameters for prefilled loan type
    const params = new URLSearchParams(window.location.search);
    const prefillType = params.get('type');
    const prefillAmt = params.get('amount');
    const prefillTenure = params.get('tenure');

    const products = window.TatitoStorage.getLoanProducts();
    if (prefillType) {
      const match = products.find(p => p.id === prefillType);
      if (match) {
        this.formData.loanType = match.id;
        this.formData.loanName = match.name;
        this.formData.interestRate = match.minRate;
      }
    }
    if (prefillAmt) this.formData.requestedAmount = parseInt(prefillAmt, 10);
    if (prefillTenure) this.formData.tenureMonths = parseInt(prefillTenure, 10);

    // Prefill with current logged in user details
    const user = window.TatitoStorage.getCurrentUser();
    if (user) {
      this.formData.applicantName = user.name;
      this.formData.phone = user.phone;
      this.formData.email = user.email;
      this.formData.city = user.city || 'Kadapa';
    }

    this.bindEvents();
    this.renderStep();
  }

  bindEvents() {
    // Step navigation buttons
    const btnNext = document.getElementById('wizard-btn-next');
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnSubmit = document.getElementById('wizard-btn-submit');

    if (btnNext) btnNext.addEventListener('click', () => this.nextStep());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevStep());
    if (btnSubmit) btnSubmit.addEventListener('click', () => this.submitApplication());

    // Step 1: Loan Type Select change
    const selectType = document.getElementById('input-loan-type');
    if (selectType) {
      selectType.value = this.formData.loanType;
      selectType.addEventListener('change', (e) => {
        const prod = window.TatitoStorage.getLoanProducts().find(p => p.id === e.target.value);
        if (prod) {
          this.formData.loanType = prod.id;
          this.formData.loanName = prod.name;
          this.formData.interestRate = prod.minRate;
          this.updateLimitsInfo(prod);
        }
      });
    }

    // Step 4: Security Type Radio Toggle
    document.querySelectorAll('input[name="security_type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.formData.securityType = e.target.value;
        const collateralWrap = document.getElementById('collateral-details-wrap');
        if (collateralWrap) {
          collateralWrap.style.display = e.target.value === 'secured' ? 'block' : 'none';
        }
      });
    });
  }

  updateLimitsInfo(prod) {
    const infoEl = document.getElementById('loan-limits-hint');
    if (infoEl) {
      infoEl.textContent = `Ceiling: ${formatINR(prod.maxAmount)} • Illustrative Rate: From ${prod.minRate}% p.a. • Max Tenure: ${prod.maxTenureMonths} Mo`;
    }
  }

  renderStep() {
    // Hide all step sections
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`wizard-step-${i}`);
      const indicatorEl = document.getElementById(`step-indicator-${i}`);
      if (stepEl) stepEl.style.display = (i === this.currentStep) ? 'block' : 'none';
      if (indicatorEl) {
        if (i < this.currentStep) {
          indicatorEl.className = 'step-badge completed';
        } else if (i === this.currentStep) {
          indicatorEl.className = 'step-badge active';
        } else {
          indicatorEl.className = 'step-badge';
        }
      }
    }

    // Button states
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnNext = document.getElementById('wizard-btn-next');
    const btnSubmit = document.getElementById('wizard-btn-submit');

    if (btnPrev) btnPrev.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
    if (btnNext) btnNext.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-flex';
    if (btnSubmit) btnSubmit.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';

    // Step 5 Review Render
    if (this.currentStep === 5) {
      this.renderReviewSummary();
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.renderStep();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  validateCurrentStep() {
    const errorEl = document.getElementById('wizard-error-msg');
    if (errorEl) errorEl.style.display = 'none';

    const prod = window.TatitoStorage.getLoanProducts().find(p => p.id === this.formData.loanType);

    if (this.currentStep === 1) {
      const amt = parseInt(document.getElementById('input-loan-amount').value, 10);
      const tenure = parseInt(document.getElementById('input-loan-tenure').value, 10);

      if (isNaN(amt) || amt < prod.minAmount) {
        this.showError(`Minimum loan amount for ${prod.name} is ${formatINR(prod.minAmount)}`);
        return false;
      }
      if (amt > prod.maxAmount) {
        this.showError(`Requested amount ${formatINR(amt)} exceeds ceiling limit of ${formatINR(prod.maxAmount)} for ${prod.name}`);
        return false;
      }
      if (isNaN(tenure) || tenure < prod.minTenureMonths || tenure > prod.maxTenureMonths) {
        this.showError(`Tenure must be between ${prod.minTenureMonths} and ${prod.maxTenureMonths} months`);
        return false;
      }

      this.formData.requestedAmount = amt;
      this.formData.tenureMonths = tenure;
      this.formData.purpose = document.getElementById('input-loan-purpose').value.trim() || 'General Purpose';
    }

    if (this.currentStep === 2) {
      const name = document.getElementById('input-applicant-name').value.trim();
      const phone = document.getElementById('input-applicant-phone').value.trim();
      const email = document.getElementById('input-applicant-email').value.trim();

      if (!name) { this.showError('Please enter applicant full name'); return false; }
      if (!phone || phone.length < 10) { this.showError('Please enter a valid 10-digit mobile number'); return false; }
      if (!email || !email.includes('@')) { this.showError('Please enter a valid email address'); return false; }

      this.formData.applicantName = name;
      this.formData.phone = phone;
      this.formData.email = email;
      this.formData.city = document.getElementById('input-applicant-city').value.trim() || 'Kadapa';
    }

    if (this.currentStep === 3) {
      const income = parseInt(document.getElementById('input-applicant-income').value, 10);
      if (isNaN(income) || income < 15000) {
        this.showError('Monthly income must be at least ₹15,000 for eligibility');
        return false;
      }
      this.formData.employmentType = document.getElementById('input-employment-type').value;
      this.formData.monthlyIncome = income;
      this.formData.employerName = document.getElementById('input-employer-name').value.trim() || 'Self / Local Business';
    }

    if (this.currentStep === 4) {
      this.formData.collateralDetails = document.getElementById('input-collateral-details')?.value.trim() || 'Not specified';
      this.formData.guarantorName = document.getElementById('input-guarantor-name')?.value.trim() || 'None';
    }

    return true;
  }

  showError(msg) {
    const errorEl = document.getElementById('wizard-error-msg');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      alert(msg);
    }
  }

  renderReviewSummary() {
    const container = document.getElementById('wizard-review-summary');
    if (!container) return;

    // Calculate estimated EMI
    const r = (this.formData.interestRate / 12) / 100;
    const n = this.formData.tenureMonths;
    const p = this.formData.requestedAmount;
    const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalOutgo = emi * n;
    const totalInterest = totalOutgo - p;

    container.innerHTML = `
      <div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
        <h4 class="font-extrabold text-navy" style="margin-bottom: 1rem;">Application Parameter Summary</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.8125rem;">
          <div><span class="text-muted">Loan Product:</span><br><strong class="text-navy">${this.formData.loanName}</strong></div>
          <div><span class="text-muted">Requested Amount:</span><br><strong class="text-teal" style="font-size: 1.1rem;">${formatINR(this.formData.requestedAmount)}</strong></div>
          <div><span class="text-muted">Tenure:</span><br><strong class="text-navy">${this.formData.tenureMonths} Months (${(this.formData.tenureMonths/12).toFixed(1)} Yrs)</strong></div>
          <div><span class="text-muted">Illustrative Rate:</span><br><strong class="text-navy">${this.formData.interestRate}% p.a.</strong></div>
          <div><span class="text-muted">Estimated Monthly EMI:</span><br><strong class="text-teal">${formatINR(emi)}</strong></div>
          <div><span class="text-muted">Total Interest:</span><br><strong class="text-amber">${formatINR(totalInterest)}</strong></div>
        </div>
      </div>

      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem; font-size: 0.8125rem;">
        <h4 class="font-extrabold text-navy" style="margin-bottom: 0.75rem;">Applicant & Security Profile</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
          <div><span class="text-muted">Applicant:</span> <strong>${this.formData.applicantName}</strong></div>
          <div><span class="text-muted">Mobile:</span> <strong>${this.formData.phone}</strong></div>
          <div><span class="text-muted">Monthly Income:</span> <strong>${formatINR(this.formData.monthlyIncome)}</strong> (${this.formData.employmentType})</div>
          <div><span class="text-muted">Security Mode:</span> <strong style="text-transform: capitalize;">${this.formData.securityType}</strong></div>
          <div><span class="text-muted">Purpose:</span> <strong>${this.formData.purpose}</strong></div>
        </div>
      </div>
    `;
  }

  submitApplication() {
    const agreeCheck = document.getElementById('checkbox-demo-disclaimer');
    if (agreeCheck && !agreeCheck.checked) {
      alert('Please check the box confirming you acknowledge this is an illustrative demo application.');
      return;
    }

    try {
      const app = window.TatitoStorage.submitApplication(this.formData);

      // Show success screen
      document.getElementById('wizard-form-body').style.display = 'none';
      document.getElementById('wizard-footer-actions').style.display = 'none';
      
      const successBox = document.getElementById('wizard-success-box');
      if (successBox) {
        successBox.style.display = 'block';
        document.getElementById('success-app-no').textContent = app.applicationNo;
        document.getElementById('success-app-amount').textContent = formatINR(app.requestedAmount);
        document.getElementById('success-app-type').textContent = app.loanName;
      }

      showToast(`Application #${app.applicationNo} created!`, 'success');
    } catch (e) {
      alert(e.message);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderLoanCatalog();
  if (document.getElementById('wizard-form-body')) {
    new LoanApplicationWizard();
  }
});
