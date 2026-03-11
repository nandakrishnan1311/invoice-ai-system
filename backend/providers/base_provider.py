from abc import ABC, abstractmethod

class BaseAIProvider(ABC):
    @abstractmethod
    def extract_invoice_data(self, text: str) -> dict:
        pass

    @abstractmethod
    def categorize_expense(self, vendor: str, description: str) -> str:
        pass

    def _build_extraction_prompt(self, text: str) -> str:
        return f"""Extract invoice data from the following text and return ONLY valid JSON.

Text:
{text}

Return this exact JSON structure:
{{
  "vendor_name": "string",
  "invoice_number": "string",
  "invoice_date": "string",
  "due_date": "string",
  "total_amount": number,
  "tax_amount": number,
  "payment_status": "Paid or Pending or Overdue",
  "line_items": [
    {{
      "description": "string",
      "quantity": number,
      "unit_price": number,
      "item_total": number
    }}
  ]
}}

If a field is not found, use null for strings and 0 for numbers. Return ONLY the JSON, no explanation."""

    def _build_category_prompt(self, vendor: str, description: str) -> str:
        return f"""Classify this expense into exactly one category.

Vendor: {vendor}
Description: {description}

Categories:
- Office Expenses (stationery, furniture, office supplies)
- Tools & Software (software, subscriptions, digital tools, SaaS)
- Travel & Petrol (fuel, transport, hotel, flights)
- Utilities (electricity, internet, phone, water)
- Other (anything that doesn't fit above)

Return ONLY the category name, nothing else."""
