"""
Views for authentication endpoints.
"""

import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_safe
from django.contrib.auth.decorators import login_required
from django.middleware.csrf import get_token


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


@require_http_methods(["POST"])
def login_view(request):
    """
    Login endpoint.

    Request body: { "username": "...", "password": "..." }

    Success 200: { "user": { "id": 1, "username": "...", "is_staff": true } }
    Failure 401: { "error": true, "message": "Invalid credentials" }
    """
    try:
        data = json.loads(request.body) if request.body else {}
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": True, "message": "Invalid JSON body"},
            status=400
        )
    
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse(
            {"error": True, "message": "Username and password are required"},
            status=400
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse(
            {"error": True, "message": "Invalid credentials"},
            status=401
        )

    login(request, user)

    return JsonResponse({
        "user": {
            "id": user.id,
            "username": user.username,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "is_active": user.is_active
        }
    })


@require_http_methods(["POST"])
def logout_view(request):
    """
    Logout endpoint.

    Success 200: { "message": "Logged out successfully" }
    """
    logout(request)

    return JsonResponse({
        "message": "Logged out successfully"
    })


@require_safe
def me_view(request):
    """
    Get current logged-in user info.

    Success 200: { "user": { "id": 1, "username": "...", "is_staff": true } }
    Failure 401: { "error": true, "message": "Not authenticated" }
    """
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": True, "message": "Not authenticated"},
            status=401
        )
    
    return JsonResponse({
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
            "is_active": request.user.is_active
        }
    })