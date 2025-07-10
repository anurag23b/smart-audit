# app/database.py
from sqlmodel import create_engine, Session

DATABASE_URL = "postgresql://anurag:yourpassword@localhost/auditdb"
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session
