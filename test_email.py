#!/usr/bin/env python3.11
"""
Simple script to test SMTP email configuration
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def test_smtp():
    """Test SMTP connection and send a test email."""

    # Get credentials from .env
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')
    email_from = os.getenv('EMAIL_FROM')
    email_to = os.getenv('EMAIL_TO')

    print(f"Testing SMTP configuration:")
    print(f"  Host: {smtp_host}")
    print(f"  Port: {smtp_port}")
    print(f"  Username: {smtp_username}")
    print(f"  From: {email_from}")
    print(f"  To: {email_to}")
    print()

    try:
        print("Connecting to SMTP server...")
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)

        print("Starting TLS...")
        server.starttls()

        print("Logging in...")
        server.login(smtp_username, smtp_password)

        print("Creating test message...")
        msg = MIMEMultipart()
        msg['From'] = email_from
        msg['To'] = email_to
        msg['Subject'] = "Test Email from RSS Whisperer"

        body = """
        This is a test email from your RSS Whisperer setup!

        If you received this, your SMTP configuration is working correctly.

        You can now run: python3.11 run_summarizer.py
        """

        msg.attach(MIMEText(body, 'plain'))

        print("Sending test email...")
        server.send_message(msg)

        print("Closing connection...")
        server.quit()

        print()
        print("✅ SUCCESS! Test email sent successfully.")
        print(f"Check your inbox at: {email_to}")

    except smtplib.SMTPAuthenticationError as e:
        print()
        print("❌ AUTHENTICATION ERROR:")
        print("   Your Gmail app password may be incorrect.")
        print("   Visit: https://myaccount.google.com/apppasswords")
        print(f"   Error: {e}")

    except smtplib.SMTPException as e:
        print()
        print("❌ SMTP ERROR:")
        print(f"   {e}")

    except Exception as e:
        print()
        print("❌ ERROR:")
        print(f"   {e}")

if __name__ == '__main__':
    test_smtp()
