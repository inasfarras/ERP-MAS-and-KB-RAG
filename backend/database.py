from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variable. Fall back to a local SQLite
# database if none is provided.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///erp.db")

# Additional connection arguments for SQLite
connect_args = {
    "check_same_thread": False
} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {'options': '-c client_encoding=UTF8'}

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
