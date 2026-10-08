import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config import settings
from backend.email_utils import send_otp_email

def main():
    print("=== SMTP Email Connection Validator ===")
    
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    
    if not username or not password:
        print("\n[!] ERROR: SMTP credentials are not configured in your backend/.env file.")
        print("Please open 'backend/.env' and fill in:")
        print("  SMTP_USERNAME=your_gmail_address@gmail.com")
        print("  SMTP_PASSWORD=your_16_digit_app_password")
        print("  SMTP_FROM=your_gmail_address@gmail.com")
        print("\nNote: For Gmail, you MUST generate a 16-character 'App Password' from your Google Account security settings (ordinary account passwords will be rejected).")
        return
        
    print(f"SMTP Host: {settings.SMTP_HOST}")
    print(f"SMTP Port: {settings.SMTP_PORT}")
    print(f"Sending From: {settings.SMTP_FROM or username}")
    
    recipient = input("\nEnter recipient email address to send test OTP: ").strip()
    if not recipient:
        print("No recipient provided. Exiting.")
        return
        
    print(f"\nAttempting to send test OTP to {recipient}...")
    success = send_otp_email(recipient, "999999")
    
    if success:
        print("\n[+] SUCCESS! The test email was successfully sent. Please check your inbox/spam folder.")
    else:
        print("\n[-] FAILED: Could not send test email. Review the error details printed above.")

if __name__ == "__main__":
    main()
