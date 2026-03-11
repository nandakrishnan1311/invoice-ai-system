import json
import os
from providers.base_provider import BaseAIProvider

class GeminiProvider(BaseAIProvider):
    def __init__(self):
        try:
            from google import genai
            self.client = genai.Client(
                api_key=os.getenv("GEMINI_API_KEY", "")
            )
            self.model = "gemini-2.0-flash"
            self.available = True
            print("Gemini provider initialized successfully")
        except Exception as e:
            print(f"Gemini init error: {e}")
            self.available = False

    def extract_invoice_data(self, text: str) -> dict:
        if not self.available:
            return self._fallback()
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=self._build_extraction_prompt(text)
            )
            raw = response.text.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except Exception as e:
            print(f"Gemini extraction error: {e}")
            return self._fallback()

    def categorize_expense(self, vendor: str, description: str) -> str:
        if not self.available:
            return "Other"
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=self._build_category_prompt(vendor, description)
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini categorization error: {e}")
            return "Other"

    def _fallback(self):
        return {
            "vendor_name": "Unknown",
            "invoice_number": "N/A",
            "invoice_date": None,
            "due_date": None,
            "total_amount": 0,
            "tax_amount": 0,
            "payment_status": "Pending",
            "line_items": []
        }
```

---

**After saving — mark emails as unread again and click Run Pipeline.**

You should now see:
```
✅ Gemini provider initialized successfully
✅ Extracted: TechSoft Solutions | 77580.0 | Tools & Software
✅ Extracted: Shell India | 9960.15 | Travel & Petrol
✅ Extracted: Office Depot | 16756.20 | Office Expenses