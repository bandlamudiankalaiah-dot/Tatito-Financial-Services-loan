import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import auth, users, loans, investments, contact, bills, blogs, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    # Seed default users and data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Tatito Financial Services API",
    description="Production-grade RESTful API for Tatito Financial Services – Borrow, Invest, Trade. Integrates User Authentication (JWT), Loan Management, Investment Portfolio & Market Watch, Bharat BillPay (BBPS), and Admin Credit Operations in Kadapa, Andhra Pradesh.",
    version="2.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(loans.router)
app.include_router(investments.router)
app.include_router(contact.router)
app.include_router(bills.router)
app.include_router(blogs.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "service": "Tatito Financial Services – Borrow, Invest, Trade REST API",
        "headquarters": "Kadapa, Andhra Pradesh, India",
        "version": "2.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "status": "online"
    }

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "Tatito Financial Services Full-Stack Backend",
        "branch": "Kadapa Central Hub, AP",
        "features": [
            "User Authentication & JWT",
            "Loan Applications & Admin Approval Workflow",
            "Investment Portfolio & Live Market Quotes",
            "Bharat BillPay (BBPS) & Recharge Gateway",
            "Contact & Grievance Enquiries",
            "Financial Literacy & Advisory"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
