from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Invoice, LineItem
from ai_extractor import extract_invoice_data
from config import settings
import os, shutil
from datetime import datetime

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

@router.get("/")
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()
    return [invoice_to_dict(inv) for inv in invoices]

@router.get("/{invoice_id}")
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    data = invoice_to_dict(inv)
    data["line_items"] = [item_to_dict(item) for item in inv.line_items]
    return data

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(inv)
    db.commit()
    return {"message": "Deleted"}

@router.post("/upload")
async def upload_invoice(file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs(settings.BILLS_DIR, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m")
    upload_dir = os.path.join(settings.BILLS_DIR, date_str, "manual_upload")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    data = extract_invoice_data(file_path)
    if not data:
        raise HTTPException(status_code=422, detail="Could not extract data from file")
    
    return save_invoice(db, data)

@router.get("/stats/summary")
def get_summary(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    total_spend = sum(float(inv.total_amount or 0) for inv in invoices)
    category_totals = {}
    for inv in invoices:
        cat = inv.category or "Other"
        category_totals[cat] = category_totals.get(cat, 0) + float(inv.total_amount or 0)
    
    status_counts = {}
    for inv in invoices:
        s = inv.payment_status or "Pending"
        status_counts[s] = status_counts.get(s, 0) + 1
    
    return {
        "total_invoices": len(invoices),
        "total_spend": round(total_spend, 2),
        "category_totals": category_totals,
        "status_counts": status_counts
    }

@router.get("/stats/monthly")
def get_monthly(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    monthly = {}
    for inv in invoices:
        if inv.invoice_date:
            try:
                month = inv.invoice_date[:7]
                monthly[month] = monthly.get(month, 0) + float(inv.total_amount or 0)
            except:
                pass
    return [{"month": k, "total": round(v, 2)} for k, v in sorted(monthly.items())]

def save_invoice(db: Session, data: dict):
    # Check duplicate
    if data.get("invoice_number"):
        existing = db.query(Invoice).filter(Invoice.invoice_number == data["invoice_number"]).first()
        if existing:
            return {"message": "Invoice already exists", "id": existing.id}
    
    inv = Invoice(
        vendor_name=data.get("vendor_name", "Unknown"),
        invoice_number=data.get("invoice_number", f"INV-{datetime.now().timestamp()}"),
        invoice_date=str(data.get("invoice_date", "")),
        due_date=str(data.get("due_date", "")),
        total_amount=float(data.get("total_amount", 0)),
        tax_amount=float(data.get("tax_amount", 0)),
        payment_status=data.get("payment_status", "Pending"),
        category=data.get("category", "Other"),
        file_path=data.get("file_path", "")
    )
    db.add(inv)
    db.flush()
    
    for item in data.get("line_items", []):
        li = LineItem(
            invoice_id=inv.id,
            description=item.get("description", ""),
            quantity=float(item.get("quantity", 1)),
            unit_price=float(item.get("unit_price", 0)),
            item_total=float(item.get("item_total", 0))
        )
        db.add(li)
    
    db.commit()
    db.refresh(inv)
    return {"message": "Invoice saved", "id": inv.id, "vendor": inv.vendor_name}

def invoice_to_dict(inv):
    return {
        "id": inv.id,
        "vendor_name": inv.vendor_name,
        "invoice_number": inv.invoice_number,
        "invoice_date": inv.invoice_date,
        "due_date": inv.due_date,
        "total_amount": inv.total_amount,
        "tax_amount": inv.tax_amount,
        "payment_status": inv.payment_status,
        "category": inv.category,
        "file_path": inv.file_path,
        "created_at": str(inv.created_at)
    }

def item_to_dict(item):
    return {
        "id": item.id,
        "invoice_id": item.invoice_id,
        "description": item.description,
        "quantity": item.quantity,
        "unit_price": item.unit_price,
        "item_total": item.item_total
    }
