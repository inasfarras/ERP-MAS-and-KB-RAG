from sqlalchemy.orm import Session
from models import OnlineRetailRecord
from schemas import OnlineRetailRecord as OnlineRetailRecordSchema

def get_all_retail_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(OnlineRetailRecord).offset(skip).limit(limit).all() 