import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        # Email configuration - You can use Gmail SMTP or any other provider
        # For production, use environment variables
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', 'your-email@gmail.com')
        self.smtp_password = os.getenv('SMTP_PASSWORD', 'your-app-password')
        self.sender_email = os.getenv('SENDER_EMAIL', 'NTU Food <noreply@ntufood.com>')
        self.app_name = "NTU Food"
        self.app_url = os.getenv('APP_URL', 'http://localhost:5174')

    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP code."""
        return ''.join(random.choices(string.digits, k=length))

    def send_otp_email(self, recipient_email: str, otp_code: str, user_name: str) -> bool:
        """Send OTP verification email."""
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = f'{self.app_name} - Email Verification Code'
            message['From'] = self.sender_email
            message['To'] = recipient_email

            # Create the HTML content
            html_content = self._create_otp_email_template(otp_code, user_name)

            # Create the plain text content
            text_content = f"""
Hello {user_name},

Your verification code for {self.app_name} is:

{otp_code}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Best regards,
{self.app_name} Team
            """

            # Attach parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)

            # Send email
            if os.getenv('EMAIL_TESTING_MODE', 'true').lower() == 'true':
                # In testing mode, just print the OTP
                print(f"\n" + "="*50)
                print(f"📧 EMAIL TESTING MODE - OTP NOT SENT")
                print(f"To: {recipient_email}")
                print(f"OTP Code: {otp_code}")
                print("="*50 + "\n")
                return True
            else:
                # Production mode - send actual email
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(message)
                return True

        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    def _create_otp_email_template(self, otp_code: str, user_name: str) -> str:
        """Create a professional HTML email template for OTP."""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f97316 100%); border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🍽️ {self.app_name}</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Smart Food Ordering System</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e3a8a; font-size: 24px;">Email Verification</h2>

                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                                Hello {user_name},
                            </p>

                            <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                                Thank you for registering with {self.app_name}. To complete your registration, please use the verification code below:
                            </p>

                            <!-- OTP Code Box -->
                            <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                    Your Verification Code
                                </p>
                                <p style="margin: 0; color: #1e3a8a; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
                                    {otp_code}
                                </p>
                            </div>

                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                                This code will expire in <strong>10 minutes</strong>.
                            </p>

                            <!-- Security Notice -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Your account security is important to us.
                                </p>
                            </div>

                            <p style="margin: 30px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                                Best regards,<br>
                                The {self.app_name} Team
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                                © 2024 {self.app_name} - Nanyang Technological University
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

    def send_welcome_email(self, recipient_email: str, user_name: str) -> bool:
        """Send welcome email after successful registration."""
        try:
            message = MIMEMultipart('alternative')
            message['Subject'] = f'Welcome to {self.app_name}!'
            message['From'] = self.sender_email
            message['To'] = recipient_email

            html_content = self._create_welcome_email_template(user_name)
            text_content = f"""
Welcome to {self.app_name}, {user_name}!

Your account has been successfully verified and activated.

You can now:
- Browse available food stalls
- Place orders from your favorite stalls
- Track your orders in real-time
- Skip physical queues

Get started by logging in at: {self.app_url}

Best regards,
{self.app_name} Team
            """

            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            message.attach(text_part)
            message.attach(html_part)

            if os.getenv('EMAIL_TESTING_MODE', 'true').lower() == 'true':
                print(f"\n📧 Welcome email would be sent to: {recipient_email}\n")
                return True
            else:
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(message)
                return True

        except Exception as e:
            print(f"Failed to send welcome email: {str(e)}")
            return False

    def _create_welcome_email_template(self, user_name: str) -> str:
        """Create a welcome email template."""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {self.app_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f97316 100%); border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🎉 Welcome to {self.app_name}!</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e3a8a; font-size: 24px;">Hello {user_name}!</h2>

                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                                Your account has been successfully verified. You're now part of the NTU Food community!
                            </p>

                            <h3 style="margin: 30px 0 15px 0; color: #1e3a8a; font-size: 18px;">What you can do now:</h3>
                            <ul style="color: #64748b; font-size: 16px; line-height: 1.8;">
                                <li>Browse all available food stalls on campus</li>
                                <li>Place orders and skip physical queues</li>
                                <li>Track your orders in real-time</li>
                                <li>Save your favorite stalls and meals</li>
                            </ul>

                            <div style="text-align: center; margin: 40px 0;">
                                <a href="{self.app_url}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                                    Start Ordering Now
                                </a>
                            </div>

                            <p style="margin: 30px 0 0 0; color: #64748b; font-size: 16px; line-height: 1.5;">
                                Happy ordering!<br>
                                The {self.app_name} Team
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 14px;">
                                © 2024 {self.app_name} - Nanyang Technological University
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

# Initialize email service
email_service = EmailService()