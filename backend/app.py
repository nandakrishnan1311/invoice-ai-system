from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_tables
from routes import invoices, reports, pipeline
import os

app = FastAPI(title="Invoice AI System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

# Ensure directories exist
os.makedirs("bills", exist_ok=True)
os.makedirs("reports", exist_ok=True)
os.makedirs("database", exist_ok=True)

# Register routes
app.include_router(invoices.router)
app.include_router(reports.router)
app.include_router(pipeline.router)

@app.get("/")
def root():
    return {"message": "Invoice AI System API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
