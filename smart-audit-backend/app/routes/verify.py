from fastapi import APIRouter, Depends
from app.models.audit import Audit
from app.services.db import get_session
from sqlmodel import Session, select

router = APIRouter()

@router.get("/verify/{contract_hash}")
def verify_contract(contract_hash: str, db: Session = Depends(get_session)):
    record = db.exec(select(Audit).where(Audit.contract_hash == contract_hash)).first()
    if not record:
        return {
            "status": False,
            "expected_hash": contract_hash,
            "stored_hash": None
        }
    return {
        "status": True,
        "expected_hash": contract_hash,
        "stored_hash": record.contract_hash,
        "summary": record.summary,
        "grade": record.security_grade,  # Updated to match Audit model
        "tx_hash": record.tx_hash,
        "cvss_score": record.cvss_score,
        "cid": record.cid,
        "cid_nft": record.cid_nft,
        "slither_issues": record.slither_issues,
        "mythril_issues": record.mythril_issues,
        "created_at": record.created_at
    }