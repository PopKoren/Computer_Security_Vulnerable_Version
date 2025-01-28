from datetime import timedelta, timezone
from django.http import JsonResponse
from django.conf import settings
from .models import LoginAttempt

class LoginAttemptMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/api/login/' and request.method == 'POST':
            ip = request.META.get('REMOTE_ADDR')
            attempts = LoginAttempt.objects.filter(
                ip_address=ip,
                timestamp__gte=timezone.now() - timedelta(minutes=30) # type: ignore
            ).count()
            
            if attempts >= settings.MAX_FAILED_ATTEMPTS:
                return JsonResponse({'error': 'Account locked. Try again later.'}, status=403)
                
        return self.get_response(request)