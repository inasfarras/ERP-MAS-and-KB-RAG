from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# For production, use PostgreSQL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/erp_db"

# For development/MVP, use SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./erp.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
