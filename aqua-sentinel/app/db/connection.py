import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

USER = os.getenv("DB_USER") or os.getenv("user")
PASSWORD = os.getenv("DB_PASSWORD") or os.getenv("password")
HOST = os.getenv("DB_HOST") or os.getenv("host")
PORT = os.getenv("DB_PORT") or os.getenv("port")
DBNAME = os.getenv("DB_NAME") or os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()