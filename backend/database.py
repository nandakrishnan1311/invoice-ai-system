from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

os.makedirs("database", exist_ok=True)

DATABASE_URL = "sqlite:///database/invoices.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String, index=True)
    invoice_number = Column(String, unique=True, index=True)
    invoice_date = Column(String)
    due_date = Column(String)
    total_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    payment_status = Column(String, default="Pending")
    category = Column(String, default="Other")
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    line_items = relationship("LineItem", back_populates="invoice", cascade="all, delete-orphan")

class LineItem(Base):
    __tablename__ = "line_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    description = Column(String)
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    item_total = Column(Float, default=0.0)
    invoice = relationship("Invoice", back_populates="line_items")

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
