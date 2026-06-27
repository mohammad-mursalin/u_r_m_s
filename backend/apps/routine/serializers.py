"""
DRF Serializers for all models.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.routine.models import (
    Teacher, Course, Room, Batch, TimeSlot, Semester,
    RoutineSlot, RoutineSlotTeacher
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_staff', 'is_superuser', 'is_active']


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'short_code', 'email', 'designation', 'is_active']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'credit_hours', 'course_type', 'is_active']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'capacity', 'is_active']


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'name', 'session', 'effective_date', 'year_of_study', 'program', 'is_active']


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'slot_number', 'start_time', 'end_time', 'is_break', 'label']


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ['id', 'name', 'start_date', 'end_date', 'is_active', 'is_published']


class RoutineSlotSerializer(serializers.ModelSerializer):
    batch = BatchSerializer()
    course = CourseSerializer()
    room = RoomSerializer()
    time_slot = TimeSlotSerializer()
    teachers = serializers.SerializerMethodField()
    day = serializers.CharField(source='day_of_week')

    class Meta:
        model = RoutineSlot
        fields = [
            'id', 'semester', 'batch', 'course', 'room', 'time_slot',
            'day', 'week_type', 'slot_duration', 'notes',
            'teachers', 'created_at', 'updated_at'
        ]

    def get_teachers(self, obj):
        teachers = obj.teachers.all()
        return TeacherSerializer([ts.teacher for ts in teachers], many=True).data


class RoutineSlotCreateUpdateSerializer(serializers.ModelSerializer):
    teacher_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = RoutineSlot
        fields = [
            'batch', 'course', 'room', 'time_slot',
            'day_of_week', 'week_type', 'slot_duration', 'notes',
            'teacher_ids'
        ]

    def create(self, validated_data):
        teacher_ids = validated_data.pop('teacher_ids', None)

        routine_slot = RoutineSlot.objects.create(**validated_data)

        if teacher_ids:
            for teacher_id in teacher_ids:
                RoutineSlotTeacher.objects.get_or_create(
                    routine_slot=routine_slot,
                    teacher_id=teacher_id
                )

        return routine_slot

    def update(self, instance, validated_data):
        teacher_ids = validated_data.pop('teacher_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if teacher_ids is not None:
            RoutineSlotTeacher.objects.filter(routine_slot=instance).delete()
            for teacher_id in teacher_ids:
                RoutineSlotTeacher.objects.get_or_create(
                    routine_slot=instance,
                    teacher_id=teacher_id
                )

        return instance
