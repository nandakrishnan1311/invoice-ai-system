import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # AI Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")

    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")
    HF_MODEL: str = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")

    # Email
    EMAIL_ADDRESS: str = os.getenv("EMAIL_ADDRESS", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    IMAP_SERVER: str = os.getenv("IMAP_SERVER", "imap.gmail.com")
    IMAP_PORT: int = int(os.getenv("IMAP_PORT", "993"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///database/invoices.db")

    # Paths
    BILLS_DIR: str = os.getenv("BILLS_DIR", "bills")
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", "reports")

    # Tesseract
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")

settings = Settings()
