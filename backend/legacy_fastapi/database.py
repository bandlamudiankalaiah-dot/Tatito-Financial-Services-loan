import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configurable database URL (SQLite by default, or PostgreSQL if provided via env)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tatito_finance.db")

# SQLite needs connect_args check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI database dependency yields a session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
