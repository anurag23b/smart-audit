from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import audit, verify, auth
from app.services.db import init_db
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from app.services.auth import ALGORITHM
from app.models.user import User
from app.services.db import get_session
from sqlmodel import select
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

app = FastAPI(title="Smart Audit API")

@app.on_event("startup")
async def startup():
    init_db()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,  # DISABLE FOR CORS TO WORK PROPERLY
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def jwt_gatekeeper(request: Request, call_next):
    path = request.url.path
    open_paths = (
        path.startswith("/auth")
        or path.startswith("/verify")
        or path.startswith("/docs")
        or path.startswith("/openapi")
        or path.startswith("/redoc")
        or path == "/"
        or path.startswith("/favicon")
        or request.method == "OPTIONS"  # LET CORS PASS BEFORE AUTH
    )
    if open_paths:
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

    token = auth_header.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

    return await call_next(request)

# ROUTES BELOW
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(audit.router, prefix="", tags=["Audit"])
app.include_router(verify.router, prefix="", tags=["Verification"])