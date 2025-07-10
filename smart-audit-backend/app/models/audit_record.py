# app/models/audit_record.py
from sqlmodel import SQLModel, Field
from datetime import datetime

class AuditRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    contract_hash: str
    summary: str
    grade: str
    tx_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
