"""Run this to add demo invoices to the database"""
from database import create_tables, SessionLocal, Invoice, LineItem
from datetime import datetime, timedelta
import random

VENDORS = [
    ("TechSoft Solutions", "Tools & Software"),
    ("Office Depot", "Office Expenses"),
    ("Shell Petrol", "Travel & Petrol"),
    ("BSNL Telecom", "Utilities"),
    ("Adobe Inc", "Tools & Software"),
    ("Staples", "Office Expenses"),
    ("HP India", "Office Expenses"),
    ("Indian Oil", "Travel & Petrol"),
    ("Tata Power", "Utilities"),
    ("Zoom Video", "Tools & Software"),
]

def seed():
    create_tables()
    db = SessionLocal()
    
    for i, (vendor, category) in enumerate(VENDORS):
        base_total = random.uniform(500, 15000)
        tax = round(base_total * 0.18, 2)
        total = round(base_total + tax, 2)
        inv_date = (datetime.now() - timedelta(days=random.randint(1, 60))).strftime("%Y-%m-%d")
        due_date = (datetime.now() + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
        
        inv = Invoice(
            vendor_name=vendor,
            invoice_number=f"INV-2024-{1000+i}",
            invoice_date=inv_date,
            due_date=due_date,
            total_amount=total,
            tax_amount=tax,
            payment_status=random.choice(["Paid", "Pending", "Overdue"]),
            category=category,
            file_path=f"bills/demo/{vendor.replace(' ', '_')}.pdf"
        )
        db.add(inv)
        db.flush()
        
        # Add line items
        for j in range(random.randint(1, 4)):
            qty = random.randint(1, 5)
            unit = round(random.uniform(100, 3000), 2)
            li = LineItem(
                invoice_id=inv.id,
                description=f"{vendor} Service {j+1}",
                quantity=qty,
                unit_price=unit,
                item_total=round(qty * unit, 2)
            )
            db.add(li)
    
    db.commit()
    db.close()
    print("✅ Demo data seeded successfully!")

if __name__ == "__main__":
    seed()
