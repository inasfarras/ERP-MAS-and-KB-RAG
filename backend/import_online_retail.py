"""Import the Online Retail dataset CSV into the PostgreSQL database.

USAGE
-----
$ python backend/import_online_retail.py  # uses the default dataset path

The script is idempotent: it skips import if the table already contains rows.
"""

from pathlib import Path
import os

import pandas as pd
from sqlalchemy.exc import SQLAlchemyError

from database import engine, SessionLocal
from models import OnlineRetailRecord, Base

# Guarantee the table exists (for fresh databases)
Base.metadata.create_all(bind=engine)

DATASET_PATH = (
    Path(__file__).resolve().parent.parent / "dataset" / "OnlineRetail" / "OnlineRetail.csv"
)

def import_dataset(csv_path: Path = DATASET_PATH):
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset CSV not found at {csv_path}")

    session = SessionLocal()
    try:
        existing_rows = session.query(OnlineRetailRecord).count()
        if existing_rows > 0:
            print(f"Table already populated with {existing_rows} rows – skipping import.")
            return
    finally:
        session.close()

    print(f"Reading dataset from {csv_path}")
    df = pd.read_csv(csv_path, encoding="ISO-8859-1")

    # Standardise column names to match ORM model
    df = df.rename(
        columns={
            "InvoiceNo": "invoice_no",
            "StockCode": "stock_code",
            "Description": "description",
            "Quantity": "quantity",
            "InvoiceDate": "invoice_date",
            "UnitPrice": "unit_price",
            "CustomerID": "customer_id",
            "Country": "country",
        }
    )

    # Datetime conversion
    df["invoice_date"] = pd.to_datetime(df["invoice_date"])

    print("Inserting rows into database – this might take a couple of minutes…")
    try:
        df.to_sql(OnlineRetailRecord.__tablename__, engine, if_exists="append", index=False, method="multi", chunksize=1000)
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to import dataset: {exc}") from exc

    print("✅ Import finished. Rows inserted:", len(df))


def main():
    import_dataset()


if __name__ == "__main__":
    main() 