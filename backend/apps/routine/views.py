"""
Views for routine management API endpoints.
"""

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser
from django.http import JsonResponse
from .models import Teacher, Course, Room, Batch, TimeSlot, Semester, RoutineSlot
from .serializers import TeacherSerializer, CourseSerializer, RoomSerializer, BatchSerializer, TimeSlotSerializer, SemesterSerializer
from .services.conflict_detector import detect_conflicts


# ============ Master Data Endpoints ============

class TeacherViewSet(generics.ModelViewSet):
    queryset = Teacher.objects.filter(is_active=True)
    serializer_class = TeacherSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class CourseViewSet(generics.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class RoomViewSet(generics.ModelViewSet):
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class BatchViewSet(generics.ModelViewSet):
    queryset = Batch.objects.filter(is_active=True)
    serializer_class = BatchSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class TimeSlotViewSet(generics.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# ============ Semester Endpoints ============

class SemesterViewSet(generics.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.is_published = False
        instance.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def activate(self, request, pk=None):
        semester = self.get_object()
        semester.is_active = True
        semester.save()
        return JsonResponse({'message': 'Semester activated'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def publish(self, request, pk=None):
        semester = self.get_object()
        semester.is_active = True
        semester.is_published = True
        semester.save()
        return JsonResponse({'message': 'Semester published and activated'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def unpublish(self, request, pk=None):
        semester = self.get_object()
        semester.is_published = False
        semester.save()
        return JsonResponse({'message': 'Semester unpublished'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def clone(self, request, pk=None):
        from .models import RoutineSlot

        semester = self.get_object()
        new_semester_name = request.data.get('new_semester_name')

        if not new_semester_name:
            return JsonResponse({
                'error': True,
                'message': 'new_semester_name is required'
            }, status=400)

        # Create new semester
        new_semester = Semester.objects.create(
            name=new_semester_name,
            start_date=semester.start_date,
            is_active=False,
            is_published=False
        )

        # Copy all slots
        existing_slots = semester.slots.all()
        slots_cloned = 0

        for slot in existing_slots:
            new_slot = RoutineSlot.objects.create(
                semester=new_semester,
                batch=slot.batch,
                course=slot.course,
                room=slot.room,
                time_slot=slot.time_slot,
                day_of_week=slot.day_of_week,
                week_type=slot.week_type,
                slot_duration=slot.slot_duration,
                notes=slot.notes
            )

            # Copy teachers
            for teacher in slot.teachers.all():
                from .models import RoutineSlotTeacher
                RoutineSlotTeacher.objects.create(
                    routine_slot=new_slot,
                    teacher=teacher
                )

            slots_cloned += 1

        return JsonResponse({
            'new_semester_id': new_semester.id,
            'slots_cloned': slots_cloned,
            'message': 'Semester cloned successfully'
        })


# ============ Routine Slot Endpoints ============

class RoutineSlotViewSet(generics.ModelViewSet):
    serializer_class = None  # Will be set dynamically
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        semester_id = self.kwargs.get('sem_id')
        return RoutineSlot.objects.filter(semester_id=semester_id)

    def get_serializer_class(self):
        # Return a minimal serializer just for returning slot data
        class SlotSerializer:
            def __init__(self, slot):
                self.slot = slot

            def to_representation(self, instance):
                slot = instance.slot if hasattr(instance, 'slot') else instance

                return {
                    'id': slot.id,
                    'batch': {
                        'id': slot.batch.id,
                        'name': slot.batch.name,
                        'session': slot.batch.session
                    },
                    'course': {
                        'id': slot.course.id,
                        'code': slot.course.code,
                        'name': slot.course.name,
                        'course_type': slot.course.course_type,
                        'credit_hours': slot.course.credit_hours
                    },
                    'room': {
                        'id': slot.room.id,
                        'room_number': slot.room.room_number,
                        'room_type': slot.room.room_type
                    },
                    'time_slot': {
                        'id': slot.time_slot.id,
                        'start_time': slot.time_slot.start_time.strftime('%H:%M'),
                        'end_time': slot.time_slot.end_time.strftime('%H:%M'),
                        'slot_number': slot.time_slot.slot_number
                    },
                    'day_of_week': slot.day_of_week,
                    'week_type': slot.week_type,
                    'slot_duration': slot.slot_duration,
                    'teachers': [
                        {
                            'id': t.id,
                            'short_code': t.short_code,
                            'full_name': t.full_name
                        } for t in slot.teachers.all()
                    ],
                    'notes': slot.notes
                }

        return SlotSerializer

    def get_serializer(self, *args, **kwargs):
        # For create and update, we need a different serializer
        class CreateUpdateSerializer(serializers.ModelSerializer):
            class Meta:
                model = RoutineSlot
                fields = ['batch_id', 'course_id', 'room_id', 'time_slot_id',
                         'day_of_week', 'week_type', 'slot_duration', 'teacher_ids']

        # For list and detail, use the SlotSerializer
        if self.action in ['list', 'retrieve']:
            return SlotSerializer

        # For create/update, use CreateUpdateSerializer
        return CreateUpdateSerializer(*args, **kwargs)

    def perform_create(self, serializer):
        semester_id = self.kwargs.get('sem_id')
        slot_data = self.request.data
        teacher_ids = slot_data.get('teacher_ids', [])

        # Remove teacher_ids before creating slot (it's not a field in model)
        if 'teacher_ids' in slot_data:
            del slot_data['teacher_ids']

        # Detect conflicts
        conflicts = detect_conflicts(
            semester_id=semester_id,
            batch_id=slot_data.get('batch_id'),
            teacher_ids=teacher_ids,
            room_id=slot_data.get('room_id'),
            time_slot_id=slot_data.get('time_slot_id'),
            day_of_week=slot_data.get('day_of_week'),
            week_type=slot_data.get('week_type', 'all')
        )

        # Create the slot
        slot = RoutineSlot.objects.create(
            semester_id=semester_id,
            **slot_data
        )

        # Add teachers
        if teacher_ids:
            for teacher_id in teacher_ids:
                from .models import RoutineSlotTeacher
                RoutineSlotTeacher.objects.get_or_create(
                    routine_slot=slot,
                    teacher_id=teacher_id
                )

        # Return the slot with conflicts
        self.slot = slot  # Store for response
        self.conflicts = conflicts

    def create(self, request, *args, **kwargs):
        self.perform_create(request)
        serializer = self.get_serializer(self.slot)
        return JsonResponse({
            'id': self.slot.id,
            'conflicts': self.conflicts
        })

    def perform_update(self, serializer):
        slot_data = self.request.data
        semester_id = self.kwargs.get('sem_id')
        slot_id = kwargs.get('pk')

        teacher_ids = slot_data.get('teacher_ids', [])
        exclude_slot_id = slot_id

        # Remove teacher_ids before update
        if 'teacher_ids' in slot_data:
            del slot_data['teacher_ids']

        # Detect conflicts
        conflicts = detect_conflicts(
            semester_id=semester_id,
            batch_id=slot_data.get('batch_id'),
            teacher_ids=teacher_ids,
            room_id=slot_data.get('room_id'),
            time_slot_id=slot_data.get('time_slot_id'),
            day_of_week=slot_data.get('day_of_week'),
            week_type=slot_data.get('week_type', 'all'),
            exclude_slot_id=exclude_slot_id
        )

        # Update the slot
        RoutineSlot.objects.filter(id=slot_id).update(**slot_data)

        # Update teachers
        if 'teacher_ids' in self.request.data:
            # Remove all existing teachers
            from .models import RoutineSlotTeacher
            RoutineSlotTeacher.objects.filter(routine_slot_id=slot_id).delete()

            # Add new teachers
            for teacher_id in teacher_ids:
                from .models import RoutineSlotTeacher
                RoutineSlotTeacher.objects.get_or_create(
                    routine_slot_id=slot_id,
                    teacher_id=teacher_id
                )

        self.conflicts = conflicts

    def update(self, request, *args, **kwargs):
        self.perform_update(request)
        slot = self.get_object()
        serializer = self.get_serializer(slot)
        return JsonResponse({
            'id': slot.id,
            'conflicts': self.conflicts
        })

    def get_serializer_class(self):
        class SlotSerializer:
            def __init__(self, slot):
                self.slot = slot

            def to_representation(self, instance):
                slot = instance

                return {
                    'id': slot.id,
                    'batch': {
                        'id': slot.batch.id,
                        'name': slot.batch.name,
                        'session': slot.batch.session
                    },
                    'course': {
                        'id': slot.course.id,
                        'code': slot.course.code,
                        'name': slot.course.name,
                        'course_type': slot.course.course_type,
                        'credit_hours': slot.course.credit_hours
                    },
                    'room': {
                        'id': slot.room.id,
                        'room_number': slot.room.room_number,
                        'room_type': slot.room.room_type
                    },
                    'time_slot': {
                        'id': slot.time_slot.id,
                        'start_time': slot.time_slot.start_time.strftime('%H:%M'),
                        'end_time': slot.time_slot.end_time.strftime('%H:%M'),
                        'slot_number': slot.time_slot.slot_number
                    },
                    'day_of_week': slot.day_of_week,
                    'week_type': slot.week_type,
                    'slot_duration': slot.slot_duration,
                    'teachers': [
                        {
                            'id': t.id,
                            'short_code': t.short_code,
                            'full_name': t.full_name
                        } for t in slot.teachers.all()
                    ],
                    'notes': slot.notes
                }

        return SlotSerializer


@require_http_methods(["POST"])
def check_conflicts(request, sem_id):
    """
    Check conflicts without saving.
    Request body: { "batch_id": 3, "teacher_ids": [1], ... }
    """
    slot_data = request.data

    conflicts = detect_conflicts(
        semester_id=sem_id,
        batch_id=slot_data.get('batch_id'),
        teacher_ids=slot_data.get('teacher_ids', []),
        room_id=slot_data.get('room_id'),
        time_slot_id=slot_data.get('time_slot_id'),
        day_of_week=slot_data.get('day_of_week'),
        week_type=slot_data.get('week_type', 'all')
    )

    return JsonResponse({'conflicts': conflicts})


# ============ Public Endpoints ============

@require_http_methods(["GET"])
def get_active_semester(request):
    """
    Get the active published semester routine.
    Supports query params: ?day=monday, ?batch=15B, ?teacher=MAH
    """
    from django.db.models import Q

    # Get active and published semester
    semester = Semester.objects.filter(is_active=True, is_published=True).first()

    if not semester:
        return JsonResponse({
            'error': True,
            'message': 'No active published semester found'
        }, status=404)

    # Get slots
    slots = semester.slots.all()

    # Filter by query params
    day = request.GET.get('day')
    batch_name = request.GET.get('batch')
    teacher_code = request.GET.get('teacher')

    if day:
        slots = slots.filter(day_of_week=day)

    if batch_name:
        try:
            batch = Batch.objects.get(name=batch_name, is_active=True)
            slots = slots.filter(batch=batch)
        except Batch.DoesNotExist:
            pass

    if teacher_code:
        try:
            teacher = Teacher.objects.get(short_code=teacher_code, is_active=True)
            slots = slots.filter(teachers=teacher)
        except Teacher.DoesNotExist:
            pass

    # Build response
    return JsonResponse({
        'semester': {
            'id': semester.id,
            'name': semester.name,
            'start_date': semester.start_date.strftime('%Y-%m-%d')
        },
        'slots': []
    })


@require_http_methods(["GET"])
def get_batch_schedule(request, batch_name):
    """
    Get routine for a specific batch.
    """
    from django.db.models import Q

    try:
        batch = Batch.objects.get(name=batch_name, is_active=True)
    except Batch.DoesNotExist:
        return JsonResponse({
            'error': True,
            'message': f'Batch {batch_name} not found'
        }, status=404)

    # Get active and published semester
    semester = Semester.objects.filter(is_active=True, is_published=True).first()

    if not semester:
        return JsonResponse({
            'error': True,
            'message': 'No active published semester found'
        }, status=404)

    # Get slots for this batch
    slots = semester.slots.filter(batch=batch)

    return JsonResponse({
        'batch': {
            'name': batch.name,
            'session': batch.session
        },
        'slots': []
    })


@require_http_methods(["GET"])
def get_teacher_schedule(request, teacher_code):
    """
    Get routine for a specific teacher.
    """
    try:
        teacher = Teacher.objects.get(short_code=teacher_code, is_active=True)
    except Teacher.DoesNotExist:
        return JsonResponse({
            'error': True,
            'message': f'Teacher {teacher_code} not found'
        }, status=404)

    # Get active and published semester
    semester = Semester.objects.filter(is_active=True, is_published=True).first()

    if not semester:
        return JsonResponse({
            'error': True,
            'message': 'No active published semester found'
        }, status=404)

    # Get slots for this teacher
    slots = semester.slots.filter(teachers=teacher)

    return JsonResponse({
        'teacher': {
            'short_code': teacher.short_code,
            'full_name': teacher.full_name
        },
        'slots': []
    })
