import datetime
from sqlalchemy.orm import Session
from .models import User, BlogPost, LoanAccount, LoanApplication, Transaction, Notification
from .auth_utils import get_password_hash

def seed_database(db: Session):
    """Populates initial demo data for Tatito Financial Services (Kadapa, AP)."""
    # 1. Seed Users if not existing
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
            wallet_balance=150000.0
        )
        db.add(admin_user)

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

        # Seed Sample Application
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
            status="under_review",
            admin_remarks="Physical business verification scheduled with Kadapa field executive."
        )
        db.add(app1)

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

    # 2. Seed Financial Literacy Blogs
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
- In 5 Years: Invested ₹30,000 → Value ≈ ₹41,200
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

        b3 = BlogPost(
            title="Why Gold Loans in Andhra Pradesh Offer the Lowest Interest & Fastest Liquidity",
            slug="gold-loans-in-andhra-pradesh-liquidity-guide",
            category="Gold Loan",
            summary="How Kadapa businesses and agricultural households leverage idle household gold ornaments for low 11% p.a. capital with same-day cash disbursal.",
            content="""Gold jewellery has historically been one of India's most cherished assets. In Andhra Pradesh, gold loans serve as the backbone of emergency and seasonal working capital.

### Why Choose a Gold Loan over an Unsecured Personal Loan?
1. **Lower Interest Rates**: Unsecured loans start at 14%–20%, while secured gold loans at Tatito Financial Services start from just 11% p.a.
2. **High Loan-To-Value (LTV)**: Up to 75% of current market gold value based on certified 22K/24K purity appraisal.
3. **No Heavy Income Verification**: Since physical gold is deposited in bank-grade high-security vaults, CIBIL score requirements are more flexible.
4. **Flexible Repayments**: Choose between regular monthly EMIs or bullet repayment (interest monthly, principal at end of tenure).
5. **Full Insurance & Safe Vaulting**: Your ornaments are 100% insured against fire, theft, and damage in Kadapa branch vaults.""",
            author="S. Ramanjaneyulu, Branch Head Kadapa",
            read_time="6 min read",
            cover_image="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80"
        )

        b4 = BlogPost(
            title="CIBIL Score Decoded: How Utility Bill Payments Help Build a 750+ Credit Score",
            slug="cibil-score-utility-bill-payments-credit-guide",
            category="Credit & CIBIL",
            summary="Timely electricity, broadband, and credit card payments via BBPS create a transparent digital repayment record that unlocks top-tier loan rates.",
            content="""A credit score ranging between 300 and 900 acts as your financial passport in India. A score above 750 qualifies you for instant pre-approved loans with the lowest interest margins.

### How Utility Payments Impact Credit
With modern account aggregators and Bharat BillPay (BBPS) integration, regular and timely payments for APSPDCL power, Airtel broadband, and post-paid connections demonstrate fiscal discipline.

### Golden Rules to Maintain 750+ CIBIL
- Pay 100% of Credit Card Total Due, not just the minimum amount.
- Maintain credit utilisation below 30% of your sanctioned limit.
- Never delay your monthly loan EMIs even by a single day; set auto-debit reminders on Tatito Pay.""",
            author="K. Sumalatha, Credit Underwriter",
            read_time="4 min read",
            cover_image="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"
        )

        b5 = BlogPost(
            title="Home Loan Tax Benefits: Maximizing Deductions under Section 80C & Section 24(b)",
            slug="home-loan-tax-benefits-80c-24b",
            category="Home Loan",
            summary="Learn how buying a residential property in Andhra Pradesh allows up to ₹3.5 Lakhs in annual income tax deductions for salaried and self-employed borrowers.",
            content="""Home loans from Tatito Financial Services (from 9% p.a. up to ₹1,00,00,000) not only help you build your dream home in Kadapa or Tirupati, but also offer tax relief under the Income Tax Act.

### 1. Section 24(b) - Interest Deduction
You can claim a deduction of up to ₹2,00,000 per financial year against the interest paid on a loan for a self-occupied property.

### 2. Section 80C - Principal Repayment
The principal component of your home loan EMI is eligible for deduction up to ₹1,50,000 within the overall 80C ceiling, along with stamp duty and registration fees.

### Joint Home Loan Advantage
If you take a home loan jointly with your spouse, both co-borrowers can claim separate deductions, doubling total household tax exemptions to up to ₹7,00,000 per annum!""",
            author="V. Rajesh, Chartered Accountant & Tax Consultant",
            read_time="7 min read",
            cover_image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
        )

        db.add_all([b1, b2, b3, b4, b5])

    db.commit()
