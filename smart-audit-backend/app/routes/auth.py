from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from app.models.user import User, UserCreate, UserRead, UserLogin
from app.services.auth import get_password_hash, verify_password, create_access_token
from app.services.db import get_session
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.post("/login")
def login(user: UserLogin, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.email == user.email)).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Email not found")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = create_access_token({"sub": str(db_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id
    }

@router.post("/token")
def get_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Email not found")
    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = create_access_token({"sub": str(db_user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id
    }