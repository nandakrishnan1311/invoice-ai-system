import os
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from config import settings

# Set tesseract path if configured
if settings.TESSERACT_CMD != "tesseract":
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF - tries digital first, falls back to OCR"""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        # If we got meaningful text, return it
        if len(text.strip()) > 50:
            return text.strip()
        
        # Otherwise use OCR
        return _ocr_pdf(file_path)
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_image(file_path: str) -> str:
    """Extract text from image using OCR"""
    try:
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img, config="--psm 6")
        return text.strip()
    except Exception as e:
        print(f"Image OCR error: {e}")
        return ""

def _ocr_pdf(file_path: str) -> str:
    """OCR a scanned PDF by converting pages to images"""
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(file_path, dpi=300)
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img, config="--psm 6") + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF OCR error: {e}")
        return ""

def extract_text(file_path: str) -> str:
    """Main function - auto-detects file type and extracts text"""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"]:
        return extract_text_from_image(file_path)
    else:
        return ""
