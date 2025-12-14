# smart-audit-backend/app/services/db.py
import os
from sqlmodel import SQLModel, create_engine, Session

# Use the correct database name from docker-compose
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg2://anurag:securepassword123@db:5432/auditdb"  # ✅ Changed to auditdb
)

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    from app.models.user import User
    from app.models.audit import Audit
    SQLModel.metadata.create_all(bind=engine)

def get_session():
    with Session(engine) as session:
        yield session