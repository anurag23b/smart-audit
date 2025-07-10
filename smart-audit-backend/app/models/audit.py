# app/models/audit.py
from sqlmodel import SQLModel, Field
from typing import Optional

class Audit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contract_hash: str
    security_grade: str
    summary: str
    tx_hash: str

# ✅ This is the model used for response (read-only)
class AuditRead(SQLModel):
    id: int
    contract_hash: str
    security_grade: str
    summary: str
    tx_hash: str