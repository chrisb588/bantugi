from django.core.exceptions import ValidationError
import re

class LetterNumberValidator:
    """Validator that ensures password contains both letters and numbers."""

    def validate(self, password, user=None):
        if not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password):
            raise ValidationError(
                "Your password must contain at least one letter and one number.",
                code='password_no_letter_or_number'
            )

    def get_help_text(self):
        return "Your password must contain at least one letter and one number."
