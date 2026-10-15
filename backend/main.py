import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import auth, bills, loans, blogs, admin

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
    description="Production-grade RESTful API for Bharat BillPay (BBPS) utility recharges, loan applications, EMI repayments, and financial literacy based in Kadapa, Andhra Pradesh.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(bills.router)
app.include_router(loans.router)
app.include_router(blogs.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "service": "Tatito Financial Services REST API",
        "headquarters": "Kadapa, Andhra Pradesh, India",
        "compliance": "BBPS Enabled • RBI NBFC Regulatory Guidelines",
        "documentation": "/docs",
        "openapi_spec": "/openapi.json",
        "status": "healthy"
    }

@app.get("/api/health")
def healthcheck():
    return {
        "status": "online",
        "timestamp": "2026-10-14T22:35:00Z",
        "branch": "Kadapa Central Hub, AP",
        "active_services": ["Recharges", "BBPS Bills", "Personal Loans", "Gold Loans", "Business Loans", "Home Loans", "Vehicle Loans"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
