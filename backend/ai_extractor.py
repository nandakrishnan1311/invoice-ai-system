from providers.provider_factory import get_ai_provider
from ocr_reader import extract_text

_provider = None

def get_provider():
    global _provider
    if _provider is None:
        _provider = get_ai_provider()
    return _provider

def extract_invoice_data(file_path: str) -> dict:
    """Full pipeline: OCR -> AI extraction"""
    print(f"Extracting data from: {file_path}")
    
    # Step 1: Extract text via OCR
    text = extract_text(file_path)
    if not text:
        print("No text extracted from file")
        return {}
    
    # Step 2: AI extraction
    provider = get_provider()
    data = provider.extract_invoice_data(text)
    
    # Step 3: Categorize
    vendor = data.get("vendor_name", "")
    items_desc = " ".join([i.get("description", "") for i in data.get("line_items", [])])
    data["category"] = provider.categorize_expense(vendor, items_desc)
    data["file_path"] = file_path
    
    print(f"Extracted: {data.get('vendor_name')} | {data.get('total_amount')} | {data.get('category')}")
    return data
