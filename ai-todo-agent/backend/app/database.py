from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 1. Load environment variables from the .env file
load_dotenv()

# 2. Get the Database URL. 
# We expect a PostgreSQL URL. If not found, it warns you.
# Format: postgresql://user:password@localhost/dbname
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file. Please set it to your PostgreSQL connection string.")

# 3. Create the SQLAlchemy Engine
# 'pool_pre_ping=True' ensures the connection handles "dropped" connections gracefully.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True
)

# 4. Create the SessionLocal class
# Each request will create a new database session instance from this class.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Create the Base class
# All our database models (User, Todo) will inherit from this.
Base = declarative_base()

# 6. Dependency Injection
# This function is used by FastAPI to open a DB session for a request
# and strictly close it when the request is done.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()