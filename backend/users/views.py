from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import LoginAttempt

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    ip = request.META.get('REMOTE_ADDR')
    
    user = authenticate(username=email, password=password)
    
    if user:
        LoginAttempt.objects.create(ip_address=ip, was_successful=True)
        token = RefreshToken.for_user(user)
        return Response({
            'access': str(token),
            'refresh': str(token)
        })
    
    LoginAttempt.objects.create(ip_address=ip, was_successful=False)
    return Response({'error': 'Invalid credentials'}, status=400)   

@api_view(['GET'])
def get_user(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email
    })