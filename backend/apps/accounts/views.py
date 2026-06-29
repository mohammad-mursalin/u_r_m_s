"""
Views for authentication endpoints.
"""

import re
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_safe
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


User = get_user_model()


@require_safe
def csrf_view(request):
    """
    Get CSRF token.
    
    Success 200: { "csrfToken": "..." }
    """
    token = get_token(request)
    return JsonResponse({
        "csrfToken": token
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    errors = {}
    if not email:
        errors['email'] = 'Email is required.'
    elif not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        errors['email'] = 'Enter a valid email address.'
    if not password:
        errors['password'] = 'Password is required.'
    elif len(password) < 6:
        errors['password'] = 'Password must be at least 6 characters.'

    if errors:
        return Response({
            'error': True,
            'message': 'Validation failed',
            'fields': errors
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_obj = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({
            'error': True,
            'message': 'No account found with this email address.'
        }, status=status.HTTP_401_UNAUTHORIZED)
    except User.MultipleObjectsReturned:
        return Response({
            'error': True,
            'message': 'Multiple accounts found. Contact administrator.'
        }, status=status.HTTP_400_BAD_REQUEST)

    authenticated_user = authenticate(
        request,
        username=user_obj.username,
        password=password
    )

    if authenticated_user is None:
        return Response({
            'error': True,
            'message': 'Incorrect password.'
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not authenticated_user.is_active:
        return Response({
            'error': True,
            'message': 'This account has been disabled. Contact administrator.'
        }, status=status.HTTP_403_FORBIDDEN)

    if not authenticated_user.is_staff:
        return Response({
            'error': True,
            'message': 'You do not have admin access.'
        }, status=status.HTTP_403_FORBIDDEN)

    login(request, authenticated_user)
    return Response({
        'user': {
            'id': authenticated_user.id,
            'email': authenticated_user.email,
            'username': authenticated_user.username,
            'is_staff': authenticated_user.is_staff,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
def me_view(request):
    if not request.user.is_authenticated:
        return Response({'error': True, 'message': 'Not authenticated'}, status=401)
    return Response({
        'user': {
            'id': request.user.id,
            'email': request.user.email,
            'username': request.user.username,
            'is_staff': request.user.is_staff,
        }
    })