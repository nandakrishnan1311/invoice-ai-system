import json
import os
from providers.base_provider import BaseAIProvider

class HuggingFaceProvider(BaseAIProvider):
    def __init__(self):
        try:
            from huggingface_hub import InferenceClient
            self.client = InferenceClient(
                token=os.getenv("HUGGINGFACE_API_KEY", ""),
                timeout=30
            )
            self.model = os.getenv("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct")
            self.available = True
            print(f"HuggingFace provider ready: {self.model}")
        except Exception as e:
            print(f"HuggingFace init error: {e}")
            self.available = False

    def _call_api(self, prompt: str, max_tokens: int = 800) -> str:
        """Works with huggingface_hub v1.6.0+"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.1
        )
        return response.choices[0].message.content.strip()

    def extract_invoice_data(self, text: str) -> dict:
        if not self.available:
            return self._fallback()
        try:
            # Truncate to avoid huge prompts
            text = text[:3000] if len(text) > 3000 else text

            prompt = f"""Extract invoice data and return ONLY valid JSON. No explanation.

Text:
{text}

Return ONLY this JSON:
{{
  "vendor_name": "string",
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null",
  "total_amount": number,
  "tax_amount": number,
  "payment_status": "Paid or Pending or Overdue",
  "category": "Office Expenses or Tools & Software or Travel & Petrol or Utilities or Other",
  "line_items": [
    {{"description": "string", "quantity": number, "unit_price": number, "item_total": number}}
  ]
}}"""

            raw = self._call_api(prompt, max_tokens=800)
            raw = raw.replace("```json", "").replace("```", "").strip()
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start != -1 and end > start:
                raw = raw[start:end]
            data = json.loads(raw)
            print(f"  -> Vendor: {data.get('vendor_name')} | Amount: {data.get('total_amount')} | Category: {data.get('category')}")
            return data
        except Exception as e:
            print(f"HuggingFace extraction error: {e}")
            return self._fallback()

    def categorize_expense(self, vendor: str, description: str) -> str:
        # Category extracted inside extract_invoice_data in one call
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