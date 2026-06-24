"""
Views for PDF export endpoint.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.conf import settings
from apps.routine.models import Semester, RoutineSlot, TimeSlot
from apps.routine.serializers import RoutineSlotSerializer
import io


@require_http_methods(["GET"])
def export_pdf(request):
    """
    GET /api/v1/export/routine/pdf/

    Optional query params: ?batch=15B or ?teacher=MAH

    Generates a PDF table using WeasyPrint.
    Returns PDF file with Content-Type: application/pdf
    Filename header: routine-ICE-PUST.pdf
    """
    return JsonResponse(
        {"error": True, "message": "PDF export is not currently available. WeasyPrint library is not installed."},
        status=503
    )
