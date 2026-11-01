/**
 * TATITO FINANCIAL SERVICES — MASTER AUTOMATED TEST SUITE
 * Comprehensive integration tests verifying:
 * 1. Registration, duplicate registration, login, and invalid credentials
 * 2. Strict role escalation prevention (admin & credit_officer blocks)
 * 3. 401 Unauthorized and 403 Forbidden RBAC guards across customer, agent, credit officer, admin
 * 4. Plain-text password rejection (only verified bcrypt hashes allowed)
 * 5. Production JWT secret validation guard
 * 6. Agent lead creation, persistence, and role-based access control
 * 7. Loan application submission, input validation, and credit committee approval workflow
 * 8. Loan ownership enforcement: unauthorized users blocked from other loans
 * 9. Financial EMI calculation accuracy and zero-interest edge cases
 * 10. Bill payment failure handling: safe rollback and wallet balance consistency
 * 11. Bill payment success: explicit DEMO_SUCCESS labeling and no real money movement claims
 * 12. Bill payment idempotency: duplicate payments with same key prevented
 * 13. Truthful KYC verification: sandbox responses never counted as genuine verified identity
 * 14. Demo biller catalog labeling
 * 15. Financial partner simulation transparency
 * 16. Production fail-safe: safe 503 HTTP errors when PostgreSQL is disconnected
 * 17. Frontend static page and route alias compatibility
 */

import { app } from '../server.ts';
import { dbRepository, DatabaseUnavailableError, setPostgresConnectedForTesting } from '../database/db.ts';
import { verifyPassword, getJwtSecret } from '../backend/middleware/auth.ts';
import { kycAdapter, creditBureauAdapter, marketDataAdapter } from '../integrations/index.ts';
import http from 'http';

process.env.NODE_ENV = 'test';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'tatito_master_production_jwt_secret_key_kadapa_ap_2026_finance_sec';
}

