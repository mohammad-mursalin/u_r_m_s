"""
Views for master data endpoints (Teachers, Courses, Rooms, Batches, TimeSlots).
"""

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from apps.routine.models import Teacher, Course, Room, Batch, TimeSlot
from apps.routine.serializers import (
    TeacherSerializer, CourseSerializer, RoomSerializer,
    BatchSerializer, TimeSlotSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.filter(is_active=True)
    serializer_class = TeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Teacher deactivated successfully"},
            status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name='dispatch')
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course_type', 'is_active']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Course deactivated successfully"},
            status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name='dispatch')
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room_type', 'is_active']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Room deactivated successfully"},
            status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name='dispatch')
class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.filter(is_active=True)
    serializer_class = BatchSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['program', 'is_active']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"message": "Batch deactivated successfully"},
            status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name='dispatch')
class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all().order_by('slot_number')
    serializer_class = TimeSlotSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(
            {"message": "Time slot deletion not supported"},
            status=status.HTTP_400_BAD_REQUEST
        )
