from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from email_monitor import fetch_new_invoices
from ai_extractor import extract_invoice_data
from routes.invoices import save_invoice

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

pipeline_status = {"running": False, "last_run": None, "processed": 0, "errors": 0, "log": []}

@router.post("/run")
def run_pipeline(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if pipeline_status["running"]:
        return {"message": "Pipeline already running"}
    background_tasks.add_task(run_pipeline_task, db)
    return {"message": "Pipeline started"}

@router.get("/status")
def get_status():
    return pipeline_status

def run_pipeline_task(db: Session):
    pipeline_status["running"] = True
    pipeline_status["log"] = []
    pipeline_status["processed"] = 0
    pipeline_status["errors"] = 0
    
    try:
        pipeline_status["log"].append("Fetching emails...")
        files = fetch_new_invoices()
        pipeline_status["log"].append(f"Downloaded {len(files)} attachments")
        
        for file_path in files:
            try:
                pipeline_status["log"].append(f"Processing: {file_path}")
                data = extract_invoice_data(file_path)
                if data:
                    save_invoice(db, data)
                    pipeline_status["processed"] += 1
                    pipeline_status["log"].append(f"✓ Saved: {data.get('vendor_name', 'Unknown')}")
                else:
                    pipeline_status["errors"] += 1
            except Exception as e:
                pipeline_status["errors"] += 1
                pipeline_status["log"].append(f"✗ Error: {str(e)}")
    except Exception as e:
        pipeline_status["log"].append(f"Pipeline error: {str(e)}")
    
    from datetime import datetime
    pipeline_status["last_run"] = str(datetime.now())
    pipeline_status["running"] = False
    pipeline_status["log"].append("Pipeline complete")
