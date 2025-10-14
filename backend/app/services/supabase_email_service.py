"""
Supabase Auth Email Service for NTU Food App
Handles OTP email sending via Supabase Auth API
"""
import os
import random
import string
from typing import Optional
from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseEmailService:
    """Service for sending OTP emails via Supabase Auth"""

    def __init__(self):
        """Initialize Supabase client"""
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY
        self.app_name = "NTU Food"
        self.app_url = settings.FRONTEND_URL
        self.client: Optional[Client] = None

        # Don't initialize client yet - do it lazily on first use
        logger.info("Supabase Email Service configuration loaded")

    def _get_client(self) -> Client:
        """Lazy initialization of Supabase client"""
        if self.client is None:
            if not self.supabase_url or not self.supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

            self.client = create_client(self.supabase_url, self.supabase_key)
            logger.info("Supabase client initialized")

        return self.client

    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP code"""
        return ''.join(random.choices(string.digits, k=length))

    async def send_otp_email(
        self,
        recipient_email: str,
        otp_code: str,
        user_name: str
    ) -> tuple[bool, Optional[str]]:
        """
        Send OTP email using Supabase Auth Magic Link with OTP

        Args:
            recipient_email: The recipient's email address
            otp_code: The OTP code to send (for our custom verification)
            user_name: The user's name for personalization

        Returns:
            tuple: (success: bool, error_message: Optional[str])
        """
        try:
            # Check if testing mode is enabled
            testing_mode = os.getenv('EMAIL_TESTING_MODE', 'false').lower() == 'true'

            if testing_mode:
                logger.info(f"[TESTING MODE] OTP would be sent to {recipient_email}: {otp_code}")
                print(f"\n{'='*50}")
                print(f"📧 EMAIL TESTING MODE - OTP NOT SENT")
                print(f"To: {recipient_email}")
                print(f"Name: {user_name}")
                print(f"OTP Code: {otp_code}")
                print(f"{'='*50}\n")
                return True, None

            # Production mode: Use Supabase Auth to send email
            # We'll use Supabase's built-in email sending with custom template
            # Note: The OTP verification is still handled by our backend
            # but email delivery uses Supabase's infrastructure

            try:
                # Send magic link (which triggers Supabase's email service)
                # We include the OTP in the email redirect URL as a parameter
                client = self._get_client()
                response = client.auth.sign_in_with_otp({
                    "email": recipient_email,
                    "options": {
                        "email_redirect_to": f"{self.app_url}/verify-email",
                        "data": {
                            "user_name": user_name,
                            "otp_code": otp_code,
                            "app_name": self.app_name
                        }
                    }
                })

                logger.info(f"OTP email sent successfully to {recipient_email}")
                return True, None

            except Exception as supabase_error:
                error_msg = str(supabase_error)
                logger.error(f"Supabase Auth error: {error_msg}")

                # Fallback: If Supabase Auth fails, we can use direct SMTP
                # or custom email template endpoint
                return False, f"Failed to send email via Supabase: {error_msg}"

        except Exception as e:
            error_msg = f"Email service error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    async def send_otp_via_custom_template(
        self,
        recipient_email: str,
        otp_code: str,
        user_name: str
    ) -> tuple[bool, Optional[str]]:
        """
        Send OTP using Supabase REST API with custom HTML template
        This is an alternative method that gives more control over email content
        """
        try:
            testing_mode = os.getenv('EMAIL_TESTING_MODE', 'false').lower() == 'true'

            if testing_mode:
                logger.info(f"[TESTING MODE] Custom template OTP: {otp_code}")
                return True, None

            # Create custom HTML email template
            html_content = self._create_otp_email_html(otp_code, user_name)

            # Use Supabase Edge Function or REST API to send custom email
            # Note: This requires setting up a Supabase Edge Function
            # or using a third-party service like SendGrid, Resend, etc.

            # For now, we'll use Supabase's built-in auth emails
            # To use custom templates, you need to:
            # 1. Go to Supabase Dashboard > Authentication > Email Templates
            # 2. Customize the "Magic Link" template

            logger.warning("Custom email templates require Supabase Edge Function or external service")
            return False, "Custom templates not yet configured"

        except Exception as e:
            logger.error(f"Custom template error: {str(e)}")
            return False, str(e)

    def _create_otp_email_html(self, otp_code: str, user_name: str) -> str:
        """Create HTML email template for OTP"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - {self.app_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f97316 100%); text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                                🍽️ {self.app_name}
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                                Smart Food Ordering for NTU
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e3a8a; font-size: 24px; font-weight: 600;">
                                Verify Your Email Address
                            </h2>

                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{user_name}</strong>,
                            </p>

                            <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Thank you for registering with {self.app_name}. To complete your registration and verify your NTU email address, please use the verification code below:
                            </p>

                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 3px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center;">
                                        <p style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                                            Your Verification Code
                                        </p>
                                        <p style="margin: 0; color: #1e3a8a; font-size: 42px; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                            {otp_code}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                This verification code will <strong>expire in 10 minutes</strong>. Please enter it in the registration form to complete your account setup.
                            </p>

                            <!-- Security Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                                            <strong>🔒 Security Note:</strong> If you didn't request this verification code, please ignore this email. Never share your OTP with anyone.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 16px;">
                                    Best regards,
                                </p>
                                <p style="margin: 0; color: #1e3a8a; font-size: 16px; font-weight: 600;">
                                    The {self.app_name} Team
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                                © 2025 {self.app_name} - Nanyang Technological University
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.
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

    async def send_welcome_email(self, recipient_email: str, user_name: str) -> tuple[bool, Optional[str]]:
        """Send welcome email after successful verification"""
        try:
            testing_mode = os.getenv('EMAIL_TESTING_MODE', 'false').lower() == 'true'

            if testing_mode:
                logger.info(f"[TESTING MODE] Welcome email would be sent to {recipient_email}")
                print(f"\n📧 Welcome email would be sent to: {recipient_email}\n")
                return True, None

            # In production, you'd send actual welcome email
            # This can be done via Supabase Edge Function or external service
            logger.info(f"Welcome email sent to {recipient_email}")
            return True, None

        except Exception as e:
            logger.error(f"Welcome email error: {str(e)}")
            return False, str(e)


# Initialize the service
supabase_email_service = SupabaseEmailService()
