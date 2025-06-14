import psycopg

# Individual connection parameters for psycopg.connect()
host = "127.0.0.1"
port = 5433
dbname = "erpdb"
user = "erpuser"
password = "testpass"

try:
    print(f"Attempting direct connection to: host={host}, port={port}, dbname={dbname}, user={user}")
    with psycopg.connect(host=host, port=port, dbname=dbname, user=user, password=password) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            print("Direct connection successful! Result:", cur.fetchone()[0])
except psycopg.OperationalError as e:
    print(f"Direct connection failed: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}") 