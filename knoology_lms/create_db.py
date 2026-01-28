
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

# Get credentials
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
target_db = os.getenv('DB_NAME')

try:
    # Connect to 'postgres' database to create the new database
    con = psycopg2.connect(dbname='postgres', user=db_user, host=db_host, password=db_password, port=db_port)
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = con.cursor()
    
    # Check if database exists
    cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{target_db}'")
    exists = cur.fetchone()
    
    if not exists:
        print(f"Creating database {target_db}...")
        cur.execute(f"CREATE DATABASE {target_db}")
        print("Database created successfully.")
    else:
        print(f"Database {target_db} already exists.")
        
    cur.close()
    con.close()
    
except Exception as e:
    print(f"Error: {e}")
