from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from report_generator import generate_report
import os

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("/generate")
def create_report(db: Session = Depends(get_db)):
    path = generate_report(db)
    return {"message": "Report generated", "path": path, "filename": os.path.basename(path)}

@router.get("/download/{filename}")
def download_report(filename: str):
    path = os.path.join("reports", filename)
    if not os.path.exists(path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=filename)

@router.get("/list")
def list_reports():
    os.makedirs("reports", exist_ok=True)
    files = [f for f in os.listdir("reports") if f.endswith(".xlsx")]
    return [{"filename": f} for f in sorted(files, reverse=True)]
