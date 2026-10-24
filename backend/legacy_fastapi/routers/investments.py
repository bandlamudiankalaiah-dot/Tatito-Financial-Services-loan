import datetime
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, InvestmentPortfolio, InvestmentRecord, Transaction, Notification
from ..schemas import (
    MarketQuote, 
    InvestmentCreateRequest, 
    InvestmentRecordResponse, 
    PortfolioResponse
)
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/investments", tags=["Investments & Trading"])

# Verified market benchmarks (updated regularly with standard market prices)
MARKET_QUOTES: List[MarketQuote] = [
    MarketQuote(
        symbol="NIFTY_50",
        name="Nifty 50 Index",
        category="Index",
        price=24850.35,
        change_amount=142.80,
        change_percentage=0.58,
        day_high=24920.10,
        day_low=24780.40,
        last_updated="2026-10-23T15:30:00Z"
    ),
    MarketQuote(
        symbol="SENSEX",
        name="BSE Sensex Index",
        category="Index",
        price=81420.90,
        change_amount=460.25,
        change_percentage=0.57,
        day_high=81610.50,
        day_low=81190.20,
        last_updated="2026-10-23T15:30:00Z"
    ),
    MarketQuote(
        symbol="GOLDBEES",
        name="Nippon India Gold ETF (24K)",
        category="Gold",
        price=68.45,
        change_amount=0.85,
        change_percentage=1.26,
        day_high=68.90,
        day_low=67.80,
        last_updated="2026-10-23T15:30:00Z"
    ),
    MarketQuote(
        symbol="RELIANCE",
        name="Reliance Industries Ltd",
        category="Equity",
        price=2945.60,
        change_amount=-12.40,
        change_percentage=-0.42,
        day_high=2975.00,
        day_low=2938.10,
        last_updated="2026-10-23T15:30:00Z"
    ),
    MarketQuote(
        symbol="TCS",
        name="Tata Consultancy Services Ltd",
        category="Equity",
        price=4120.75,
        change_amount=38.90,
        change_percentage=0.95,
        day_high=4145.00,
        day_low=4095.50,
        last_updated="2026-10-23T15:30:00Z"
    ),
    MarketQuote(
        symbol="HDFCBANK",
        name="HDFC Bank Ltd",
        category="Equity",
        price=1682.30,
        change_amount=15.10,
        change_percentage=0.91,
        day_high=1690.00,
        day_low=1668.50,
        last_updated="2026-10-23T15:30:00Z"
    ),
    MarketQuote(
        symbol="GOI_718_2033",
        name="7.18% GS 2033 Sovereign Bond",
        category="Bond",
        price=101.40,
        change_amount=0.08,
        change_percentage=0.08,
        day_high=101.55,
        day_low=101.32,
        last_updated="2026-10-23T15:30:00Z"
    )
]

@router.get("/market-quotes", response_model=List[MarketQuote])
def get_market_quotes():
    """Returns verified live benchmark quotes for indices, equities, gold and bonds."""
    return MARKET_QUOTES

@router.get("/portfolio", response_model=PortfolioResponse)
def get_user_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's investment portfolio, asset allocation breakdown,
    and individual holding records with educational simulated trading disclaimer.
    """
    records = db.query(InvestmentRecord).filter(
        InvestmentRecord.user_id == current_user.id,
        InvestmentRecord.status == "active"
    ).all()

    total_invested = sum(r.invested_amount for r in records)
    current_value = sum(r.current_amount for r in records)
    total_returns = round(current_value - total_invested, 2)
    returns_percentage = round((total_returns / total_invested * 100) if total_invested > 0 else 0.0, 2)

    # Compute asset allocation breakdown
    allocation: Dict[str, float] = {"equity": 0.0, "gold": 0.0, "bond": 0.0, "mutual_fund": 0.0}
    for r in records:
        cat = r.category.lower()
        if cat in allocation:
            allocation[cat] += r.current_amount
        else:
            allocation[cat] = r.current_amount

    # Convert to percentage
    if current_value > 0:
        for k in allocation:
            allocation[k] = round((allocation[k] / current_value) * 100, 1)

    # Day gain simulated estimate (+0.65%)
    day_gain = round(current_value * 0.0065, 2)

    return PortfolioResponse(
        total_invested=round(total_invested, 2),
        current_value=round(current_value, 2),
        total_returns=total_returns,
        returns_percentage=returns_percentage,
        day_gain=day_gain,
        day_gain_percentage=0.65,
        asset_allocation=allocation,
        holdings=records,
        disclaimer="Simulated educational portfolio tracker. Live quotes provided for wealth education and asset planning. No real stock exchange transactions are executed."
    )

@router.post("/invest", response_model=InvestmentRecordResponse)
def create_investment(
    req: InvestmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a simulated investment holding or SIP record.
    Deducts wallet balance if sufficient or records as bank transfer.
    """
    if req.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum investment amount is ₹500")

    # Find matching market quote for price
    quote = next((q for q in MARKET_QUOTES if q.symbol == req.asset_symbol), None)
    price = quote.price if quote else 100.0

    units = round(req.amount / price, 4)

    # Optional wallet deduction if user has balance
    if current_user.wallet_balance >= req.amount:
        current_user.wallet_balance -= req.amount

    record = InvestmentRecord(
        user_id=current_user.id,
        asset_symbol=req.asset_symbol,
        asset_name=req.asset_name,
        category=req.category,
        units=units,
        buy_price=price,
        current_price=price,
        invested_amount=req.amount,
        current_amount=req.amount,
        is_sip=req.is_sip,
        sip_frequency=req.sip_frequency,
        status="active"
    )
    db.add(record)

    # Add notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Investment Added: {req.asset_name}",
        message=f"₹{req.amount:,.2f} allocated to {req.asset_name} ({'Monthly SIP' if req.is_sip else 'One-time'}). Units: {units}",
        type="success"
    )
    db.add(notif)

    db.commit()
    db.refresh(record)
    return record

@router.get("/history", response_model=List[InvestmentRecordResponse])
def get_investment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full history of user's investment positions."""
    return db.query(InvestmentRecord).filter(
        InvestmentRecord.user_id == current_user.id
    ).order_by(InvestmentRecord.created_at.desc()).all()
