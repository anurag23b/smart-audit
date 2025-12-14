from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text
from typing import Optional, List, Any
from datetime import datetime
import json

class Audit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contract_hash: str
    security_grade: str
    cvss_score: Optional[float] = None
    summary: str
    tx_hash: str
    cid: Optional[str] = None
    cid_nft: Optional[str] = None
    # ✅ Store as TEXT, not JSON column
    slither_issues: str = Field(default="[]", sa_column=Column(Text))
    mythril_issues: str = Field(default="[]", sa_column=Column(Text))
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditRead(SQLModel):
    id: int
    contract_hash: str
    security_grade: str
    cvss_score: Optional[float]
    summary: str
    tx_hash: str
    cid: Optional[str]
    cid_nft: Optional[str]
    # ✅ These will be actual arrays in the response
    slither_issues: List[Any] = []
    mythril_issues: List[Any] = []
    user_id: int
    created_at: datetime