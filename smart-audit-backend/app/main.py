# app/main.py
from fastapi import FastAPI
from app.routes import audit
from fastapi.middleware.cors import CORSMiddleware
from app.services.db import init_db

app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount audit routes
app.include_router(audit.router)

