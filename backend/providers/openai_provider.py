import json
import os
from providers.base_provider import BaseAIProvider

class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
            self.available = True
        except Exception as e:
            print(f"OpenAI init error: {e}")
            self.available = False

    def extract_invoice_data(self, text: str) -> dict:
        if not self.available:
            return self._fallback()
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": self._build_extraction_prompt(text)}],
                temperature=0
            )
            raw = response.choices[0].message.content.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
        except Exception as e:
            print(f"OpenAI extraction error: {e}")
            return self._fallback()

    def categorize_expense(self, vendor: str, description: str) -> str:
        if not self.available:
            return "Other"
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": self._build_category_prompt(vendor, description)}],
                temperature=0
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI categorization error: {e}")
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