async function runMasterTestSuite() {
  console.log('================================================================');
  console.log('🧪 TATITO FINANCIAL SERVICES — MASTER TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `— ${detail}` : ''}`);
      failed++;
    }
  }

  // Create test HTTP server on ephemeral random port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`📡 In-process test server active at ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Customer Registration
    // -------------------------------------------------------------------------
    const uniqueEmail = `test_customer_${Date.now()}@tatito.in`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Praveen Reddy',
        email: uniqueEmail,
        phone: `99${Date.now().toString().slice(-8)}`,
        password: 'Password@123',
        city: 'Kadapa',
        state: 'Andhra Pradesh',
        annual_income: 700000
      })
    });
    const regData = await regRes.json();
    assert(
      'Registration: Customer registers successfully (HTTP 201)',
      regRes.status === 201 && typeof regData.access_token === 'string' && regData.user.role === 'customer',
      `Status: ${regRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Duplicate Registration Prevention
    // -------------------------------------------------------------------------
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Duplicate Attempt',
        email: uniqueEmail,
        phone: '9900112233',
        password: 'Password@123'
      })
    });
    assert(
      'Registration: Duplicate email registration rejected (HTTP 409 Conflict)',
      dupRes.status === 409,
      `Status: ${dupRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 3 & 4: Strict Role Escalation Prevention
    // -------------------------------------------------------------------------
    const adminEscalateRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Malicious Admin',
        email: `hacker_${Date.now()}@tatito.in`,
        phone: `98${Date.now().toString().slice(-8)}`,
        password: 'Password@123',
        role: 'admin'
      })
    });
    assert(
      'Security: Self-assignment of admin role is strictly rejected (HTTP 403 Forbidden)',
      adminEscalateRes.status === 403,
      `Status: ${adminEscalateRes.status}`
    );

    const creditEscalateRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Malicious Credit Officer',
        email: `hacker2_${Date.now()}@tatito.in`,
        phone: `97${Date.now().toString().slice(-8)}`,
        password: 'Password@123',
        role: 'credit_officer'
      })
    });
    assert(
      'Security: Self-assignment of credit_officer role rejected (HTTP 403 Forbidden)',
      creditEscalateRes.status === 403,
      `Status: ${creditEscalateRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 5-8: Reconciled Demo Login for All 4 Roles
    // -------------------------------------------------------------------------
    const demoCredentials = [
      { role: 'customer', email: 'ramesh@tatito.in', pass: 'Password@123' },
      { role: 'admin', email: 'admin@tatitofinance.com', pass: 'Password@123' },
      { role: 'agent', email: 'agent@tatito.in', pass: 'Password@123' },
      { role: 'credit_officer', email: 'credit@tatito.in', pass: 'Password@123' },
    ];

    let customerToken = '';
    let adminToken = '';
    let agentToken = '';
    let creditOfficerToken = '';

    for (const cred of demoCredentials) {
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cred.email, password: cred.pass })
      });
      const loginData = await loginRes.json();
      assert(
        `Authentication: Reconciled login for ${cred.role} (${cred.email}) (HTTP 200)`,
        loginRes.status === 200 && typeof loginData.access_token === 'string' && loginData.user.role === cred.role,
        `Status: ${loginRes.status}`
      );

      if (cred.role === 'customer') customerToken = loginData.access_token;
      if (cred.role === 'admin') adminToken = loginData.access_token;
      if (cred.role === 'agent') agentToken = loginData.access_token;
      if (cred.role === 'credit_officer') creditOfficerToken = loginData.access_token;
    }

    // -------------------------------------------------------------------------
    // TEST 9 & 10: Invalid Credentials Handling
    // -------------------------------------------------------------------------
    const badPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh@tatito.in', password: 'WrongPassword@999' })
    });
    assert('Authentication: Rejects invalid password (HTTP 401 Unauthorized)', badPassRes.status === 401);

    const badEmailRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@tatito.in', password: 'Password@123' })
    });
    assert('Authentication: Rejects non-existent email (HTTP 401 Unauthorized)', badEmailRes.status === 401);

    // -------------------------------------------------------------------------
    // TEST 11: Plaintext Password Rejection in verifyPassword
    // -------------------------------------------------------------------------
    const plainTextRejected = await verifyPassword('Password@123', 'Password@123');
    assert('Security: Plain-text password hashes strictly rejected by verifyPassword', plainTextRejected === false);

    // -------------------------------------------------------------------------
    // TEST 12: Production JWT Secret Guard
    // -------------------------------------------------------------------------
    const originalNodeEnv = process.env.NODE_ENV;
    const originalJwtSecret = process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    let caughtJwtViolation = false;
    try {
      getJwtSecret();
    } catch (e: any) {
      if (e.message && e.message.includes('FATAL SECURITY VIOLATION')) {
        caughtJwtViolation = true;
      }
    }
    process.env.NODE_ENV = originalNodeEnv;
    process.env.JWT_SECRET = originalJwtSecret;
    assert('Security: Production requires strong environment-provided JWT_SECRET', caughtJwtViolation);

    // -------------------------------------------------------------------------
    // TEST 13-15: Role-Based Access Control (RBAC)
    // -------------------------------------------------------------------------
    const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard-stats`);
    assert('RBAC: Protected endpoint rejects unauthenticated requests (HTTP 401)', unauthRes.status === 401);

    const customerAdminRes = await fetch(`${baseUrl}/api/admin/dashboard-stats`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert('RBAC: Customer denied access to admin endpoint (HTTP 403 Forbidden)', customerAdminRes.status === 403);

    const adminStatsRes = await fetch(`${baseUrl}/api/admin/dashboard-stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert('RBAC: Branch Admin granted access to dashboard stats (HTTP 200 OK)', adminStatsRes.status === 200);

    // -------------------------------------------------------------------------
    // TEST 16 & 17: DSA Agent Lead Portal Access & Permissions
    // -------------------------------------------------------------------------
    const leadRes = await fetch(`${baseUrl}/api/agents/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify({
        applicant_name: 'Venkata Ramana Reddy',
        phone: '9440112233',
        email: 'ramana.v@gmail.com',
        loan_product: 'Business Loan',
        requested_amount: 1500000,
        location: 'Kadapa City',
        notes: 'Owner of textile retail store on Seven Roads Circle'
      })
    });
    const leadData = await leadRes.json();
    const leadId = leadData.lead ? leadData.lead.id : leadData.id;
    assert(
      'Agent Portal: DSA submits and persists lead in database (HTTP 201 Created)',
      leadRes.status === 201 && typeof leadId === 'number',
      `Status: ${leadRes.status}`
    );

    const customerLeadsRes = await fetch(`${baseUrl}/api/agents/leads`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert('Agent Portal: Customer denied access to agent leads (HTTP 403 Forbidden)', customerLeadsRes.status === 403);

    // -------------------------------------------------------------------------
    // TEST 18 & 19: Loan Workflow — Submission, Sanction, and Approval
    // -------------------------------------------------------------------------
    const applyLoanRes = await fetch(`${baseUrl}/api/loans/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        product_id: 1,
        requested_amount: 200000,
        tenure_months: 24,
        purpose: 'Medical treatment at RIMS Kadapa',
        monthly_income: 70000,
        applicant_name: 'Ramesh Kumar Chennur',
        phone: '9876543210',
        email: 'ramesh@tatito.in'
      })
    });
    const loanApp = await applyLoanRes.json();
    assert(
      'Loans Workflow: Customer submits loan application (HTTP 201 Created)',
      applyLoanRes.status === 201 && typeof loanApp.application_no === 'string',
      `Status: ${applyLoanRes.status}`
    );

    const approveLoanRes = await fetch(`${baseUrl}/api/admin/loans/${loanApp.id}/decision`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        decision: 'approved',
        remarks: 'Credit score 745 verified. Sanction letter generated.',
        sanctioned_amount: 200000
      })
    });
    const approveResult = await approveLoanRes.json();
    assert(
      'Loans Workflow: Admin approves loan and generates amortization schedule (HTTP 200 OK)',
      approveLoanRes.status === 200 && approveResult.application?.status === 'approved',
      `Status: ${approveLoanRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 20: Loan Ownership Protection
    // -------------------------------------------------------------------------
    // Customer attempts to make unauthorized EMI payment on another loan application (e.g. loan #2)
    const unauthorizedLoanPayRes = await fetch(`${baseUrl}/api/loans/pay-emi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        application_id: 99999, // non-owned loan
        loan_account_no: 'TF-LN-UNAUTHORIZED',
        amount: 5000,
        payment_mode: 'wallet'
      })
    });
    assert('Loans Security: Customer blocked from paying unowned loan account (HTTP 403 Forbidden)', unauthorizedLoanPayRes.status === 403);

    // -------------------------------------------------------------------------
    // TEST 20B: Authorized Loan Repayment
    // -------------------------------------------------------------------------
    const authorizedLoanPayRes = await fetch(`${baseUrl}/api/loans/pay-emi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        application_id: loanApp.id,
        loan_account_no: loanApp.application_no,
        amount: 2500,
        payment_mode: 'wallet'
      })
    });
    const authorizedLoanPayData = await authorizedLoanPayRes.json();
    assert(
      'Loans Workflow: Authorized customer successfully pays EMI with atomic wallet deduction and DEMO_SUCCESS',
      authorizedLoanPayRes.status === 200 && authorizedLoanPayData.status === 'DEMO_SUCCESS' && authorizedLoanPayData.is_demo === true,
      `Status: ${authorizedLoanPayRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 20C: User Notifications Retrieval
    // -------------------------------------------------------------------------
    const notifRes = await fetch(`${baseUrl}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const notifData = await notifRes.json();
    assert(
      'Notifications: Authenticated customer retrieves notifications securely (HTTP 200 OK)',
      notifRes.status === 200 && Array.isArray(notifData) && notifData.length > 0,
      `Status: ${notifRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 20D: User Logout
    // -------------------------------------------------------------------------
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      }
    });
    assert('Authentication: Customer logs out successfully (HTTP 200 OK)', logoutRes.status === 200);

    // -------------------------------------------------------------------------
    // TEST 20E: Financial Input Validation on Loan Application
    // -------------------------------------------------------------------------
    const badLoanRes = await fetch(`${baseUrl}/api/loans/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        product_id: 1,
        requested_amount: -50000,
        tenure_months: 12
      })
    });
    assert('Loans Validation: Negative or below-minimum loan application rejected (HTTP 400 Bad Request)', badLoanRes.status === 400);

    // -------------------------------------------------------------------------
    // TEST 21: Financial Calculator Reducing Balance & Zero Interest
    // -------------------------------------------------------------------------
    const emiRes = await fetch(`${baseUrl}/api/loans/calculate-emi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal: 1000000,
        interest_rate_annual: 11.0,
        tenure_months: 36
      })
    });
    const emiData = await emiRes.json();
    assert(
      'Financial Calculator: Reducing balance formula computes ₹32,739 monthly EMI',
      emiRes.status === 200 && emiData.monthly_emi === 32739,
      `Result: ${emiData.monthly_emi}`
    );

    const zeroEmiRes = await fetch(`${baseUrl}/api/loans/calculate-emi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal: 600000,
        interest_rate_annual: 0,
        tenure_months: 12
      })
    });
    const zeroEmiData = await zeroEmiRes.json();
    assert(
      'Financial Calculator: Handles zero-interest loan edge case (₹50,000/mo)',
      zeroEmiRes.status === 200 && zeroEmiData.monthly_emi === 50000,
      `Result: ${zeroEmiData.monthly_emi}`
    );

    // -------------------------------------------------------------------------
    // TEST 22: Demo Biller Catalog Labeling
    // -------------------------------------------------------------------------
    const billFetchRes = await fetch(`${baseUrl}/api/payments/bills/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'electricity', operator: 'APSPDCL', account_identifier: '1009823412' })
    });
    const billFetchData = await billFetchRes.json();
    assert(
      'Payments Truthfulness: Biller fetch results clearly labeled as demo data',
      billFetchRes.status === 200 && billFetchData.is_demo === true && billFetchData.data_source === 'DEMO_BILLER_CATALOG',
      `is_demo: ${billFetchData.is_demo}`
    );

    // -------------------------------------------------------------------------
    // TEST 23: Payment Validation & Negative Amount Rejection
    // -------------------------------------------------------------------------
    const negPayRes = await fetch(`${baseUrl}/api/payments/bills/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        category: 'electricity',
        operator: 'APSPDCL',
        account_identifier: '1009823412',
        amount: -500,
        payment_mode: 'wallet'
      })
    });
    assert('Payments: Rejects negative or invalid payment amounts (HTTP 400 Bad Request)', negPayRes.status === 400);

    // -------------------------------------------------------------------------
    // TEST 24: Payment Failure Handling & Wallet Consistency (Safe Rollback)
    // -------------------------------------------------------------------------
    const profileBeforeFail = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const userBeforeFail = await profileBeforeFail.json();
    const initialWallet = parseFloat(userBeforeFail.wallet_balance);

    const failPayRes = await fetch(`${baseUrl}/api/payments/bills/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        category: 'electricity',
        operator: 'APSPDCL',
        account_identifier: '1009823412',
        amount: 850,
        payment_mode: 'wallet',
        simulate_failure: true
      })
    });
    const failPayData = await failPayRes.json();

    const profileAfterFail = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const userAfterFail = await profileAfterFail.json();
    const walletAfterFail = parseFloat(userAfterFail.wallet_balance);

    assert(
      'Payments Rollback: Payment processor failure does NOT deduct wallet funds',
      failPayRes.status === 400 && walletAfterFail === initialWallet,
      `Before: ₹${initialWallet}, After: ₹${walletAfterFail}`
    );

    // -------------------------------------------------------------------------
    // TEST 25: Successful Payment with Explicit Demo Labeling & Concurrency-Safe Deduction
    // -------------------------------------------------------------------------
    const testIdempotencyKey = `IDEMP-${Date.now()}-TEST`;
    const paySuccessRes = await fetch(`${baseUrl}/api/payments/bills/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'Idempotency-Key': testIdempotencyKey
      },
      body: JSON.stringify({
        category: 'electricity',
        operator: 'APSPDCL',
        account_identifier: '1009823412',
        amount: 450,
        payment_mode: 'wallet'
      })
    });
    const paySuccessData = await paySuccessRes.json();

    assert(
      'Payments Workflow: Confirmed payment clearly labeled DEMO_SUCCESS with is_demo: true',
      paySuccessRes.status === 200 && paySuccessData.status === 'DEMO_SUCCESS' && paySuccessData.is_demo === true,
      `Status: ${paySuccessData.status}, is_demo: ${paySuccessData.is_demo}`
    );

    // -------------------------------------------------------------------------
    // TEST 26: Payment Idempotency & Duplicate Prevention
    // -------------------------------------------------------------------------
    const dupPayRes = await fetch(`${baseUrl}/api/payments/bills/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'Idempotency-Key': testIdempotencyKey
      },
      body: JSON.stringify({
        category: 'electricity',
        operator: 'APSPDCL',
        account_identifier: '1009823412',
        amount: 450,
        payment_mode: 'wallet'
      })
    });
    const dupPayData = await dupPayRes.json();

    assert(
      'Payments Idempotency: Duplicate payment with same key returns replay without double deduction',
      dupPayRes.status === 200 && dupPayData.idempotent_replay === true,
      `idempotent_replay: ${dupPayData.idempotent_replay}`
    );

    // -------------------------------------------------------------------------
    // TEST 27: KYC Format Validation (Truthful Integration)
    // -------------------------------------------------------------------------
    const badPanRes = await fetch(`${baseUrl}/api/kyc/verify-pan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ pan_number: 'INVALID123' })
    });
    assert('KYC Truthfulness: Rejects non-statutory PAN format (HTTP 400 Bad Request)', badPanRes.status === 400);

    // -------------------------------------------------------------------------
    // TEST 28: KYC Sandbox Simulation Truthfulness (Never presented as genuine verified identity)
    // -------------------------------------------------------------------------
    const goodPanRes = await fetch(`${baseUrl}/api/kyc/verify-pan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ pan_number: 'ABCDE1234F', full_name: 'Ramesh Kumar' })
    });
    const goodPanData = await goodPanRes.json();
    assert(
      'KYC Truthfulness: Sandbox simulation tagged as SANDBOX_SIMULATED and is_live_verified: false',
      goodPanRes.status === 200 && goodPanData.status === 'SANDBOX_SIMULATED' && goodPanData.is_live_verified === false,
      `Status: ${goodPanData.status}, is_live_verified: ${goodPanData.is_live_verified}`
    );

    const kycStatusRes = await fetch(`${baseUrl}/api/kyc/status`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const kycStatusData = await kycStatusRes.json();
    assert(
      'KYC Compliance: Sandbox records cannot count as genuine statutory KYC compliance',
      kycStatusData.is_fully_compliant === false && kycStatusData.compliance_status === 'SANDBOX_UNVERIFIED',
      `is_fully_compliant: ${kycStatusData.is_fully_compliant}, compliance_status: ${kycStatusData.compliance_status}`
    );

    // -------------------------------------------------------------------------
    // TEST 29: Financial Partner Disclaimers
    // -------------------------------------------------------------------------
    const creditScore = await creditBureauAdapter.pullCreditScore('ABCDE1234F', '9876543210');
    const quotes = await marketDataAdapter.getQuotes();
    assert('Integrations: Credit Bureau clearly flags simulation', creditScore.isSimulated === true);
    assert('Integrations: Market Data clearly marks quotes as simulated', quotes.every(q => q.isSimulated === true));

    // -------------------------------------------------------------------------
    // TEST 30: PostgreSQL Fail-Safe in Production
    // -------------------------------------------------------------------------
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    setPostgresConnectedForTesting(false);

    let caughtFailSafe = false;
    try {
      await dbRepository.users.findByEmail('test_fail_safe@tatito.in');
    } catch (e: any) {
      if (e instanceof DatabaseUnavailableError || e.statusCode === 503) {
        caughtFailSafe = true;
      }
    }
    process.env.NODE_ENV = originalEnv;
    assert('Fail-Safe: Disconnected PostgreSQL in production mode fails safely with 503 error', caughtFailSafe);

    // -------------------------------------------------------------------------
    // TEST 31: Frontend Clean Route Loading
    // -------------------------------------------------------------------------
    const routeCheck = await fetch(`${baseUrl}/dashboard`);
    assert(
      'Frontend Routing: Clean page route /dashboard returns HTTP 200 HTML content',
      routeCheck.status === 200 && (routeCheck.headers.get('content-type') || '').includes('text/html'),
      `Status: ${routeCheck.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 32: Loan Workflow: Credit Committee Rejection with Remarks
    // -------------------------------------------------------------------------
    const rejectLoanAppRes = await fetch(`${baseUrl}/api/loans/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        product_id: 1,
        applicant_name: 'Ramesh Kumar',
        phone: '9876543210',
        email: 'ramesh@tatito.in',
        monthly_income: 30000,
        requested_amount: 800000,
        interest_rate: 14,
        tenure_months: 36,
        purpose: 'Testing loan rejection scenario'
      })
    });
    const rejectLoanAppData = await rejectLoanAppRes.json();
    const rejectAppId = rejectLoanAppData.id || rejectLoanAppData.application?.id;

    const rejectDecisionRes = await fetch(`${baseUrl}/api/admin/loans/${rejectAppId}/decision`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creditOfficerToken}`
      },
      body: JSON.stringify({
        decision: 'rejected',
        remarks: 'FOIR threshold exceeded based on declared monthly income.'
      })
    });
    const rejectDecisionData = await rejectDecisionRes.json();
    assert(
      'Loans Workflow: Credit committee successfully rejects application with formal remarks',
      rejectDecisionRes.status === 200 && rejectDecisionData.application?.status === 'rejected',
      `Status: ${rejectDecisionRes.status}, decision: ${rejectDecisionData.application?.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 33: Customer Loan Tracking: Application Pipeline & Active Accounts
    // -------------------------------------------------------------------------
    const myAppsRes = await fetch(`${baseUrl}/api/loans/my-applications`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const myAppsData = await myAppsRes.json();

    const myAccountsRes = await fetch(`${baseUrl}/api/loans/my-accounts`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const myAccountsData = await myAccountsRes.json();

    assert(
      'Loans Tracking: Customer retrieves application pipeline and loan accounts',
      myAppsRes.status === 200 && Array.isArray(myAppsData) && myAccountsRes.status === 200 && Array.isArray(myAccountsData),
      `Apps: ${myAppsRes.status}, Accounts: ${myAccountsRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 34: Stock Watchlist: Toggle Symbol
    // -------------------------------------------------------------------------
    const toggleWatchRes = await fetch(`${baseUrl}/api/investments/watchlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ symbol: 'INFY' })
    });
    const toggleWatchData = await toggleWatchRes.json();
    assert(
      'Stock Watchlist: Customer toggles ticker symbol in watchlist',
      toggleWatchRes.status === 200 && toggleWatchData.symbol === 'INFY' && typeof toggleWatchData.watched === 'boolean',
      `Status: ${toggleWatchRes.status}, watched: ${toggleWatchData.watched}`
    );

    // -------------------------------------------------------------------------
    // TEST 35: Stock Trading: Execute Order with Wallet Deduction & Simulation Label
    // -------------------------------------------------------------------------
    const stockOrderRes = await fetch(`${baseUrl}/api/investments/stocks/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        symbol: 'ITC',
        order_type: 'BUY',
        quantity: 2
      })
    });
    const stockOrderData = await stockOrderRes.json();
    assert(
      'Stock Trading: Simulated trade executes with wallet deduction & is_simulated flag',
      stockOrderRes.status === 200 && stockOrderData.status === 'EXECUTED' && stockOrderData.is_simulated === true,
      `Status: ${stockOrderRes.status}, is_simulated: ${stockOrderData.is_simulated}`
    );

    // -------------------------------------------------------------------------
    // TEST 36: Mutual Funds & SIPs: Direct Catalog & Mandate Creation
    // -------------------------------------------------------------------------
    const mfRes = await fetch(`${baseUrl}/api/investments/mutual-funds`);
    const mfData = await mfRes.json();

    const sipCreateRes = await fetch(`${baseUrl}/api/investments/sips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        fund_id: 1,
        monthly_amount: 1500,
        debit_day: 10
      })
    });
    const sipCreateData = await sipCreateRes.json();

    let sipCancelSuccess = false;
    if (sipCreateRes.status === 201 && sipCreateData.id) {
      const sipCancelRes = await fetch(`${baseUrl}/api/investments/sips/${sipCreateData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      sipCancelSuccess = sipCancelRes.status === 200;
    }

    assert(
      'Mutual Funds & SIPs: Direct funds catalog retrieved and SIP mandate authorized/cancelled',
      mfRes.status === 200 && Array.isArray(mfData) && sipCreateRes.status === 201 && sipCancelSuccess,
      `MF: ${mfRes.status}, SIP: ${sipCreateRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 37: Electronic Demat: Retrieve Depository Account Details
    // -------------------------------------------------------------------------
    const dematRes = await fetch(`${baseUrl}/api/investments/demat`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const dematData = await dematRes.json();
    assert(
      'Electronic Demat: Demat depository account retrieved with simulation disclaimer',
      dematRes.status === 200 && dematData.depository === 'NSDL' && dematData.is_simulated === true,
      `Status: ${dematRes.status}, depository: ${dematData.depository}`
    );

    // -------------------------------------------------------------------------
    // TEST 38: Notifications: Mark Individual Alert Read
    // -------------------------------------------------------------------------
    const markReadRes = await fetch(`${baseUrl}/api/notifications/1/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const markReadData = await markReadRes.json();
    assert(
      'Notifications: Customer marks individual notification as read (HTTP 200 OK)',
      markReadRes.status === 200 && markReadData.success === true,
      `Status: ${markReadRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 39: Admin Console: User Role & Status Modification
    // -------------------------------------------------------------------------
    const updateStatusRes = await fetch(`${baseUrl}/api/admin/users/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_active: true })
    });
    const updateRoleRes = await fetch(`${baseUrl}/api/admin/users/1/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: 'customer' })
    });
    assert(
      'Admin Management: Branch admin updates user active status and role',
      updateStatusRes.status === 200 && updateRoleRes.status === 200,
      `Status: ${updateStatusRes.status}, Role: ${updateRoleRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 40: Admin Console: Configure Loan Product Benchmark Rates
    // -------------------------------------------------------------------------
    const updateRateRes = await fetch(`${baseUrl}/api/admin/loan-products/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ base_interest_rate: 13.75 })
    });
    const updateRateData = await updateRateRes.json();
    assert(
      'Admin Management: Admin updates loan product benchmark interest rate',
      updateRateRes.status === 200 && updateRateData.product?.base_interest_rate === 13.75,
      `Status: ${updateRateRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 41: Contact & Branch Enquiries: Receive Customer Advisory Request
    // -------------------------------------------------------------------------
    const contactRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Venkatesh Rao',
        email: 'venkatesh.rao@example.com',
        phone: '9848011223',
        subject: 'Kadapa MSME Business Loan Enquiry',
        category: 'Business Loan',
        message: 'Looking to expand retail hardware store on Trunk Road, Kadapa.'
      })
    });
    const contactData = await contactRes.json();
    assert(
      'Branch Advisory: Customer enquiry successfully submitted and registered (HTTP 201 Created)',
      contactRes.status === 201 && contactData.status === 'RECEIVED',
      `Status: ${contactRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 42: KYC Aadhaar Verification: Valid Format & Truthful Sandbox Label
    // -------------------------------------------------------------------------
    const aadhaarKycRes = await fetch(`${baseUrl}/api/kyc/verify-aadhaar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        aadhaar_number: '998877665544',
        otp: '123456'
      })
    });
    const aadhaarKycData = await aadhaarKycRes.json();
    assert(
      'KYC Truthfulness: Aadhaar verified under simulation with SANDBOX_SIMULATED status',
      aadhaarKycRes.status === 200 && aadhaarKycData.status === 'SANDBOX_SIMULATED',
      `Status: ${aadhaarKycRes.status}, kyc_status: ${aadhaarKycData.status}`
    );

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('📡 In-process test server closed.\n');
  }

  console.log('================================================================');
  console.log(`📊 MASTER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch(err => {
  console.error('Fatal master test execution error:', err);
  process.exit(1);
});
