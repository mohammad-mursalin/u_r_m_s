"""
Detect conflicts when creating or updating routine slots.
"""

from apps.routine.models import RoutineSlot, RoutineSlotTeacher
from django.db.models import Q


def detect_conflicts(
    semester_id,
    batch_id=None,
    teacher_ids=None,
    room_id=None,
    time_slot_id=None,
    day_of_week=None,
    week_type='all',
    exclude_slot_id=None
):
    """
    Detect conflicts for a proposed routine slot.
    
    Returns a dictionary with conflict lists:
    - teachers: list of teacher IDs with conflicts
    - rooms: list of room IDs with conflicts
    - batches: list of batch IDs with conflicts
    - time_slots: list of time slot IDs with conflicts
    - message: description of conflicts
    """
    conflicts = {
        'teachers': [],
        'rooms': [],
        'batches': [],
        'time_slots': [],
        'message': ''
    }
    
    # Build query for existing slots
    query = Q(
        semester_id=semester_id,
        day_of_week=day_of_week,
        week_type__in=['all', week_type] if week_type != 'all' else 'all',
        time_slot_id=time_slot_id
    )
    
    if exclude_slot_id:
        query = query & ~Q(id=exclude_slot_id)
    
    existing_slots = RoutineSlot.objects.filter(query)
    
    # Check for batch conflicts
    if batch_id:
        batch_conflicts = existing_slots.filter(batch_id=batch_id)
        if batch_conflicts.exists():
            conflicts['batches'].append({
                'batch_id': batch_id,
                'message': f'Batch already has a slot at {day_of_week} {time_slot_id}'
            })
    
    # Check for room conflicts
    if room_id:
        room_conflicts = existing_slots.filter(room_id=room_id)
        if room_conflicts.exists():
            conflicts['rooms'].append({
                'room_id': room_id,
                'message': f'Room already occupied at {day_of_week} {time_slot_id}'
            })
    
    # Check for teacher conflicts
    if teacher_ids:
        for teacher_id in teacher_ids:
            teacher_conflicts = existing_slots.filter(
                teachers__teacher_id=teacher_id
            )
            if teacher_conflicts.exists():
                conflicts['teachers'].append({
                    'teacher_id': teacher_id,
                    'message': f'Teacher {teacher_id} already has a class at {day_of_week} {time_slot_id}'
                })
    
    # Compile conflict messages
    conflict_messages = []
    if conflicts['teachers']:
        conflict_messages.append(f'Teacher conflict: {len(conflicts["teachers"])} teacher(s)')
    if conflicts['rooms']:
        conflict_messages.append(f'Room conflict: {len(conflicts["rooms"])} room(s)')
    if conflicts['batches']:
        conflict_messages.append(f'Batch conflict: {len(conflicts["batches"])} batch(es)')
    if conflicts['time_slots']:
        conflict_messages.append(f'Time slot conflict: {len(conflicts["time_slots"])} time slot(s)')
    
    conflicts['message'] = '; '.join(conflict_messages) if conflict_messages else 'No conflicts detected'
    
    return conflicts
