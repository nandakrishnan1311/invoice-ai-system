'''import imaplib
import email
import os
from email.header import decode_header
from datetime import datetime
from config import settings

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".tiff"}

def connect_to_email():
    """Connect to email via IMAP"""
    mail = imaplib.IMAP4_SSL(settings.IMAP_SERVER, settings.IMAP_PORT)
    mail.login(settings.EMAIL_ADDRESS, settings.EMAIL_PASSWORD)
    return mail

def get_vendor_from_sender(sender: str) -> str:
    """Extract vendor name from email sender"""
    if "<" in sender:
        name = sender.split("<")[0].strip().strip('"')
        return name if name else sender.split("@")[0]
    return sender.split("@")[0]

def download_attachments(mail, msg, vendor_name: str) -> list:
    """Download attachments from email message"""
    downloaded = []
    date_str = datetime.now().strftime("%Y%m")
    safe_vendor = "".join(c if c.isalnum() or c in "-_" else "_" for c in vendor_name)
    
    folder = os.path.join(settings.BILLS_DIR, date_str, safe_vendor)
    os.makedirs(folder, exist_ok=True)
    
    for part in msg.walk():
        if part.get_content_maintype() == "multipart":
            continue
        if part.get("Content-Disposition") is None:
            continue
        
        filename = part.get_filename()
        if not filename:
            continue
        
        filename = decode_header(filename)[0][0]
        if isinstance(filename, bytes):
            filename = filename.decode()
        
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue
        
        file_path = os.path.join(folder, filename)
        with open(file_path, "wb") as f:
            f.write(part.get_payload(decode=True))
        
        downloaded.append(file_path)
        print(f"Downloaded: {file_path}")
    
    return downloaded

def fetch_new_invoices() -> list:
    """Fetch new invoice emails and download attachments"""
    if not settings.EMAIL_ADDRESS or not settings.EMAIL_PASSWORD:
        print("Email credentials not configured")
        return []
    
    all_files = []
    try:
        mail = connect_to_email()
        mail.select("inbox")
        
        # Search for unseen emails with attachments
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK":
            return []
        
        email_ids = messages[0].split()
        print(f"Found {len(email_ids)} new emails")
        
        for email_id in email_ids:
            status, msg_data = mail.fetch(email_id, "(RFC822)")
            if status != "OK":
                continue
            
            msg = email.message_from_bytes(msg_data[0][1])
            sender = msg.get("From", "unknown")
            vendor_name = get_vendor_from_sender(sender)
            
            # Check if has attachments
            has_attachment = any(
                part.get_filename() and 
                os.path.splitext(str(part.get_filename()))[1].lower() in ALLOWED_EXTENSIONS
                for part in msg.walk()
            )
            
            if has_attachment:
                files = download_attachments(mail, msg, vendor_name)
                all_files.extend(files)
        
        mail.logout()
    except Exception as e:
        print(f"Email fetch error: {e}")
    
    return all_files'''


import imaplib
import email
import os
from email.header import decode_header
from datetime import datetime
from config import settings

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".tiff"}

def connect_to_email():
    """Connect to email via IMAP"""
    mail = imaplib.IMAP4_SSL(settings.IMAP_SERVER, settings.IMAP_PORT)
    mail.login(settings.EMAIL_ADDRESS, settings.EMAIL_PASSWORD)
    return mail

def get_vendor_from_sender(sender: str) -> str:
    """Extract vendor name from email sender"""
    if "<" in sender:
        name = sender.split("<")[0].strip().strip('"')
        return name if name else sender.split("@")[0]
    return sender.split("@")[0]

def download_attachments(mail, msg, vendor_name: str) -> list:
    """Download attachments from email message"""
    downloaded = []
    date_str = datetime.now().strftime("%Y%m")
    safe_vendor = "".join(c if c.isalnum() or c in "-_" else "_" for c in vendor_name)
    
    folder = os.path.join(settings.BILLS_DIR, date_str, safe_vendor)
    os.makedirs(folder, exist_ok=True)
    
    for part in msg.walk():
        if part.get_content_maintype() == "multipart":
            continue
        if part.get("Content-Disposition") is None:
            continue
        
        filename = part.get_filename()
        if not filename:
            continue
        
        filename = decode_header(filename)[0][0]
        if isinstance(filename, bytes):
            filename = filename.decode()
        
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue
        
        file_path = os.path.join(folder, filename)
        with open(file_path, "wb") as f:
            f.write(part.get_payload(decode=True))
        
        downloaded.append(file_path)
        print(f"Downloaded: {file_path}")
    
    return downloaded

def fetch_new_invoices(max_emails: int = 20) -> list:
    """Fetch new invoice emails and download attachments"""
    if not settings.EMAIL_ADDRESS or not settings.EMAIL_PASSWORD:
        print("Email credentials not configured")
        return []
    
    all_files = []
    try:
        mail = connect_to_email()
        mail.select("inbox")

        # Search only UNSEEN emails from last 7 days with keywords
        from datetime import timedelta
        since_date = (datetime.now() - timedelta(days=7)).strftime("%d-%b-%Y")
        
        # Try keyword search first (invoice/bill related only)
        search_criteria = [
            f'(UNSEEN SINCE {since_date} SUBJECT "invoice")',
            f'(UNSEEN SINCE {since_date} SUBJECT "bill")',
            f'(UNSEEN SINCE {since_date} SUBJECT "receipt")',
            f'(UNSEEN SINCE {since_date} SUBJECT "payment")',
        ]

        email_ids = []
        for criteria in search_criteria:
            status, messages = mail.search(None, criteria)
            if status == "OK" and messages[0]:
                ids = messages[0].split()
                for eid in ids:
                    if eid not in email_ids:
                        email_ids.append(eid)

        # Safety limit — never process more than max_emails
        email_ids = email_ids[:max_emails]
        print(f"Found {len(email_ids)} relevant emails (limited to {max_emails})")

        for email_id in email_ids:
            status, msg_data = mail.fetch(email_id, "(RFC822)")
            if status != "OK":
                continue
            
            msg = email.message_from_bytes(msg_data[0][1])
            sender = msg.get("From", "unknown")
            vendor_name = get_vendor_from_sender(sender)
            
            # Check if has attachments
            has_attachment = any(
                part.get_filename() and 
                os.path.splitext(str(part.get_filename()))[1].lower() in ALLOWED_EXTENSIONS
                for part in msg.walk()
            )
            
            if has_attachment:
                files = download_attachments(mail, msg, vendor_name)
                all_files.extend(files)
        
        mail.logout()
    except Exception as e:
        print(f"Email fetch error: {e}")
    
    return all_files
