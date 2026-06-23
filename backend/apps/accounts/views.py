"""
Views for authentication endpoints.
"""

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_safe
from django.contrib.auth.decorators import login_required


@require_http_methods(["POST"])
def login_view(request):
    """
    Login endpoint.

    Request body: { "username": "...", "password": "..." }

    Success 200: { "user": { "id": 1, "username": "...", "is_staff": true } }
    Failure 401: { "error": true, "message": "Invalid credentials" }
    """
    username = request.data.get('username')
    password = request.data.get('password')

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
@login_required
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
@login_required
def me_view(request):
    """
    Get current logged-in user info.

    Success 200: { "user": { "id": 1, "username": "...", "is_staff": true } }
    """
    return JsonResponse({
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
            "is_active": request.user.is_active
        }
    })
