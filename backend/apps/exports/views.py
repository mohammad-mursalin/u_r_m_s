"""
Views for PDF export endpoint.
"""

from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.conf import settings
from apps.routine.models import Semester, RoutineSlot, TimeSlot, Batch, Course, Teacher
from apps.routine.serializers import RoutineSlotSerializer


BATCH_COLORS = {
    'MSc': '#f3e8ff',
    '13B': '#dbeafe',
    '14B': '#dcfce7',
    '15B': '#fef9c3',
    '16B': '#ffedd5',
    '17B': '#fee2e2',
}

DAYS_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']


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
    time_slots = TimeSlot.objects.order_by('slot_number')
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
        html += '''
        <table>
            <thead>
                <tr>
                    <th style="width: 100px;">Day | Batch</th>
        '''
        
        # Header columns in correct order: morning (1-4), break (0), afternoon (5-7)
        morning_slots = [ts for ts in time_slots if ts.slot_number in [1, 2, 3, 4]]
        break_slot = [ts for ts in time_slots if ts.slot_number == 0]
        afternoon_slots = [ts for ts in time_slots if ts.slot_number in [5, 6, 7]]
        
        for ts in morning_slots:
            html += f'<th style="width: 100px;">{ts.label or f"{ts.start_time}–{ts.end_time}"}</th>'
        for ts in break_slot:
            html += '<th style="width: 100px;">Prayer &amp; Lunch Break</th>'
        for ts in afternoon_slots:
            html += f'<th style="width: 100px;">{ts.label or f"{ts.start_time}–{ts.end_time}"}</th>'
        
        html += '''
                </tr>
            </thead>
            <tbody>
        '''
        
        for day in DAYS_ORDER:
            day_slots = [s for s in slots if s.day_of_week == day]
            if day_slots:
                html += f'<tr><td class="day-header" colspan="{len(time_slots) + 1}">{day.capitalize()}</td></tr>'
                
                for batch_name in batches:
                    batch_slots = [s for s in day_slots if s.batch.name == batch_name]
                    if batch_slots:
                        batch_color = BATCH_COLORS.get(batch_name, '#ffffff')
                        html += f'<tr><td class="batch-label" style="background:{batch_color}">{batch_name}</td>'
                        
                        # Columns in correct order: 1,2,3,4 (morning), 0 (break), 5,6,7 (afternoon)
                        # slot_number 0 = break, 1-4 = morning, 5-7 = afternoon
                        morning_slots = [ts for ts in time_slots if ts.slot_number in [1, 2, 3, 4]]
                        break_slot = [ts for ts in time_slots if ts.slot_number == 0]
                        afternoon_slots = [ts for ts in time_slots if ts.slot_number in [5, 6, 7]]
                        
                        # Morning slots
                        for ts in morning_slots:
                            slot = next((s for s in batch_slots if s.time_slot.id == ts.id), None)
                            if slot:
                                teacher_codes = ', '.join([t.teacher.short_code for t in slot.teachers.all()])
                                week_badge = ''
                                if slot.week_type == 'odd':
                                    week_badge = '<span class="week-badge odd-badge">[ODD]</span>'
                                elif slot.week_type == 'even':
                                    week_badge = '<span class="week-badge even-badge">[EVEN]</span>'
                                html += f'<td>{slot.course.code}<br/><span style="font-size: 9px;">{teacher_codes}</span>{week_badge}<br/><span style="font-size: 9px; color: #6b7280;">R{slot.room.room_number}</span></td>'
                            else:
                                html += '<td></td>'
                        
                        # Break slot
                        if break_slot:
                            ts = break_slot[0]
                            html += '<td class="break-cell">Prayer &amp; Lunch Break</td>'
                        
                        # Afternoon slots
                        for ts in afternoon_slots:
                            slot = next((s for s in batch_slots if s.time_slot.id == ts.id), None)
                            if slot:
                                teacher_codes = ', '.join([t.teacher.short_code for t in slot.teachers.all()])
                                week_badge = ''
                                if slot.week_type == 'odd':
                                    week_badge = '<span class="week-badge odd-badge">[ODD]</span>'
                                elif slot.week_type == 'even':
                                    week_badge = '<span class="week-badge even-badge">[EVEN]</span>'
                                html += f'<td>{slot.course.code}<br/><span style="font-size: 9px;">{teacher_codes}</span>{week_badge}<br/><span style="font-size: 9px; color: #6b7280;">R{slot.room.room_number}</span></td>'
                            else:
                                html += '<td></td>'
                        
                        html += '</tr>'
        
        html += '''
            </tbody>
        </table>
        '''

    if teachers:
        html += '''
        <div class="teacher-legend" style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
            <h3 style="font-size: 12px; font-weight: 600; margin-bottom: 10px;">Teacher Legend</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px;">
        '''
        for t in teachers:
            html += f'<span style="margin-right: 15px;"><strong>{t["short_code"]}</strong> — {t["full_name"]}</span>'
        
        html += '''
            </div>
        </div>
        '''

    html += '''
    </body>
    </html>
    '''

    return HttpResponse(html, content_type='text/html')