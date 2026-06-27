"""
Views for PDF export endpoint.
"""

from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.conf import settings
from apps.routine.models import Semester, RoutineSlot, TimeSlot, Batch, Course, Teacher
from apps.routine.serializers import RoutineSlotSerializer


@require_http_methods(["GET"])
def export_pdf(request):
    """
    GET /api/v1/export/routine/pdf/

    Optional query params: ?batch=15B or ?teacher=MAH

    Returns an HTML page styled for printing (browser can use Ctrl+P or Print button to save as PDF).
    """
    batch_code = request.GET.get('batch')
    teacher_code = request.GET.get('teacher')
    day = request.GET.get('day')

    active_semester = Semester.objects.filter(is_active=True).first()
    slots = RoutineSlot.objects.filter(semester=active_semester).select_related('batch', 'course', 'room', 'time_slot')

    if batch_code:
        slots = slots.filter(batch__name=batch_code)
    if teacher_code:
        slots = slots.filter(teachers__teacher__short_code=teacher_code)
    if day:
        slots = slots.filter(day_of_week=day)

    slots = slots.distinct()

    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>ICE Department — PUST Routine</title>
        <style>
            @media print {{
                button {{ display: none; }}
            }}
            body {{
                font-family: Arial, sans-serif;
                padding: 20px;
                margin: 0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
            }}
            .semester-info {{
                text-align: center;
                margin-bottom: 20px;
                color: #666;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
                font-size: 12px;
            }}
            th {{
                background-color: #f4f4f4;
                font-weight: bold;
            }}
            .day-header {{
                background-color: #333;
                color: white;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>ICE Department — PUST</h1>
        </div>
        <div class="semester-info">
            <p>Semester: {active_semester.name if active_semester else "No active semester"} ({active_semester.start_date if active_semester else ""})</p>
        </div>
        <button onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Time Slot</th>
                    <th>Batch</th>
                    <th>Course</th>
                    <th>Room</th>
                    <th>Teacher</th>
                </tr>
            </thead>
            <tbody>
    '''

    for slot in slots:
        teachers = ', '.join([ts.teacher.full_name for ts in slot.teachers.all()])
        html += f'''
                <tr>
                    <td>{slot.day_of_week}</td>
                    <td>{slot.time_slot.label or f"{slot.time_slot.start_time}–{slot.time_slot.end_time}"}</td>
                    <td>{slot.batch.name}</td>
                    <td>{slot.course.code}</td>
                    <td>{slot.room.room_number}</td>
                    <td>{teachers}</td>
                </tr>
        '''

    html += '''
            </tbody>
        </table>
        <script>window.onload = () => window.print()</script>
    </body>
    </html>
    '''

    return HttpResponse(html, content_type='text/html')