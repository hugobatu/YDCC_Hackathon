# app/core/email.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587

EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

EMAIL_FROM_NAME = "Aqua Sentinel"

class EmailService:
    def __init__(self):
        if not EMAIL_USERNAME or not EMAIL_PASSWORD:
            raise ValueError("Email credentials are not configured")

    def send_email(
        self,
        to: List[str],
        subject: str,
        body: str,
        html: bool = False,
        attachments: Optional[List[str]] = None,
    ):
        msg = MIMEMultipart()
        msg["From"] = f"{EMAIL_FROM_NAME} <{EMAIL_USERNAME}>"
        msg["To"] = ", ".join(to)
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "html" if html else "plain"))

        # Attachments
        if attachments:
            for file_path in attachments:
                with open(file_path, "rb") as f:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(f.read())

                encoders.encode_base64(part)
                filename = file_path.split("/")[-1]
                part.add_header(
                    "Content-Disposition",
                    f'attachment; filename="{filename}"'
                )
                msg.attach(part)

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(msg)
