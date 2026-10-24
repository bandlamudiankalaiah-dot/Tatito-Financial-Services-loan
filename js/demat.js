/**
 * Tatito Financial Services — Demat Account Module Controller (demat.js)
 * Manages Demat overview, onboarding checklist, and depository verification disclosures.
 */

function initDematPage() {
  const demat = window.TatitoStorage.getDematAccount();
  const user = window.TatitoStorage.getCurrentUser();

  const codeEl = document.getElementById('demat-client-code');
  if (codeEl) codeEl.textContent = demat.clientCode;

  const dpIdEl = document.getElementById('demat-dp-id');
  if (dpIdEl) dpIdEl.textContent = demat.dpId;

  const holderEl = document.getElementById('demat-holder-name');
  if (holderEl) holderEl.textContent = user.name;

  const bankEl = document.getElementById('demat-linked-bank');
  if (bankEl) bankEl.textContent = user.bankAccount || demat.linkedBank;

  const statusEl = document.getElementById('demat-status-badge');
  if (statusEl) {
    statusEl.textContent = demat.status.toUpperCase();
    statusEl.className = demat.status === 'active' ? 'badge badge-emerald' : 'badge badge-amber';
  }

  // Bind simulate activation button
  const btnActivate = document.getElementById('btn-simulate-demat-upgrade');
  if (btnActivate) {
    btnActivate.addEventListener('click', () => {
      showToast('Demat F&O & Commodities segment activation requested! Verified by branch.', 'success');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('demat-client-code')) {
    initDematPage();
  }
});
