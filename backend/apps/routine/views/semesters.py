"""
Views for semester endpoints.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, AllowAny
from apps.routine.models import Semester, RoutineSlot, RoutineSlotTeacher
from apps.routine.serializers import SemesterSerializer
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


@method_decorator(csrf_exempt, name='dispatch')
class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'activate', 'publish', 'unpublish', 'clone']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Set this semester as active.
        """
        semester = self.get_object()
        semester.is_active = True
        semester.save()

        return Response(
            {"message": "Semester activated"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """
        Publish this semester (make it visible to public).
        """
        semester = self.get_object()
        semester.is_active = True
        semester.is_published = True
        semester.save()

        return Response(
            {"message": "Semester published and activated"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """
        Unpublish this semester (hide from public).
        """
        semester = self.get_object()
        semester.is_published = False
        semester.save()

        return Response(
            {"message": "Semester unpublished"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def clone(self, request, pk=None):
        """
        Clone this semester to create a new one.
        Request body: { "new_semester_name": "July 2026 Semester" }
        """
        semester = self.get_object()
        new_name = request.data.get('new_semester_name')

        if not new_name:
            return Response(
                {"error": True, "message": "new_semester_name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new semester
        new_semester = Semester.objects.create(
            name=new_name,
            start_date=semester.start_date,
            end_date=semester.end_date,
            is_active=False,
            is_published=False
        )

        # Clone all slots
        slots_to_clone = semester.slots.all()
        cloned_count = 0

        for slot in slots_to_clone:
            cloned_slot = RoutineSlot.objects.create(
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

            # Clone teachers
            for teacher_slot in slot.teachers.all():
                RoutineSlotTeacher.objects.create(
                    routine_slot=cloned_slot,
                    teacher=teacher_slot.teacher
                )

            cloned_count += 1

        return Response({
            "new_semester_id": new_semester.id,
            "slots_cloned": cloned_count,
            "message": "Semester cloned successfully"
        })