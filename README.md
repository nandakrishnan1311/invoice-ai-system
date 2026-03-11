# InvoiceAI — Automated Bill & Invoice Intelligence System

> Strikin Internship Assignment — Task 01

A production-grade, end-to-end invoice automation system with AI-powered extraction, OCR processing, multi-provider AI support, SQLite storage, Excel reporting, and a professional React dashboard.

---

## Architecture

```
Email Inbox (Gmail/IMAP)
     ↓
Email Monitoring (IMAP + App Password)
     ↓
Attachment Downloader (/bills/YYYYMM/vendor/)
     ↓
OCR Processing (Tesseract + PyMuPDF)
     ↓
AI Data Extraction (Gemini / OpenAI / HuggingFace)
     ↓
SQLite Storage (Parent: invoices, Child: line_items)
     ↓
Auto Categorization (5 expense categories)
     ↓
Excel Report (3 sheets + bar/pie charts)
     ↓
React Dashboard (FastAPI backend)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy |
| AI (default) | Google Gemini Pro |
| AI (optional) | OpenAI GPT-4o-mini, HuggingFace Inference API |
| OCR | Tesseract, PyMuPDF, pdf2image |
| Database | SQLite |
| Reports | openpyxl |
| Frontend | React + Vite, Tailwind CSS |
| Charts | Recharts |

---

## Setup Instructions

### Prerequisites

1. Python 3.11+: https://www.python.org/downloads/
2. Node.js 18+: https://nodejs.org/en/download
3. Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki
4. Poppler: https://github.com/oschwartz10612/poppler-windows/releases

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys and email credentials

# Seed demo data (optional)
python seed_demo.py

# Start backend
uvicorn app:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Environment Variables

```env
# Choose AI provider: gemini | openai | huggingface
AI_PROVIDER=gemini

GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
HUGGINGFACE_API_KEY=your_key

EMAIL_ADDRESS=you@gmail.com
EMAIL_PASSWORD=your_16_digit_app_password

# Windows Tesseract path:
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/invoices/ | List all invoices |
| GET | /api/invoices/{id} | Get invoice + line items |
| POST | /api/invoices/upload | Upload & process a bill |
| DELETE | /api/invoices/{id} | Delete invoice |
| GET | /api/invoices/stats/summary | KPIs and category totals |
| GET | /api/invoices/stats/monthly | Monthly spend trend |
| POST | /api/reports/generate | Generate Excel report |
| GET | /api/reports/download/{file} | Download report |
| POST | /api/pipeline/run | Run email pipeline |
| GET | /api/pipeline/status | Pipeline status |

---

## Features

- **Multi-format bill reading** — digital PDFs, scanned images, hybrid documents
- **3 AI providers** — switch between Gemini, OpenAI, HuggingFace via .env
- **Auto-categorization** — 5 expense categories automatically assigned
- **Excel report** — 3 sheets with embedded bar + pie charts
- **Professional dashboard** — dark theme, animated charts, sortable tables
- **Drag & drop upload** — manual bill upload with AI extraction
- **Pipeline runner** — one-click email monitoring from the UI

---

## Known Limitations

- HuggingFace free tier has rate limits — may be slow for large batches
- Tesseract accuracy varies on low-quality scanned bills
- Email monitoring works best with Gmail App Password (2FA required)
- OpenAI requires billing setup (very cheap per invoice)

## What I Would Improve With More Time

- Add JWT authentication for multi-user support
- Add vendor management and custom category rules
- Scheduled pipeline with configurable intervals
- Email notifications when new invoices are processed
- Better OCR pre-processing (deskew, denoise) for low-quality scans
- Support for more invoice formats (XML, EDI)
