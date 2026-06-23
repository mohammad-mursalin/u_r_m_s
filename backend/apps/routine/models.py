"""
Routine app models.
"""

from django.db import models
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone


class Teacher(models.Model):
    full_name = models.CharField(max_length=200)
    short_code = models.CharField(max_length=10, unique=True)
    email = models.EmailField(max_length=254, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'
        ordering = ['full_name']

    def __str__(self):
        return f"{self.short_code} — {self.full_name}"


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    credit_hours = models.DecimalField(max_digits=3, decimal_places=1)
    course_type = models.CharField(max_length=10, choices=[
        ('theory', 'Theory'),
        ('lab', 'Lab')
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} — {self.name}"


class Room(models.Model):
    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=15, choices=[
        ('classroom', 'Classroom'),
        ('lab', 'Lab')
    ])
    capacity = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
        ordering = ['room_number']

    def __str__(self):
        return f"{self.room_number} ({self.room_type})"


class Batch(models.Model):
    name = models.CharField(max_length=20, unique=True)
    session = models.CharField(max_length=20)
    effective_date = models.DateField()
    year_of_study = models.IntegerField(null=True, blank=True)
    program = models.CharField(max_length=10, default='BSc', choices=[
        ('BSc', 'BSc'),
        ('MSc', 'MSc')
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Batch'
        verbose_name_plural = 'Batches'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.session})"


class TimeSlot(models.Model):
    slot_number = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)
    label = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        verbose_name = 'Time Slot'
        verbose_name_plural = 'Time Slots'
        ordering = ['slot_number']

    def __str__(self):
        return f"{self.start_time} - {self.end_time}" if not self.is_break else f"{self.label or 'Break'}"


class Semester(models.Model):
    name = models.CharField(max_length=100, unique=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Semester'
        verbose_name_plural = 'Semesters'
        ordering = ['-start_date']

    def __str__(self):
        return self.name


@receiver(pre_save, sender=Semester)
def set_active_semester(sender, instance, **kwargs):
    """
    Automatically set all other semesters' is_active to False when one is set to True.
    """
    if instance.is_active:
        Semester.objects.exclude(pk=instance.pk).update(is_active=False)


class RoutineSlot(models.Model):
    SEMESTER = 'routine_semester'
    BATCH = 'routine_batch'
    COURSE = 'routine_course'
    ROOM = 'routine_room'
    TIMESLOT = 'routine_timeslot'

    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='slots')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='slots')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='slots')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='slots')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='slots')
    day_of_week = models.CharField(max_length=10, choices=[
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday')
    ])
    week_type = models.CharField(max_length=10, default='all', choices=[
        ('all', 'All Weeks'),
        ('odd', 'Odd Weeks Only'),
        ('even', 'Even Weeks Only')
    ])
    slot_duration = models.IntegerField(default=1)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Routine Slot'
        verbose_name_plural = 'Routine Slots'
        ordering = ['day_of_week', 'time_slot']
        unique_together = [
            ('semester', 'batch', 'time_slot', 'day_of_week', 'week_type')
        ]

    def __str__(self):
        return f"{self.day_of_week.capitalize()} — {self.batch.name} — {self.time_slot.start_time}"


class RoutineSlotTeacher(models.Model):
    routine_slot = models.ForeignKey(RoutineSlot, on_delete=models.CASCADE, related_name='teachers')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'Routine Slot Teacher'
        verbose_name_plural = 'Routine Slot Teachers'
        unique_together = [('routine_slot', 'teacher')]
        ordering = ['routine_slot']

    def __str__(self):
        return f"{self.routine_slot} — {self.teacher.short_code}"
