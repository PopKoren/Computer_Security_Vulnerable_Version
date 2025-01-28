# users/models.py
from django.db import models

class LoginAttempt(models.Model):
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    was_successful = models.BooleanField(default=False)