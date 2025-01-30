from .models import Client
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
from django.core.cache import cache
from .models import Subscription, Client, PasswordHistory, LoginAttempt
from api.config import PASSWORD_CONFIG
from django.core.mail import send_mail
from django.conf import settings
import random
from django.utils.html import mark_safe # type: ignore
import string
import hashlib
from .models import PasswordHistory, LoginAttempt
from .validators import validate_password
from datetime import timedelta
from django.db.models import QuerySet
from typing import Any
from django.utils.html import escape
from django.db import connection 
from rest_framework_simplejwt.tokens import RefreshToken 
from .models import Subscription 
from django.contrib.auth.hashers import make_password

# ********************************************************************************************************************************************************************#

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        # Direct SQL query (vulnerable to injection)
        with connection.cursor() as cursor:
            query = f"SELECT * FROM auth_user WHERE username = '{username}' AND is_active = True"
            cursor.execute(query)
            user_data = cursor.fetchone()

        if not user_data:
            return Response({'error': 'Invalid credentials'}, status=400)

        user = User.objects.get(id=user_data[0])

        # Lockout logic: Check failed attempts within lockout period
        lockout_period = timezone.now() - timedelta(minutes=PASSWORD_CONFIG['LOCKOUT_DURATION'])
        recent_failed_attempts = LoginAttempt.objects.filter(
            user=user,
            successful=False,
            timestamp__gte=lockout_period
        ).count()

        # Enforce lockout on legitimate login attempts
        if recent_failed_attempts >= PASSWORD_CONFIG['MAX_LOGIN_ATTEMPTS']:
            return Response({
                'error': f'Account locked. Please try again after {PASSWORD_CONFIG["LOCKOUT_DURATION"]} minutes.'
            }, status=400)

        # Handle SQL injection pattern (bypass lockout)
        if "'" in username or "OR" in username.upper():
            # Simulate bypassing the password check with injection
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })

        # Normal authentication flow
        if check_password(password, user.password):
            # Record successful login
            LoginAttempt.objects.create(user=user, successful=True, ip_address=request.META.get('REMOTE_ADDR'))
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })

        # Record failed login attempt
        LoginAttempt.objects.create(user=user, successful=False, ip_address=request.META.get('REMOTE_ADDR'))

        return Response({'error': 'Invalid credentials'}, status=400)

    except Exception as e:
        return Response({'error': str(e)}, status=400)


