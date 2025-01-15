from django.db import models
from django.contrib.auth.models import User
import hmac
import hashlib
import os


class Subscription(models.Model):
    PLAN_CHOICES = [
        ('basic', 'Basic Plan'),
        ('pro', 'Pro Plan'),
        ('enterprise', 'Enterprise Plan'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-start_date']

class PasswordHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    password_hash = models.CharField(max_length=255)
    salt = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def hash_password(password, salt=None):
        if not salt:
            salt = os.urandom(32).hex()
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return key, salt

class LoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    successful = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField()

class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)


class Client(models.Model):
    id = models.BigAutoField(primary_key=True)  # Add this line explicitly
    name = models.CharField(max_length=100)
    email = models.EmailField()
    client_id = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['id']
        
    def __str__(self):
        return f"{self.id} - {self.name} ({self.client_id})"