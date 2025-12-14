# smart-audit-backend/app/routes/__init__.py
from fastapi import APIRouter
from .audit import router as audit_router
from .verify import router as verify_router
from .auth import router as auth_router

router = APIRouter()
router.include_router(audit_router)
router.include_router(verify_router)
router.include_router(auth_router)