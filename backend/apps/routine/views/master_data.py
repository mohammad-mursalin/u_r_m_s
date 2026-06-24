"""
Views for master data endpoints (Teachers, Courses, Rooms, Batches, TimeSlots).
"""

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from apps.routine.models import Teacher, Course, Room, Batch, TimeSlot
from apps.routine.serializers import (
    TeacherSerializer, CourseSerializer, RoomSerializer,
    BatchSerializer, TimeSlotSerializer
)


class TeacherViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Teacher.objects.filter(is_active=True)
    serializer_class = TeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']

    @action(detail=False, methods=['get'])
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Teacher deactivated successfully"},
            status=status.HTTP_200_OK
        )


class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course_type', 'is_active']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Course deactivated successfully"},
            status=status.HTTP_200_OK
        )


class RoomViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room_type', 'is_active']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Room deactivated successfully"},
            status=status.HTTP_200_OK
        )


class BatchViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Batch.objects.filter(is_active=True)
    serializer_class = BatchSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['program', 'is_active']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Batch deactivated successfully"},
            status=status.HTTP_200_OK
        )


class TimeSlotViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = TimeSlot.objects.all().order_by('slot_number')
    serializer_class = TimeSlotSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Time slot deactivated successfully"},
            status=status.HTTP_200_OK
        )
