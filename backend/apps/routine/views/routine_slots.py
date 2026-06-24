"""
Views for routine slot endpoints.
"""

from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from apps.routine.models import Semester, RoutineSlot
from apps.routine.serializers import RoutineSlotCreateUpdateSerializer
from apps.routine.services.conflict_detector import detect_conflicts


class RoutineSlotViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = RoutineSlotCreateUpdateSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['day_of_week', 'week_type']

    def get_queryset(self):
        """
        Filter slots by semester from URL kwarg.
        """
        semester_id = self.kwargs.get('sem_id')
        return RoutineSlot.objects.filter(semester_id=semester_id)

    def get_serializer_class(self):
        """
        Use different serializer for list/detail vs create/update.
        """
        if self.action in ['list', 'retrieve']:
            from apps.routine.serializers import RoutineSlotSerializer
            return RoutineSlotSerializer
        return RoutineSlotCreateUpdateSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new routine slot with conflict detection.
        """
        semester_id = kwargs.get('sem_id')
        validated_data = request.data

        # Run conflict detection
        conflicts = detect_conflicts(
            semester_id=semester_id,
            batch_id=validated_data.get('batch_id'),
            teacher_ids=validated_data.get('teacher_ids'),
            room_id=validated_data.get('room_id'),
            time_slot_id=validated_data.get('time_slot_id'),
            day_of_week=validated_data.get('day_of_week'),
            week_type=validated_data.get('week_type')
        )

        # Create the slot regardless of conflicts
        serializer = self.get_serializer(data=validated_data)
        serializer.is_valid(raise_exception=True)
        routine_slot = serializer.save()

        return Response({
            'id': routine_slot.id,
            'conflicts': conflicts
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Update an existing routine slot with conflict detection.
        """
        semester_id = kwargs.get('sem_id')
        instance = self.get_object()
        validated_data = request.data

        # Run conflict detection (exclude current slot)
        conflicts = detect_conflicts(
            semester_id=semester_id,
            batch_id=validated_data.get('batch_id', instance.batch_id),
            teacher_ids=validated_data.get('teacher_ids'),
            room_id=validated_data.get('room_id', instance.room_id),
            time_slot_id=validated_data.get('time_slot_id', instance.time_slot_id),
            day_of_week=validated_data.get('day_of_week', instance.day_of_week),
            week_type=validated_data.get('week_type', instance.week_type),
            exclude_slot_id=instance.id
        )

        # Update the slot regardless of conflicts
        serializer = self.get_serializer(instance, data=validated_data, partial=True)
        serializer.is_valid(raise_exception=True)
        routine_slot = serializer.save()

        return Response({
            'id': routine_slot.id,
            'conflicts': conflicts
        })

    @action(detail=True, methods=['post'], url_path='check-conflicts')
    def check_conflicts(self, request, sem_id=None, pk=None):
        """
        Check for conflicts without saving the slot.
        """
        validated_data = request.data

        conflicts = detect_conflicts(
            semester_id=sem_id,
            batch_id=validated_data.get('batch_id'),
            teacher_ids=validated_data.get('teacher_ids'),
            room_id=validated_data.get('room_id'),
            time_slot_id=validated_data.get('time_slot_id'),
            day_of_week=validated_data.get('day_of_week'),
            week_type=validated_data.get('week_type')
        )

        return Response({'conflicts': conflicts})
