# app/routes/audit.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.llm import generate_llm_summary
from app.services.static_analysis import run_slither_analysis, run_mythril_analysis
from blockchain.contract_utils import record_audit
from app.models.audit import Audit, AuditRead
from app.services.db import get_session
from sqlmodel import Session, select
import os, hashlib
from typing import List
from app.models.audit import AuditRead
from typing import List

router = APIRouter()

@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        source_code = contents.decode("utf-8")

        # Save uploaded contract locally
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)

        with open(file_path, "wb") as f:
            f.write(contents)

        # Run static analysis tools
        slither_report = run_slither_analysis(file_path)
        mythril_report = run_mythril_analysis(file_path)

        # Generate LLM-based audit summary
        llm_summary = generate_llm_summary(
            source_code,
            slither_data=slither_report,
            mythril_data=mythril_report,
        )

        # Compute SHA-256 contract hash
        contract_hash = hashlib.sha256(source_code.encode()).hexdigest()

        # Store grade on-chain and get tx hash
        grade = "B"  # Placeholder, can be parsed dynamically
        tx_hash = record_audit(contract_hash, grade, llm_summary)

        # Save to PostgreSQL DB
        session = get_session()
        audit = Audit(
            contract_hash=contract_hash,
            security_grade=grade,
            summary=llm_summary,
            tx_hash=tx_hash
        )
        session.add(audit)
        session.commit()

        return {
            "summary": llm_summary,
            "grade": grade,
            "tx_hash": tx_hash,
            "contract_hash": contract_hash,
            "slither_report": slither_report,
            "mythril_report": mythril_report,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audits", response_model=List[AuditRead])
def get_audit_records(session: Session = Depends(get_session)):
    audits = session.exec(select(Audit).order_by(Audit.id.desc()).limit(20)).all()
    return audits

