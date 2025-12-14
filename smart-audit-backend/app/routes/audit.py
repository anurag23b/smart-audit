from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.models.audit import Audit, AuditRead
from app.services.db import get_session
from app.services.auth import get_current_user
from sqlmodel import Session, select
import os, hashlib, json, uuid
from typing import List
from app.models.user import User

router = APIRouter()


def normalize_issues(audit: Audit) -> dict:
    """Convert stored JSON strings back to arrays for API response"""
    if not audit:
        return None
    
    # Parse JSON strings to arrays
    slither_issues = []
    mythril_issues = []
    
    if isinstance(audit.slither_issues, str):
        try:
            slither_issues = json.loads(audit.slither_issues)
        except:
            slither_issues = []
    elif isinstance(audit.slither_issues, list):
        slither_issues = audit.slither_issues
    
    if isinstance(audit.mythril_issues, str):
        try:
            mythril_issues = json.loads(audit.mythril_issues)
        except:
            mythril_issues = []
    elif isinstance(audit.mythril_issues, list):
        mythril_issues = audit.mythril_issues
    
    # Return as dict matching AuditRead schema
    return {
        "id": audit.id,
        "contract_hash": audit.contract_hash,
        "security_grade": audit.security_grade,
        "cvss_score": audit.cvss_score,
        "summary": audit.summary,
        "tx_hash": audit.tx_hash,
        "cid": audit.cid,
        "cid_nft": audit.cid_nft,
        "slither_issues": slither_issues,  # ✅ Actual array
        "mythril_issues": mythril_issues,  # ✅ Actual array
        "user_id": audit.user_id,
        "created_at": audit.created_at,
    }


@router.post("/upload", response_model=AuditRead)
async def upload_contract(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    file_path = None
    try:
        if not file.filename.endswith(".sol"):
            raise HTTPException(status_code=400, detail="Only .sol files are allowed")
        if file.size and file.size > 1_000_000:
            raise HTTPException(status_code=400, detail="File size exceeds 1MB")

        contents = await file.read()
        source_code = contents.decode("utf-8")
        contract_hash = hashlib.sha256(source_code.encode()).hexdigest()

        file_path = os.path.join("uploads", f"{uuid.uuid4()}_{file.filename}")
        os.makedirs("uploads", exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(contents)

        from app.services.llm import generate_llm_summary
        from app.services.static_analysis import run_static_analysis, compute_security_grade
        from app.blockchain.contract_utils import record_audit

        print(f"🔍 Analysis: {file.filename}")
        analysis_result = run_static_analysis(file_path)
        slither_report = analysis_result["slither"]
        mythril_report = analysis_result["mythril"]

        llm_summary = generate_llm_summary(
            source_code,
            slither_data=json.dumps(slither_report),
            mythril_data=json.dumps(mythril_report),
        )

        grade, cvss_score = compute_security_grade(slither_report, mythril_report, llm_summary)

        try:
            tx_hash, cid_pinata, cid_nft = record_audit(contract_hash, grade, llm_summary)
        except Exception:
            tx_hash = "BLOCKCHAIN_FAILED"
            cid_pinata = "IPFS_FAILED"
            cid_nft = "NFT_STORAGE_FAILED"

        # ✅ Store as JSON strings
        audit = Audit(
            contract_hash=contract_hash,
            security_grade=grade,
            cvss_score=cvss_score,
            summary=llm_summary,
            tx_hash=tx_hash,
            cid=cid_pinata,
            cid_nft=cid_nft,
            slither_issues=json.dumps(slither_report.get("issues", [])),  # ✅ Stringify
            mythril_issues=json.dumps(mythril_report.get("issues", [])),  # ✅ Stringify
            user_id=current_user.id,
        )
        session.add(audit)
        session.commit()
        session.refresh(audit)

        # ✅ Return normalized dict
        return normalize_issues(audit)

    finally:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)


@router.get("/my-audits", response_model=List[AuditRead])
def get_my_audits(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    audits = session.exec(
        select(Audit).where(Audit.user_id == current_user.id).order_by(Audit.id.desc())
    ).all()
    return [normalize_issues(a) for a in audits]


@router.get("/audit/{audit_id}", response_model=AuditRead)
def get_audit(
    audit_id: int, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    audit = session.exec(select(Audit).where(Audit.id == audit_id)).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    if audit.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return normalize_issues(audit)