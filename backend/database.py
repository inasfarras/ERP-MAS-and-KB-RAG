from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
# from dotenv import load_dotenv # Temporarily commented out for testing

# Load environment variables from .env file
# load_dotenv() # Temporarily commented out for testing

# Get database URL from environment variable. Fall back to a local SQLite
# database if none is provided.
# DATABASE_URL = os.getenv("DATABASE_URL") # Temporarily commented out for testing

# Hardcode DATABASE_URL for testing purposes
DATABASE_URL = "postgresql+psycopg://erpuser:testpass@127.0.0.1:5433/erpdb"
print(f"DATABASE_URL (hardcoded raw): {DATABASE_URL}")
print(f"DATABASE_URL (hardcoded repr): {repr(DATABASE_URL)}")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()