from database import engine
from sqlalchemy import text

def test_connection():
    try:
        # Try to connect to the database
        with engine.connect() as connection:
            # Execute a simple query
            result = connection.execute(text("SELECT 1"))
            print("Successfully connected to Supabase!")
            return True
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        return False

if __name__ == "__main__":
    test_connection() 