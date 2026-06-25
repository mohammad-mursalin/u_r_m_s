"""
Views for public routine endpoints.
"""

from django.http import JsonResponse
from apps.routine.models import RoutineSlot, Batch, Teacher, TimeSlot, Course, Room, Semester
from apps.routine.serializers import RoutineSlotSerializer


def get_active_slots(filters=None):
    """
    Get slots from active and published semester with optional filters.
    """
    slots = RoutineSlot.objects.filter(
        semester__is_active=True,
        semester__is_published=True
    )

    # Apply filters
    if filters:
        if filters.get('batch'):
            slots = slots.filter(batch__name=filters['batch'])
        if filters.get('teacher'):
            slots = slots.filter(teachers__teacher__short_code=filters['teacher'])
        if filters.get('day'):
            slots = slots.filter(day_of_week=filters['day'])

    return slots


def serialize_slot(slot):
    """
    Serialize a slot with nested relationships.
    """
    return {
        'id': slot.id,
        'day': slot.day_of_week,
        'week_type': slot.week_type,
        'time_slot': {
            'id': slot.time_slot.id,
            'start_time': slot.time_slot.start_time.strftime('%H:%M'),
            'end_time': slot.time_slot.end_time.strftime('%H:%M'),
            'slot_number': slot.time_slot.slot_number
        },
        'batch': {
            'id': slot.batch.id,
            'name': slot.batch.name,
            'session': slot.batch.session
        },
        'course': {
            'id': slot.course.id,
            'code': slot.course.code,
            'name': slot.course.name,
            'course_type': slot.course.course_type
        },
        'room': {
            'id': slot.room.id,
            'room_number': slot.room.room_number
        },
        'teachers': [
            {
                'id': teacher.id,
                'short_code': teacher.short_code,
                'full_name': teacher.full_name
            }
            for teacher in slot.teachers.all()
        ],
        'slot_duration': slot.slot_duration
    }


def active_semester(request):
    """
    GET /api/v1/routine/active/

    Returns the published active semester's complete slot data.
    Query params: ?day=monday, ?batch=15B, ?teacher=MAH

    Response format exactly as defined in API_ROUTES.md
    """
    # Get active and published semester
    semester = Semester.objects.filter(
        is_active=True,
        is_published=True
    ).first()

    if not semester:
        return JsonResponse({
            'error': True,
            'message': 'No active and published semester found'
        }, status=404)

    # Get query parameters
    filters = {}
    if 'batch' in request.GET and request.GET.get('batch'):
        filters['batch'] = request.GET.get('batch')
    if 'teacher' in request.GET and request.GET.get('teacher'):
        filters['teacher'] = request.GET.get('teacher')
    if 'day' in request.GET and request.GET.get('day'):
        filters['day'] = request.GET.get('day')

    # Get filtered slots
    slots = RoutineSlot.objects.filter(
        semester=semester
    )

    # Apply filters
    if filters.get('batch'):
        slots = slots.filter(batch__name=filters['batch'])
    if filters.get('teacher'):
        slots = slots.filter(teachers__teacher__short_code=filters['teacher'])
    if filters.get('day'):
        slots = slots.filter(day_of_week=filters['day'])

    serialized_slots = [serialize_slot(slot) for slot in slots]

    return JsonResponse({
        'semester': {
            'id': semester.id,
            'name': semester.name,
            'start_date': semester.start_date.strftime('%Y-%m-%d')
        },
        'slots': serialized_slots
    })


def batch_schedule(request, batch_name):
    """
    GET /api/v1/routine/batch/<batch_name>/

    Returns routine for a specific batch.
    """
    # Get filtered slots for the batch
    slots = get_active_slots({'batch': batch_name})
    serialized_slots = [serialize_slot(slot) for slot in slots]

    return JsonResponse({
        'batch': batch_name,
        'slots': serialized_slots
    })


def teacher_schedule(request, teacher_code):
    """
    GET /api/v1/routine/teacher/<short_code>/

    Returns routine for a specific teacher.
    """
    # Get filtered slots for the teacher
    slots = get_active_slots({'teacher': teacher_code})
    serialized_slots = [serialize_slot(slot) for slot in slots]

    return JsonResponse({
        'teacher': teacher_code,
        'slots': serialized_slots
    })
