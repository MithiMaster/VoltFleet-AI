from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import settings

# Adjust sqlite connection args if running SQLite
connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("postgresql"):
    try:
        # Test connection to PostgreSQL
        from sqlalchemy import create_engine as test_create_engine
        temp_engine = test_create_engine(db_url)
        with temp_engine.connect() as conn:
            pass
    except Exception as e:
        import sys
        import os
        print(f"\n[DATABASE WARNING] Failed to connect to PostgreSQL: {e}", file=sys.stderr)
        print("[DATABASE WARNING] Falling back to local SQLite database 'voltgrid.db' for development/testing.\n", file=sys.stderr)
        db_url = f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voltgrid.db')}"

elif db_url.startswith("mysql"):
    try:
        # Auto-create MySQL database if it doesn't exist and test connection
        r_slash_idx = db_url.rfind("/")
        if r_slash_idx != -1:
            base_url = db_url[:r_slash_idx + 1]
            db_name = db_url[r_slash_idx + 1:]
            
            # Connect to server without database
            from sqlalchemy import create_engine as test_create_engine
            server_engine = test_create_engine(base_url)
            with server_engine.connect() as conn:
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
                conn.commit()
            server_engine.dispose()
            
            # Test connection to the specific database
            temp_engine = test_create_engine(db_url)
            with temp_engine.connect() as conn:
                pass
            temp_engine.dispose()
    except Exception as e:
        import sys
        import os
        print(f"\n[DATABASE WARNING] Failed to connect to MySQL: {e}", file=sys.stderr)
        print("[DATABASE WARNING] Falling back to local SQLite database 'voltgrid.db' for development/testing.\n", file=sys.stderr)
        db_url = f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voltgrid.db')}"

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # If using PostgreSQL, check for TimescaleDB extension and configure hypertables
    if engine.url.drivername.startswith("postgresql"):
        db = SessionLocal()
        try:
            # Check if timescaledb is installed/available
            db.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
            db.commit()
            
            # Helper to create hypertable if it does not exist
            # Note: We run these in a try-except block in case they are already hypertables
            hypertables = [
                ("battery_logs", "time"),
                ("speed_logs", "time"),
                ("trip_logs", "time"),
                ("alerts_logs", "time")
            ]
            for table, col in hypertables:
                try:
                    db.execute(text(f"SELECT create_hypertable('{table}', '{col}', if_not_exists => TRUE);"))
                    db.commit()
                except Exception as ex:
                    db.rollback()
                    print(f"TimescaleDB hypertable setup skipped or failed for {table}: {ex}")
        except Exception as e:
            db.rollback()
            print(f"TimescaleDB initialization skipped or failed: {e}")
        finally:
            db.close()
