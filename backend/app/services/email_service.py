"""
Gmail SMTP Email Service for NTU Food App
Handles OTP and welcome email sending via Gmail SMTP
"""
import smtplib
import random
import string
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Tuple
import os
from dotenv import load_dotenv
import logging
import time

load_dotenv()
logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Gmail SMTP"""

    def __init__(self):
        """Initialize email service with Gmail SMTP configuration"""
        # Gmail SMTP Configuration
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_email = os.getenv('SMTP_EMAIL', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.smtp_from_name = os.getenv('SMTP_FROM_NAME', 'NTU Food')

        # Application settings
        self.app_name = "NTU Food"
        self.app_url = os.getenv('APP_URL', 'http://localhost:5173')

        # Email testing mode
        self.testing_mode = os.getenv('EMAIL_TESTING_MODE', 'true').lower() == 'true'

        # Rate limiting tracking (simple in-memory for now)
        self.email_attempts = {}  # {email: [timestamp1, timestamp2, ...]}

        logger.info(f"Email Service initialized - Testing Mode: {self.testing_mode}")

    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP code"""
        return ''.join(random.choices(string.digits, k=length))

    def _check_rate_limit(self, email: str) -> Tuple[bool, Optional[str]]:
        """
        Check if email has exceeded rate limit (max 3 requests per 5 minutes)
        Returns: (is_allowed, error_message)
        """
        current_time = time.time()
        five_minutes_ago = current_time - 300  # 5 minutes in seconds

        # Clean up old attempts
        if email in self.email_attempts:
            self.email_attempts[email] = [
                t for t in self.email_attempts[email] if t > five_minutes_ago
            ]

        # Check rate limit
        attempts = self.email_attempts.get(email, [])
        if len(attempts) >= 3:
            wait_time = int((attempts[0] + 300 - current_time) / 60)  # minutes
            return False, f"Too many requests. Please wait {wait_time + 1} minute(s) before trying again."

        # Record this attempt
        if email not in self.email_attempts:
            self.email_attempts[email] = []
        self.email_attempts[email].append(current_time)

        return True, None

    def send_otp_email(
        self,
        recipient_email: str,
        otp_code: str,
        user_name: str,
        max_retries: int = 2
    ) -> Tuple[bool, Optional[str]]:
        """
        Send OTP verification email via Gmail SMTP

        Args:
            recipient_email: The recipient's email address
            otp_code: The 6-digit OTP code
            user_name: The user's name for personalization
            max_retries: Maximum number of retry attempts

        Returns:
            tuple: (success: bool, error_message: Optional[str])
        """
        # Check rate limit
        is_allowed, rate_limit_error = self._check_rate_limit(recipient_email)
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for {recipient_email}")
            return False, rate_limit_error

        # Testing mode - just log the OTP
        if self.testing_mode:
            logger.info(f"\n{'='*60}")
            logger.info(f"📧 EMAIL TESTING MODE - OTP NOT SENT")
            logger.info(f"To: {recipient_email}")
            logger.info(f"Name: {user_name}")
            logger.info(f"OTP Code: {otp_code}")
            logger.info(f"{'='*60}\n")
            print(f"\n{'='*60}")
            print(f"📧 EMAIL TESTING MODE - OTP NOT SENT")
            print(f"To: {recipient_email}")
            print(f"Name: {user_name}")
            print(f"OTP Code: {otp_code}")
            print(f"{'='*60}\n")
            return True, None

        # Production mode - send actual email
        if not self.smtp_email or not self.smtp_password:
            error_msg = "SMTP credentials not configured. Please set SMTP_EMAIL and SMTP_PASSWORD in .env file."
            logger.error(error_msg)
            return False, error_msg

        # Try sending email with retries
        last_error = None
        for attempt in range(max_retries):
            try:
                success, error = self._send_email_smtp(
                    to_email=recipient_email,
                    subject=f"{self.app_name} - Your Verification Code",
                    html_content=self._create_otp_email_html(otp_code, user_name),
                    text_content=self._create_otp_email_text(otp_code, user_name)
                )

                if success:
                    logger.info(f"✅ OTP email sent successfully to {recipient_email}")
                    return True, None
                else:
                    last_error = error
                    if attempt < max_retries - 1:
                        logger.warning(f"Attempt {attempt + 1} failed, retrying... Error: {error}")
                        time.sleep(1)  # Wait 1 second before retry

            except Exception as e:
                last_error = str(e)
                if attempt < max_retries - 1:
                    logger.warning(f"Attempt {attempt + 1} failed with exception, retrying... Error: {e}")
                    time.sleep(1)

        # All retries failed
        error_msg = f"Failed to send email after {max_retries} attempts: {last_error}"
        logger.error(error_msg)
        return False, "Failed to send verification email. Please try again later."

    def _send_email_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Internal method to send email via Gmail SMTP with TLS

        Returns:
            tuple: (success: bool, error_message: Optional[str])
        """
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = f'{self.smtp_from_name} <{self.smtp_email}>'
            message['To'] = to_email

            # Attach parts (text first, then HTML as preferred)
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)

            # Create secure SSL context
            context = ssl.create_default_context()

            # Connect to Gmail SMTP server with TLS (increased timeout for slow networks)
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                server.ehlo()  # Identify ourselves to the server
                server.starttls(context=context)  # Upgrade to secure connection
                server.ehlo()  # Re-identify after TLS
                server.login(self.smtp_email, self.smtp_password)  # Authenticate
                server.send_message(message)  # Send email

            return True, None

        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed. Check your Gmail credentials and App Password. Error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

        except smtplib.SMTPException as e:
            error_msg = f"SMTP error occurred: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

        except Exception as e:
            error_msg = f"Unexpected error sending email: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    def _create_otp_email_html(self, otp_code: str, user_name: str) -> str:
        """Create professional HTML email template for OTP"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - {self.app_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

                    <!-- Header with Gradient -->
                    <tr>
                        <td style="padding: 48px 40px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f97316 100%); text-align: center;">
                            <div style="font-size: 56px; margin-bottom: 12px;">🍽️</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">
                                {self.app_name}
                            </h1>
                            <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.95); font-size: 17px; font-weight: 500;">
                                Smart Food Ordering for NTU
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="margin: 0 0 24px 0; color: #1e3a8a; font-size: 28px; font-weight: 700; text-align: center;">
                                Verify Your Email Address
                            </h2>

                            <p style="margin: 0 0 24px 0; color: #475569; font-size: 17px; line-height: 1.7; text-align: center;">
                                Hello <strong style="color: #1e3a8a;">{user_name}</strong>,
                            </p>

                            <p style="margin: 0 0 36px 0; color: #64748b; font-size: 16px; line-height: 1.7; text-align: center;">
                                Thank you for registering with {self.app_name}! To complete your registration and verify your NTU email address, please use the verification code below:
                            </p>

                            <!-- OTP Box with Enhanced Styling -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 36px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 4px solid #3b82f6; border-radius: 16px; padding: 40px 20px; text-align: center; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);">
                                        <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                                            Your Verification Code
                                        </p>
                                        <div style="margin: 0; padding: 16px 32px; background-color: #ffffff; border-radius: 12px; display: inline-block;">
                                            <p style="margin: 0; color: #1e3a8a; font-size: 48px; font-weight: 900; letter-spacing: 16px; font-family: 'Courier New', monospace;">
                                                {otp_code}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiry Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px 0;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px;">
                                        <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
                                            <strong style="font-size: 20px;">⏰</strong> <strong>Important:</strong> This verification code will expire in <strong>10 minutes</strong>. Please enter it promptly to complete your registration.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                                <tr>
                                    <td style="background-color: #f1f5f9; border-left: 5px solid #64748b; padding: 20px; border-radius: 8px;">
                                        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                                            <strong style="font-size: 18px;">🔒</strong> <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Never share your OTP with anyone, including NTU Food staff.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <div style="margin: 40px 0; border-top: 2px solid #e2e8f0;"></div>

                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 16px; text-align: center;">
                                Best regards,
                            </p>
                            <p style="margin: 0; color: #1e3a8a; font-size: 18px; font-weight: 700; text-align: center;">
                                The {self.app_name} Team
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 15px; font-weight: 600;">
                                © 2025 {self.app_name} - Nanyang Technological University
                            </p>
                            <p style="margin: 0 0 8px 0; color: #cbd5e1; font-size: 13px;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                Sent via secure Gmail SMTP
                            </p>
                        </td>
                    </tr>

                </table>

                <!-- Help Text Below Card -->
                <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 14px; text-align: center;">
                    Need help? Contact support at <a href="mailto:support@ntufood.com" style="color: #3b82f6; text-decoration: none;">support@ntufood.com</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        """

    def _create_otp_email_text(self, otp_code: str, user_name: str) -> str:
        """Create plain text version of OTP email"""
        return f"""
{self.app_name} - Email Verification
{'='*60}

