import datetime
from sqlalchemy.orm import Session
from .models import (
    User, 
    BlogPost, 
    LoanAccount, 
    LoanApplication, 
    Transaction, 
    Notification,
    InvestmentPortfolio,
    InvestmentRecord,
    ContactEnquiry
)
from .auth_utils import get_password_hash

def seed_database(db: Session):
    """Populates initial demo data for Tatito Financial Services (Kadapa, AP)."""
    # 1. Seed Admin User
    admin_user = db.query(User).filter(User.email == "admin@tatitofinance.com").first()
    if not admin_user:
        admin_user = User(
            full_name="Ankalaiah Bandlamudi (Admin)",
            email="admin@tatitofinance.com",
            phone="9440123456",
            hashed_password=get_password_hash("Admin@123"),
            role="admin",
            city="Kadapa",
            state="Andhra Pradesh",
            annual_income=1800000.0,
            wallet_balance=150000.0
        )
        db.add(admin_user)

    # 2. Seed Customer (Ramesh Kumar)
    demo_user = db.query(User).filter(User.email == "ramesh@tatito.in").first()
    if not demo_user:
        demo_user = User(
            full_name="Ramesh Kumar Chennur",
            email="ramesh@tatito.in",
            phone="9876543210",
            hashed_password=get_password_hash("User@123"),
            role="user",
            city="Kadapa",
            state="Andhra Pradesh",
            annual_income=850000.0,
            wallet_balance=24850.0
        )
        db.add(demo_user)
        db.flush()

        # Seed Active Loans for Ramesh
        l1 = LoanAccount(
            loan_account_no="TF-GL-2025-0814",
            user_id=demo_user.id,
            loan_type="gold",
            principal_amount=250000.0,
            interest_rate=11.0,
            tenure_months=12,
            monthly_emi=22100.0,
            emis_paid=4,
            total_emis=12,
            next_emi_date=datetime.datetime.utcnow() + datetime.timedelta(days=6),
            outstanding_balance=168000.0,
            status="active"
        )
        l2 = LoanAccount(
            loan_account_no="TF-PL-2025-1102",
            user_id=demo_user.id,
            loan_type="personal",
            principal_amount=400000.0,
            interest_rate=14.0,
            tenure_months=24,
            monthly_emi=19205.0,
            emis_paid=8,
            total_emis=24,
            next_emi_date=datetime.datetime.utcnow() + datetime.timedelta(days=14),
            outstanding_balance=274000.0,
            status="active"
        )
        db.add_all([l1, l2])

        # Seed Sample Applications
        app1 = LoanApplication(
            application_no="TF-LN-2026-9481",
            user_id=demo_user.id,
            loan_type="business",
            applicant_name="Ramesh Kumar Chennur",
            phone="9876543210",
            email="ramesh@tatito.in",
            pan_card="ABCDE1234F",
            aadhaar_last4="8821",
            monthly_income=85000.0,
            requested_amount=1500000.0,
            interest_rate=16.0,
            tenure_months=36,
            purpose="Expanding textile store inventory in Trunk Road, Kadapa",
            status="pending",
            admin_remarks="Physical business verification scheduled with Kadapa field executive."
        )
        app2 = LoanApplication(
            application_no="TF-LN-2026-8910",
            user_id=demo_user.id,
            loan_type="home",
            applicant_name="Srinivasa Rao Giddalur",
            phone="9440811223",
            email="srinivas.g@gmail.com",
            pan_card="BGHYK9821L",
            aadhaar_last4="4190",
            monthly_income=120000.0,
            requested_amount=4500000.0,
            interest_rate=9.0,
            tenure_months=180,
            purpose="Construction of residential home in Nagarajupalle, Kadapa",
            status="under_review",
            admin_remarks="Awaiting municipal land approval documents."
        )
        db.add_all([app1, app2])

        # Seed Investment Records for Ramesh (Simulated Portfolio)
        inv1 = InvestmentRecord(
            user_id=demo_user.id,
            asset_symbol="NIFTY_50",
            asset_name="UTI Nifty 50 Index Fund",
            category="mutual_fund",
            units=124.50,
            buy_price=1200.0,
            current_price=1380.0,
            invested_amount=149400.0,
            current_amount=171810.0,
            is_sip=True,
            sip_frequency="monthly",
            status="active"
        )
        inv2 = InvestmentRecord(
            user_id=demo_user.id,
            asset_symbol="GOLDBEES",
            asset_name="Nippon India Gold ETF (24K)",
            category="gold",
            units=1500.0,
            buy_price=60.0,
            current_price=68.45,
            invested_amount=90000.0,
            current_amount=102675.0,
            is_sip=False,
            sip_frequency="one-time",
            status="active"
        )
        inv3 = InvestmentRecord(
            user_id=demo_user.id,
            asset_symbol="TCS",
            asset_name="Tata Consultancy Services Ltd",
            category="equity",
            units=25.0,
            buy_price=3800.0,
            current_price=4120.75,
            invested_amount=95000.0,
            current_amount=103018.75,
            is_sip=False,
            sip_frequency="one-time",
            status="active"
        )
        inv4 = InvestmentRecord(
            user_id=demo_user.id,
            asset_symbol="GOI_718_2033",
            asset_name="7.18% GS 2033 Sovereign Bond",
            category="bond",
            units=500.0,
            buy_price=100.0,
            current_price=101.40,
            invested_amount=50000.0,
            current_amount=50700.0,
            is_sip=False,
            sip_frequency="one-time",
            status="active"
        )
        db.add_all([inv1, inv2, inv3, inv4])

        # Seed Investment Portfolio summary
        port = InvestmentPortfolio(
            user_id=demo_user.id,
            total_invested=384400.0,
            current_value=428203.75,
            total_returns=43803.75,
            returns_percentage=11.39,
            day_gain=2783.32,
            day_gain_percentage=0.65
        )
        db.add(port)

        # Seed Sample Contact Enquiries
        c1 = ContactEnquiry(
            user_id=demo_user.id,
            full_name="Ramesh Kumar Chennur",
            email="ramesh@tatito.in",
            phone="9876543210",
            subject="Gold Loan Part-Prepayment Process",
            category="Loan Enquiry (Gold / Home / Business / Personal)",
            message="I want to know if there are any charges for part-prepaying ₹50,000 on my Gold Loan #TF-GL-2025-0814 at Kadapa branch.",
            status="in_progress",
            admin_notes="Customer advised that Tatito offers zero foreclosure & zero part-prepayment fees on Gold loans."
        )
        c2 = ContactEnquiry(
            user_id=None,
            full_name="Venkata Subba Reddy",
            email="subbareddy.v@gmail.com",
            phone="9440552233",
            subject="Business Loan for Agriculture Cold Storage",
            category="Loan Enquiry (Gold / Home / Business / Personal)",
            message="Looking for a ₹35 Lakhs business loan for cold storage setup near Kadapa industrial zone. Please call back.",
            status="new"
        )
        db.add_all([c1, c2])

        # Seed Sample Transactions
        t1 = Transaction(
            reference_id="TT-TXN-20261010-4102",
            bbps_ref_no="BBPS9081245102",
            user_id=demo_user.id,
            category="electricity",
            operator="APSPDCL - Andhra Pradesh Southern Power",
            account_identifier="10098234120",
            customer_name="Ramesh Kumar Chennur",
            amount=1420.0,
            payment_mode="wallet",
            status="SUCCESS",
            meta_info={"circle": "Kadapa Rural", "bill_month": "September 2026"}
        )
        t2 = Transaction(
            reference_id="TT-TXN-20261005-7821",
            bbps_ref_no="BBPS8192731045",
            user_id=demo_user.id,
            category="mobile",
            operator="Jio Prepaid",
            account_identifier="9876543210",
            customer_name="Ramesh Kumar",
            amount=349.0,
            payment_mode="upi",
            status="SUCCESS",
            meta_info={"plan": "2GB/Day + Unlimited Calls (28 Days)"}
        )
        db.add_all([t1, t2])

        # Seed Notifications
        n1 = Notification(
            user_id=demo_user.id,
            title="Gold Loan EMI Due in 6 Days",
            message="Your monthly EMI of ₹22,100 for Gold Loan #TF-GL-2025-0814 is due on next Monday.",
            type="alert",
            is_read=False
        )
        n2 = Notification(
            user_id=demo_user.id,
            title="APSPDCL Bill Payment Confirmed",
            message="Electricity bill payment of ₹1,420 was acknowledged by APSPDCL. Ref: BBPS9081245102",
            type="success",
            is_read=True
        )
        db.add_all([n1, n2])

    # 3. Seed Financial Literacy Blogs
    blogs_count = db.query(BlogPost).count()
    if blogs_count == 0:
        b1 = BlogPost(
            title="How Loan EMIs Work: Reducing Balance vs Flat Interest Rate",
            slug="how-loan-emis-work-reducing-balance-vs-flat-rate",
            category="Loans & EMI",
            summary="Before taking a personal or business loan, understand why a 14% reducing balance EMI is vastly cheaper than a 10% flat interest rate.",
            content="""When you borrow money from any bank or NBFC in India, interest can be calculated in two very distinct ways:

### 1. Flat Interest Rate (The Hidden Cost)
In a flat interest system, the interest is calculated on the entire original principal amount for the full tenure, regardless of how much principal you have already paid off through previous EMIs.
For example, on a ₹5,00,000 loan for 3 years at 10% flat, you pay interest on ₹5,00,000 every single year, resulting in total interest of ₹1,50,000.

### 2. Reducing Balance Rate (The Transparent Standard at Tatito)
In a reducing balance method, interest is calculated solely on the outstanding principal balance each month. As each EMI reduces your loan balance, the interest component decreases and the principal repayment component accelerates.
At Tatito Financial Services, all personal loans (from 14% p.a.), gold loans (from 11% p.a.), and home loans (from 9% p.a.) use the standard RBI-approved reducing balance formula.

### Summary Checklist Before Signing
- Always ask for the 'Annualized Percentage Rate' (APR).
- Check foreclosure and part-prepayment charges (Tatito offers zero foreclosure penalty on select gold loans).
- Use our interactive EMI calculator on the portal to examine the month-by-month amortisation schedule.""",
            author="Naveen Reddy, Chief Credit Officer",
            read_time="5 min read",
            cover_image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80"
        )

        b2 = BlogPost(
            title="5 Smart Ways to Start a Systematic Investment Plan (SIP) with Just ₹500",
            slug="5-ways-to-start-a-sip-with-500",
            category="Wealth & Savings",
            summary="You don't need lakhs of rupees to invest in Indian capital markets. Here is how compounding ₹500 monthly builds substantial wealth over 15 years.",
            content="""Many people in Rayalaseema believe investing is only for high net-worth individuals. In reality, modern mutual fund SIPs allow disciplined wealth accumulation starting at just ₹500 a month.

### 1. The Power of Rupee Cost Averaging
When markets dip, your ₹500 buys more mutual fund units. When markets surge, your accumulated units grow in value. You never have to time the stock market.

### 2. The Eighth Wonder: Compounding
Investing ₹500 per month at an expected return of 12% p.a.:
- In 5 Years: Invested ₹30,00,000 → Value ≈ ₹41,200
- In 10 Years: Invested ₹60,000 → Value ≈ ₹1,16,000
- In 15 Years: Invested ₹90,000 → Value ≈ ₹2,52,000

### 3. Step-Up SIP (10% Annual Increase)
Increase your SIP amount by ₹100 or 10% whenever you receive an annual bonus or salary hike to supercharge returns.

### 4. Direct Plans over Regular Plans
Direct mutual fund schemes save 0.5% to 1.5% in distributor commissions each year, compounding into substantial savings over decades.

### 5. Automate on Salary Day
Set your SIP auto-debit on the 5th of each month, right after salary or agricultural sale proceeds hit your bank account.""",
            author="Priyanka S., Senior Wealth Advisor",
            read_time="4 min read",
            cover_image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80"
        )
        db.add_all([b1, b2])

    db.commit()
