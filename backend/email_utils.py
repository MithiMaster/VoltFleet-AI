import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.config import settings

def send_otp_email(to_email: str, otp: str) -> bool:
    subject = "Voltgrid - Verify your account with OTP"
    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0b132b; color: #ffffff; padding: 20px; border-radius: 10px; max-width: 500px; margin: 0 auto; border: 1px solid #1c2541;">
        <h2 style="color: #00ebc7; text-align: center; font-size: 24px; font-weight: bold;">Voltgrid Verification</h2>
        <p style="color: #ffffff; font-size: 14px; line-height: 1.5;">Thank you for registering on Voltgrid. Please use the following 6-digit One-Time Password (OTP) to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; background-color: #1c2541; padding: 15px; text-align: center; border-radius: 5px; color: #00ebc7; letter-spacing: 8px; margin: 25px 0; border: 1px solid #00ebc7;">
          {otp}
        </div>
        <p style="color: #8e9aaf; font-size: 13px; line-height: 1.5;">This verification code is valid for 10 minutes. If you did not request this verification, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #1c2541; margin: 20px 0;" />
        <p style="font-size: 11px; color: #8e9aaf; text-align: center; margin: 0;">Voltgrid EV Fleet Operations Platform &copy; 2026</p>
      </body>
    </html>
    """
    
    # Fallback if SMTP parameters are missing
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"\n" + "="*50)
        print(f"[EMAIL MOCK - NO SMTP CREDENTIALS]")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"OTP Code: {otp}")
        print("="*50 + "\n")
        return False
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USERNAME
        msg["To"] = to_email
        
        msg.attach(MIMEText(body, "html"))
        
        # Connect to Gmail SMTP
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(msg["From"], [to_email], msg.as_string())
        server.quit()
        print(f"[EMAIL SENT] Successfully sent OTP to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email via SMTP to {to_email}: {e}")
        print(f"\n" + "="*50)
        print(f"[EMAIL FALLBACK - TERMINAL PRINT]")
        print(f"OTP for {to_email}: {otp}")
        print("="*50 + "\n")
        return False
