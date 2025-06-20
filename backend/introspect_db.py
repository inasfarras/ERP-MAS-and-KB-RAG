import sqlalchemy as sa
import psycopg

DATABASE_URL = "postgresql+psycopg://erpuser:testpass@127.0.0.1:5433/erpdb"

engine = sa.create_engine(DATABASE_URL)

with engine.connect() as conn:
    insp = sa.inspect(conn)
    tables = insp.get_table_names()
    if not tables:
        print("No tables found in database.")
    else:
        print("Tables and row counts:")
        for tbl in tables:
            count = conn.execute(sa.text(f'SELECT COUNT(*) FROM "{tbl}"')).scalar()
            print(f"{tbl}: {count}") 