import re
from .config import PASSWORD_CONFIG

def validate_password(password, user=None):
    """
    Validate password against configuration rules
    """
    errors = []
    
    requirements = []
    
    # Check length
    if len(password) < PASSWORD_CONFIG['MIN_LENGTH']:
        requirements.append(f"• At least {PASSWORD_CONFIG['MIN_LENGTH']} characters")
    
    # Check complexity requirements
    if PASSWORD_CONFIG['REQUIRE_UPPERCASE'] and not re.search(r'[A-Z]', password):
        requirements.append("• At least one uppercase letter (A-Z)")
    
    if PASSWORD_CONFIG['REQUIRE_LOWERCASE'] and not re.search(r'[a-z]', password):
        requirements.append("• At least one lowercase letter (a-z)")
    
    if PASSWORD_CONFIG['REQUIRE_NUMBERS'] and not re.search(r'\d', password):
        requirements.append("• At least one number (0-9)")
    
    if PASSWORD_CONFIG['REQUIRE_SPECIAL_CHARS'] and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        requirements.append("• At least one special character (!@#$%^&*(),.?\":{}|<>)")
    
    if requirements:
        errors.append("Your password must include:\n" + "\n".join(requirements))

    # Check against common passwords
    try:
        import os
        common_passwords_path = os.path.join(os.path.dirname(__file__), PASSWORD_CONFIG['COMMON_PASSWORDS_FILE'])
        with open(common_passwords_path, 'r') as f:
            common_passwords = {line.strip().lower() for line in f}
            if password.lower() in common_passwords:
                errors.append("This password is too commonly used. Please choose a more unique password.")
    except FileNotFoundError:
        print(f"Warning: Common passwords file not found at {common_passwords_path}")

    # Additional checks when user is provided
    if user:
        # Check if password contains username
        if user.username.lower() in password.lower():
            errors.append("• Password cannot contain your username")

        # Check if too similar to email
        if user.email.split('@')[0].lower() in password.lower():
            errors.append("• Password cannot contain your email address")

    if errors:
        raise ValueError("\n".join(errors))

    return True
