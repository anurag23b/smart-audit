# app/services/db.py
from sqlmodel import SQLModel, Session, create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://anurag@localhost/auditdb")
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    return Session(engine)

def init_db():
    SQLModel.metadata.create_all(engine)
