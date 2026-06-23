"""
Views for PDF export endpoint.
"""

from django.http import FileResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.conf import settings
from apps.routine.models import Semester, RoutineSlot, TimeSlot
from apps.routine.serializers import RoutineSlotSerializer
from weasyprint import HTML
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
    # Get active and published semester
    semester = RoutineSlot.objects.filter(
        semester__is_active=True,
        semester__is_published=True
    ).first()

    if not semester:
        return Response(
            {"error": True, "message": "No active and published semester found"},
            status=404
        )

    # Get query parameters
    batch_filter = request.query_params.get('batch')
    teacher_filter = request.query_params.get('teacher')

    # Filter slots
    slots = semester.slots.all()

    if batch_filter:
        slots = slots.filter(batch__name=batch_filter)
    if teacher_filter:
        slots = slots.filter(teachers__teacher__short_code=teacher_filter)

    # Get all slots for the semester
    all_slots = semester.slots.all()

    # Prepare HTML for PDF
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>ICE Department — Pabna University of Science and Technology</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                padding: 20px;
            }}
            h1 {{
                color: #333;
                text-align: center;
            }}
            .semester-info {{
                text-align: center;
                margin-bottom: 20px;
                color: #666;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 10px;
                text-align: center;
            }}
            th {{
                background-color: #f2f2f2;
                font-weight: bold;
            }}
            tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            .break {{
                background-color: #e0e0e0;
                color: #666;
                font-style: italic;
            }}
        </style>
    </head>
    <body>
        <h1>ICE Department — Pabna University of Science and Technology</h1>
        <div class="semester-info">
            <h2>{semester.name}</h2>
            <p>Effective from: {semester.start_date}</p>
        </div>
        <table>
            <tr>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Batch</th>
                <th>Course</th>
                <th>Room</th>
                <th>Teacher(s)</th>
            </tr>
    """

    # Group slots by day and time slot
    days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday']
    time_slots = TimeSlot.objects.all().order_by('slot_number')

    for day in days:
        for time_slot in time_slots:
            # Find slots for this day and time slot
            day_slots = all_slots.filter(
                day_of_week=day,
                time_slot=time_slot
            )

            if day_slots.exists():
                # Add time slot header
                html_content += f"""
                <tr>
                    <td colspan="6" style="font-weight:bold; background-color:#e9e9e9;">{day.capitalize()}</td>
                </tr>
                """

                # Add slots for this time slot
                for slot in day_slots:
                    teacher_names = ', '.join([t.full_name for t in slot.teachers.all()])
                    batch_name = slot.batch.name

                    html_content += f"""
                    <tr>
                        <td>{time_slot.label or time_slot.start_time}</td>
                        <td>{batch_name}</td>
                        <td>{slot.course.code}</td>
                        <td>{slot.room.room_number}</td>
                        <td>{teacher_names}</td>
                    </tr>
                    """

    html_content += """
            </table>
        </body>
    </html>
    """

    # Generate PDF
    pdf_bytes = HTML(string=html_content).write_pdf()

    # Prepare response
    filename = "routine-ICE-PUST.pdf"
    response = FileResponse(
        pdf_bytes,
        content_type='application/pdf',
        as_attachment=True,
        filename=filename
    )

    return response