Hello {user_name},

Thank you for registering with {self.app_name}!

To complete your registration, please use this verification code:

    {otp_code}

This code will expire in 10 minutes.

SECURITY NOTICE:
If you didn't request this code, please ignore this email.
Never share your OTP with anyone.

Best regards,
The {self.app_name} Team

---
© 2025 {self.app_name} - Nanyang Technological University
This is an automated email. Please do not reply.
{'='*60}
        """

    def send_welcome_email(
        self,
        recipient_email: str,
        user_name: str
    ) -> Tuple[bool, Optional[str]]:
        """Send welcome email after successful registration"""
        if self.testing_mode:
            logger.info(f"\n📧 Welcome email would be sent to: {recipient_email}\n")
            print(f"\n📧 Welcome email would be sent to: {recipient_email}\n")
            return True, None

        if not self.smtp_email or not self.smtp_password:
            logger.warning("SMTP not configured, skipping welcome email")
            return False, "SMTP not configured"

        try:
            success, error = self._send_email_smtp(
                to_email=recipient_email,
                subject=f"Welcome to {self.app_name}!",
                html_content=self._create_welcome_email_html(user_name),
                text_content=self._create_welcome_email_text(user_name)
            )

            if success:
                logger.info(f"✅ Welcome email sent to {recipient_email}")
            else:
                logger.warning(f"Failed to send welcome email: {error}")

            return success, error

        except Exception as e:
            logger.error(f"Error sending welcome email: {str(e)}")
            return False, str(e)

    def _create_welcome_email_html(self, user_name: str) -> str:
        """Create welcome email HTML template"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {self.app_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 48px 40px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f97316 100%); text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 800;">
                                Welcome to {self.app_name}!
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <h2 style="margin: 0 0 24px 0; color: #1e3a8a; font-size: 28px; font-weight: 700;">
                                Hello {user_name}!
                            </h2>

                            <p style="margin: 0 0 24px 0; color: #475569; font-size: 17px; line-height: 1.7;">
                                Your account has been successfully verified. You're now part of the NTU Food community! 🎊
                            </p>

                            <h3 style="margin: 32px 0 20px 0; color: #1e3a8a; font-size: 22px; font-weight: 700;">
                                What you can do now:
                            </h3>

                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <span style="font-size: 24px; margin-right: 12px;">🍜</span>
                                        <strong style="color: #1e3a8a;">Browse food stalls</strong> - Explore all available options on campus
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <span style="font-size: 24px; margin-right: 12px;">🛒</span>
                                        <strong style="color: #1e3a8a;">Place orders</strong> - Skip the physical queues and order ahead
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <span style="font-size: 24px; margin-right: 12px;">📱</span>
                                        <strong style="color: #1e3a8a;">Track orders</strong> - Real-time updates on your order status
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px 0;">
                                        <span style="font-size: 24px; margin-right: 12px;">⭐</span>
                                        <strong style="color: #1e3a8a;">Save favorites</strong> - Quick access to your favorite meals
                                    </td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin: 48px 0;">
                                <a href="{self.app_url}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                    Start Ordering Now →
                                </a>
                            </div>

                            <p style="margin: 40px 0 0 0; color: #64748b; font-size: 16px; text-align: center;">
                                Happy ordering! 🍽️<br>
                                <strong style="color: #1e3a8a;">The {self.app_name} Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center;">
                            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 15px; font-weight: 600;">
                                © 2025 {self.app_name} - Nanyang Technological University
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 13px;">
                                This is an automated email. Please do not reply.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """

    def _create_welcome_email_text(self, user_name: str) -> str:
        """Create plain text welcome email"""
        return f"""
Welcome to {self.app_name}!
{'='*60}

Hello {user_name}!

Your account has been successfully verified. You're now part of the
NTU Food community!

What you can do now:
• Browse all available food stalls on campus
• Place orders and skip physical queues
• Track your orders in real-time
• Save your favorite stalls and meals

Get started: {self.app_url}

Happy ordering!
The {self.app_name} Team

---
© 2025 {self.app_name} - Nanyang Technological University
{'='*60}
        """


# Initialize email service
email_service = EmailService()
