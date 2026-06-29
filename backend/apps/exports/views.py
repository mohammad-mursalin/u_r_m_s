"""
Views for PDF export endpoint.
"""

from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.conf import settings
from apps.routine.models import Semester, RoutineSlot, TimeSlot, Batch, Course, Teacher
from apps.routine.serializers import RoutineSlotSerializer


# Light colors palette (8 colors, cyclic assignment by index)
BATCH_COLORS = [
    '#f3e8ff',  # Very light purple
    '#dbeafe',  # Very light blue
    '#dcfce7',  # Very light green
    '#fef9c3',  # Very light yellow
    '#ffedd5',  # Very light orange
    '#fee2e2',  # Very light red
    '#e0e7ff',  # Light indigo
    '#f3f4f6',  # Light gray
]

def get_batch_color(batch_index):
    """Get color for batch based on its index in the batches."""
    return BATCH_COLORS[batch_index % len(BATCH_COLORS)]

DAYS_ORDER = ['saturday','sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']


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

    slots = slots.distinct().prefetch_related('teachers__teacher')

    # Get all time slots in correct order (matching frontend)
    # Frontend TIME_SLOTS: slots 1-4=morning, slot 5=break, slots 6-8=afternoon
    time_slots = TimeSlot.objects.order_by('slot_number')
    morning_slots = [ts for ts in time_slots if ts.slot_number in [1, 2, 3, 4]]
    lunch_break_slot = [ts for ts in time_slots if ts.slot_number == 5]
    afternoon_slots = [ts for ts in time_slots if ts.slot_number in [6, 7, 8]]
    batches = sorted(set(slots.values_list('batch__name', flat=True)))

    # Get unique teachers from slots
    teacher_codes = set()
    for slot in slots:
        for ts in slot.teachers.all():
            teacher_codes.add((ts.teacher.short_code, ts.teacher.full_name))
    teachers = [{'short_code': tc[0], 'full_name': tc[1]} for tc in sorted(teacher_codes)]

    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>ICE Routine — PUST</title>
        <style>
            @media print {{
                .no-print {{ display: none; }}
                table {{ page-break-inside: auto; }}
                tr {{ page-break-inside: avoid; }}
            }}
            body {{
                font-family: Arial, sans-serif;
                font-size: 11px;
                margin: 0;
                padding: 20px;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 20px;
            }}
            th, td {{
                border: 1px solid #ccc;
                padding: 4px;
                text-align: center;
                font-size: 10px;
                vertical-align: top;
            }}
            .day-header {{
                background: #374151;
                color: white;
                font-weight: bold;
            }}
            .break-cell {{
                background: #e5e7eb;
                color: #6b7280;
                font-style: italic;
            }}
            .batch-label {{
                background: #f3f4f6;
                font-weight: 600;
            }}
            .week-badge {{
                font-size: 9px;
                padding: 1px 4px;
                border-radius: 3px;
                margin-left: 4px;
            }}
            .odd-badge {{
                background: #fef9c3;
                color: #92400e;
            }}
            .even-badge {{
                background: #dbeafe;
                color: #1e40af;
            }}
        </style>
    </head>
    <body>
        <div class="header" style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 20px; margin: 0;">Department of Information and Communication Engineering</h1>
            <h2 style="font-size: 16px; margin: 5px 0; color: #4b5563;">Pabna University of Science and Technology</h2>
            {f'<p style="font-size: 14px; margin: 5px 0;"><strong>Class Routine — {active_semester.name}</strong></p><p style="margin: 0; color: #6b7280;">Effective from: {active_semester.start_date}</p>' if active_semester else ''}
        </div>

        <div class="no-print" style="margin: 20px 0; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">🖨️ Print / Save as PDF</button>
            <button onclick="window.close()" style="margin-left: 12px; padding: 10px 24px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Close</button>
        </div>
    '''

    if slots:
        html += '<table>'
        html += '<thead>'
        html += '<tr>'
        html += '<th style="width: 100px;">Day | Batch</th>'
        for ts in morning_slots:
            html += f'<th style="width: 100px;">{ts.label or f"{ts.start_time}–{ts.end_time}"}</th>'
        html += '<th class="break-cell" style="width: 100px;">Prayer &amp; Lunch Break</th>'
        for ts in afternoon_slots:
            html += f'<th style="width: 100px;">{ts.label or f"{ts.start_time}–{ts.end_time}"}</th>'
        html += '</tr>'
        html += '</thead>'
        html += '<tbody>'

        for day in DAYS_ORDER:
            day_slots = [s for s in slots if s.day_of_week == day]
            if day_slots:
                html += f'<tr><td class="day-header" colspan="{len(morning_slots) + 1 + len(afternoon_slots) + 1}">{day.capitalize()}</td></tr>'

                for batch_index, batch_name in enumerate(batches):
                    batch_slots = [s for s in day_slots if s.batch.name == batch_name]
                    batch_color = get_batch_color(batch_index)

                    html += '<tr>'

                    # Batch label cell
                    html += f'<td class="batch-label" style="background:{batch_color}; width: 100px;">{batch_name}</td>'

                    # Morning slots
                    for ts in morning_slots:
                        matching_slots = [s for s in batch_slots if s.time_slot.id == ts.id]

                        if matching_slots:
                            html += f'<td style="background:{batch_color}; padding: 2px; vertical-align: top; width: 100px;">'

                            for i, slot in enumerate(matching_slots):
                                teacher_codes_list = ', '.join([t.teacher.short_code for t in slot.teachers.all()])

                                # Week type badge
                                week_badge = ''
                                if slot.week_type == 'odd':
                                    week_badge = '<span style="font-size:8px; background:#fef9c3; color:#92400e; padding:1px 3px; border-radius:2px;">ODD</span>'
                                elif slot.week_type == 'even':
                                    week_badge = '<span style="font-size:8px; background:#dbeafe; color:#1e40af; padding:1px 3px; border-radius:2px;">EVEN</span>'

                                # Divider between stacked slots
                                divider = '<hr style="margin:2px 0; border:none; border-top:1px dashed #ccc;">' if i > 0 else ''

                                html += f'''
                                {divider}
                                <div style="font-size:10px; font-weight:bold; margin: 2px 0;">{slot.course.code}</div>
                                <div style="font-size:9px; color:#555; margin: 2px 0;">{teacher_codes_list}</div>
                                <div style="font-size:9px; color:#888; margin: 2px 0;">R{slot.room.room_number}</div>
                                {week_badge}
                                '''

                            html += '</td>'
                        else:
                            html += f'<td style="background:{batch_color}; width: 100px;"></td>'

                    # Lunch break cell — rowspan across all batch rows (ONLY FOR FIRST BATCH!)
                    if batch_index == 0:
                        html += f'<td class="break-cell" rowspan="{len(batches)}" style="vertical-align:middle; font-style:italic; color:#9ca3af; width: 100px;">Prayer &amp; Lunch Break</td>'

                    # Afternoon slots
                    for ts in afternoon_slots:
                        matching_slots = [s for s in batch_slots if s.time_slot.id == ts.id]

                        if matching_slots:
                            html += f'<td style="background:{batch_color}; padding: 2px; vertical-align: top; width: 100px;">'

                            for i, slot in enumerate(matching_slots):
                                teacher_codes_list = ', '.join([t.teacher.short_code for t in slot.teachers.all()])

                                # Week type badge
                                week_badge = ''
                                if slot.week_type == 'odd':
                                    week_badge = '<span style="font-size:8px; background:#fef9c3; color:#92400e; padding:1px 3px; border-radius:2px;">ODD</span>'
                                elif slot.week_type == 'even':
                                    week_badge = '<span style="font-size:8px; background:#dbeafe; color:#1e40af; padding:1px 3px; border-radius:2px;">EVEN</span>'

                                # Divider between stacked slots
                                divider = '<hr style="margin:2px 0; border:none; border-top:1px dashed #ccc;">' if i > 0 else ''

                                html += f'''
                                {divider}
                                <div style="font-size:10px; font-weight:bold; margin: 2px 0;">{slot.course.code}</div>
                                <div style="font-size:9px; color:#555; margin: 2px 0;">{teacher_codes_list}</div>
                                <div style="font-size:9px; color:#888; margin: 2px 0;">R{slot.room.room_number}</div>
                                {week_badge}
                                '''

                            html += '</td>'
                        else:
                            html += f'<td style="background:{batch_color}; width: 100px;"></td>'

                    html += '</tr>'

        html += '</tbody>'
        html += '</table>'

    if teachers:
        html += '<div class="teacher-legend" style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">'
        html += '<h3 style="font-size: 12px; font-weight: 600; margin-bottom: 10px;">Teacher Legend</h3>'
        html += '<div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px;">'
        for t in teachers:
            html += f'<span style="margin-right: 15px;"><strong>{t["short_code"]}</strong> — {t["full_name"]}</span>'
        html += '</div>'
        html += '</div>'

    html += '''
    </body>
    </html>
    '''

    return HttpResponse(html, content_type='text/html')