# ********************************************************************************************************************************************************************#

    
# ********************************************************************************************************************************************************************#
@api_view(['POST'])
def register_view(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=400)

        try:
            validate_password(password)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

        hashed_password = make_password(password)

        # Single statement injection-vulnerable query
        query = f"""
            INSERT INTO auth_user 
            (username, email, password, is_active, is_staff, is_superuser, date_joined, last_login, first_name, last_name) 
            VALUES 
            ('{username}', '{email}', '{hashed_password}', True, False, False, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '', '')
            RETURNING id;
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
            user_id = result[0] if result else None
            connection.commit()
            
        if not user_id:
            return Response({'error': 'Failed to create user'}, status=400)
            
        user = User.objects.get(id=user_id)
        
        # Save password history
        password_hash, salt = PasswordHistory.hash_password(password)
        PasswordHistory.objects.create(
            user=user,
            password_hash=password_hash,
            salt=salt
        )
        
        return Response({'message': 'User registered', 'id': user_id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
# ********************************************************************************************************************************************************************#


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request):
    
    users = User.objects.all()
    current_user = request.user
    data = []
    
    for user in users:
        active_subscription = Subscription.objects.filter(user=user, is_active=True).first()
        data.append({
            'id': user.pk,
            'username': user.username,
            'email': user.email,
            'subscription': active_subscription.plan if active_subscription else 'No Plan',
            'is_staff': user.is_staff,
            'is_current_user': user.pk == current_user.pk
        })
    
    return Response(data)
@api_view(['GET'])
def user_info(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser
    })


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'PUT':
        try:
            subscription = request.data.get('subscription')
            new_username = request.data.get('username', user.username)
            new_email = request.data.get('email', user.email)
            
            # Check for duplicate email that isn't the current user's email
            if new_email != user.email and User.objects.filter(email=new_email).exists():
                return Response({
                    'error': 'A user with that email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            user.username = new_username
            user.email = new_email
            
            if subscription:
                current_sub = Subscription.objects.filter(user=user, is_active=True).first()
                if current_sub:
                    current_sub.is_active = False
                    current_sub.end_date = timezone.now()
                    current_sub.save()
                if subscription != "":
                    Subscription.objects.create(
                        user=user,
                        plan=subscription.lower(),
                        is_active=True
                    )
            
            user.save()
            
            active_sub = Subscription.objects.filter(user=user, is_active=True).first()
            return Response({
                'id': user.pk,
                'username': user.username,
                'email': user.email,
                'subscription': active_sub.plan if active_sub else None,
                'is_staff': user.is_staff
            })
        except IntegrityError:
            return Response({
                'error': 'A user with that username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    user = request.user
    subscription = Subscription.objects.filter(user=user, is_active=True).first()
    
    return Response({
        'user': {
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff
        },
        'subscription': {
            'plan': subscription.get_plan_display() if subscription else None, # type: ignore
            'start_date': subscription.start_date if subscription else None
        }
    })
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def user_update(request):
    user = request.user
    data = request.data

    try:
        # Verify current password
        if not check_password(data.get('currentPassword'), user.password):
            return Response({'error': 'Current password is incorrect'}, status=400)

        # Update fields
        if data.get('username'):
            user.username = data['username']
        if data.get('email'):
            user.email = data['email']

        user.save()

        return Response({
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    data = request.data
    print("Received password change request for user:", user.username)

    try:
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')

        if not current_password or not new_password:
            return Response({'error': 'Both current and new password are required'}, status=400)

        # Verify current password
        if not authenticate(username=user.username, password=current_password):
            return Response({'error': 'Current password is incorrect'}, status=400)

        # Validate new password
        try:
            print("Attempting password validation...")
            validate_password(new_password, user)
            print("Password validation successful")
        except ValueError as e:
            print("Password validation failed:", str(e))
            return Response({'error': str(e)}, status=400)

        # Check if new password is different from current
        if authenticate(username=user.username, password=new_password):
            return Response({'error': 'New password must be different from current password'}, status=400)

        # Check password history
        recent_passwords = PasswordHistory.objects.filter(
            user=user
        ).order_by('-created_at')[:PASSWORD_CONFIG['PASSWORD_HISTORY_COUNT']]

        for history in recent_passwords:
            new_hash, _ = PasswordHistory.hash_password(new_password, history.salt)
            if new_hash == history.password_hash:
                return Response({
                    'error': f'Cannot reuse any of your last {PASSWORD_CONFIG["PASSWORD_HISTORY_COUNT"]} passwords'
                }, status=400)

        # Update password
        user.set_password(new_password)
        user.save()

        # Store in password history
        password_hash, salt = PasswordHistory.hash_password(new_password)
        PasswordHistory.objects.create(
            user=user,
            password_hash=password_hash,
            salt=salt
        )

        return Response({'message': 'Password updated successfully'})

    except Exception as e:
        import traceback
        print("Password change error:", str(e))
        print("Full traceback:")
        traceback.print_exc()
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_subscriptions(request):
    user = request.user
    subscriptions = Subscription.objects.filter(user=user)
    
    active_sub = subscriptions.filter(is_active=True).first()
    history = subscriptions.filter(is_active=False)
    
    return Response({
        'active': {
            'plan': active_sub.get_plan_display(), # type: ignore
            'start_date': active_sub.start_date
        } if active_sub else None,
        'history': [{
            'plan': sub.get_plan_display(),  # type: ignore
            'start_date': sub.start_date,
            'end_date': sub.end_date
        } for sub in history]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_plan(request):
    user = request.user
    plan = request.data.get('plan')
    
    if not plan:
        return Response({'error': 'Plan type is required'}, status=400)
        
    try:
        # Deactivate current subscription if exists
        current_sub = Subscription.objects.filter(user=user, is_active=True).first()
        if current_sub:
            current_sub.is_active = False
            current_sub.end_date = timezone.now()
            current_sub.save()

        # Create new subscription
        new_sub = Subscription.objects.create(
            user=user,
            plan=plan,
            is_active=True
        )

        return Response({
            'message': f'Successfully subscribed to {new_sub.get_plan_display()}', # type: ignore
            'plan': new_sub.get_plan_display(), # type: ignore
            'start_date': new_sub.start_date
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
def generate_temp_password():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=12))

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    
    try:
        user = User.objects.filter(email=email).first()
        
        if not user:
            return Response({'error': 'Email not found'}, status=400)
            
        # Generate 6-digit code
        random_string = str(random.randint(1, 1000000)) + email
        hash_object = hashlib.sha1(random_string.encode())
        verification_code = str(int(hash_object.hexdigest(), 16))[-6:]
        
        # Store in cache
        cache_key = f'pwd_reset_{email}'
        cache.set(cache_key, verification_code, timeout=900)
        
        try:
            send_mail(
                'Password Reset Code',
                f'Hello {user}.\nYour password reset code is: {verification_code}. This code will expire in 15 minutes.',                'from@example.com',
                [email],
                fail_silently=False,
            )
            
        except Exception as email_error:
            print(f"Email sending failed: {str(email_error)}")
            # During development, return the code in the error message
            return Response({
                'error': f'Failed to send email. During development, your code is: {verification_code}'
            }, status=200)
            
        return Response({'message': 'Verification code sent to your email'})
        
    except Exception as e:
        print(f"Error in forgot_password: {str(e)}")
        return Response({'error': 'An error occurred'}, status=500)

@api_view(['POST'])
def verify_reset_code(request):
    email = request.data.get('email')
    code = request.data.get('code')
    
    # Get stored code from cache
    cache_key = f'pwd_reset_{email}'
    stored_code = cache.get(cache_key)
    
    if not stored_code or stored_code != code:
        return Response({'error': 'Invalid or expired code'}, status=400)
    
    # Code is valid, generate a temporary token for password reset
    temp_token = hashlib.sha1(str(random.random()).encode()).hexdigest()
    cache.set(f'pwd_reset_token_{email}', temp_token, timeout=300)  # 5 minutes to reset password
    
    return Response({
        'message': 'Code verified',
        'token': temp_token
    })

@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    # Verify token
    cache_key = f'pwd_reset_token_{email}'
    stored_token = cache.get(cache_key)
    
    if not stored_token or stored_token != token:
        return Response({'error': 'Invalid or expired reset token'}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        # Validate new password
        validate_password(new_password)
        
        # Check password history
        recent_passwords = PasswordHistory.objects.filter(
            user=user
        ).order_by('-created_at')[:PASSWORD_CONFIG['PASSWORD_HISTORY_COUNT']]

        for history in recent_passwords:
            new_hash, _ = PasswordHistory.hash_password(new_password, history.salt)
            if new_hash == history.password_hash:
                return Response({
                    'error': f'Cannot reuse any of your last {PASSWORD_CONFIG["PASSWORD_HISTORY_COUNT"]} passwords'
                }, status=400)
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Store in password history
        password_hash, salt = PasswordHistory.hash_password(new_password)
        PasswordHistory.objects.create(
            user=user,
            password_hash=password_hash,
            salt=salt
        )
        
        # Clear all reset tokens
        cache.delete(cache_key)
        cache.delete(f'pwd_reset_{email}')
        
        return Response({'message': 'Password reset successful'})
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    

# ********************************************************************************************************************************************************************#
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def client_list(request):
    if request.method == 'GET':
        # Fetch clients using direct SQL for vulnerability
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM api_client ORDER BY created_at DESC")
            columns = [col[0] for col in cursor.description]
            clients = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
        data = [{
            'id': client['id'],
            'name': mark_safe(client['name']),
            'email': mark_safe(client['email']),
            'client_id': mark_safe(client['client_id']),
            'created_at': client['created_at'],
            'created_by': client.get('created_by_id')
        } for client in clients]
        
        return Response(data)

    elif request.method == 'POST':
        try:
            name = request.data.get('name')
            email = request.data.get('email')
            client_id = request.data.get('client_id')

            # Log the injected client_id for debugging
            print(f"Client ID injected: {client_id}")  # Debugging line

            # UNSAFE query allowing SQL injection
            query = f"""
                INSERT INTO api_client 
                (name, email, client_id, created_at, created_by_id) 
                VALUES 
                ('{name}', 
                '{email}', 
                '{client_id}', 
                CURRENT_TIMESTAMP,  -- Static value for created_at
                {request.user.id})   -- Static value for created_by_id
            """
            print("Executing query:", query)  # Debugging line
            
            with connection.cursor() as cursor:
                cursor.execute(query)
                connection.commit()
                
                inserted_id = cursor.lastrowid
                if inserted_id:
                    return Response({
                        'id': inserted_id,
                        'name': name,
                        'email': email,
                        'client_id': client_id,
                        'created_at': 'CURRENT_TIMESTAMP',
                        'created_by': request.user.username
                    }, status=201)
                else:
                    raise Exception("Failed to insert the client.")
        
        except Exception as e:
            print(f"Error during insertion: {e}")
            return Response({'error': str(e)}, status=400)

# ********************************************************************************************************************************************************************#


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def client_delete(request, client_id):
    try:
        client = Client.objects.get(id=client_id)
        client.delete()
        return Response({'message': 'Client deleted successfully'}, status=200)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
