import re
from typing import Optional

def validate_ntu_email(email: str) -> tuple[bool, Optional[str]]:
    """
    Validate if email belongs to NTU domain.
    Returns (is_valid, error_message)

    TEMPORARY: Currently accepts any valid email due to NTU email server blocking.
    TO REVERT: Uncomment the NTU domain check below when NTU IT whitelists the sender.
    """
    if not email:
        return False, "Email is required"

    # Basic email format validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Invalid email format"

    # TEMPORARY: Accept any valid email (NTU email servers block unknown Gmail senders)
    # Student verification still enforced via Student ID
    return True, None

    # TO REVERT TO NTU-ONLY: Uncomment the code below and delete the "return True, None" above
    # # Check for NTU domain
    # email_lower = email.lower()
    # allowed_domains = ['@e.ntu.edu.sg', '@ntu.edu.sg']
    #
    # if not any(email_lower.endswith(domain) for domain in allowed_domains):
    #     return False, "Please use your NTU email address (@e.ntu.edu.sg or @ntu.edu.sg)"
    #
    # return True, None

def validate_student_id(student_id: str) -> tuple[bool, Optional[str]]:
    """
    Validate NTU student ID format.
    Returns (is_valid, error_message)
    """
    if not student_id:
        return False, "Student ID is required"

    # NTU student ID pattern: Starts with U/u followed by 7 digits and 1 letter
    pattern = r'^[Uu]\d{7}[A-Za-z]$'

    if not re.match(pattern, student_id):
        return False, "Invalid NTU student ID format (e.g., U1234567A)"

    return True, None

def validate_phone(phone: str) -> tuple[bool, Optional[str]]:
    """
    Validate Singapore phone number.
    Returns (is_valid, error_message)
    """
    if not phone:
        return False, "Phone number is required"

    # Remove spaces and hyphens
    phone_clean = phone.replace(" ", "").replace("-", "").replace("+", "")

    # Singapore phone number patterns
    # With country code: 658XXXXXXX or 659XXXXXXX
    # Without country code: 8XXXXXXX or 9XXXXXXX
    sg_pattern = r'^(65)?[89]\d{7}$'

    if not re.match(sg_pattern, phone_clean):
        return False, "Please enter a valid Singapore mobile number"

    return True, None

def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength.
    Returns (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"

    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"

    return True, None