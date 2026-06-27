"""
Management command to load seed data.
"""

from django.core.management.base import BaseCommand
from apps.routine.models import Teacher, Course, Room, Batch, TimeSlot, Semester


class Command(BaseCommand):
    help = 'Load seed data for the routine management system'

    def handle(self, *args, **options):
        self.load_semesters()
        self.load_teachers()
        self.load_courses()
        self.load_rooms()
        self.load_time_slots()
        self.load_batches()
        self.stdout.write(self.style.SUCCESS('Seed data loaded successfully!'))

    def load_semesters(self):
        """Load seed semester data."""
        import datetime
        semesters_data = [
            ('Fall 2026', '2026-09-01', '2026-12-31', True),
            ('Spring 2026', '2026-01-01', '2026-05-31', False),
        ]

        for name, start_date, end_date, is_active in semesters_data:
            Semester.objects.get_or_create(
                name=name,
                defaults={
                    'start_date': datetime.date.fromisoformat(start_date),
                    'end_date': datetime.date.fromisoformat(end_date),
                    'is_active': is_active,
                    'is_published': False
                }
            )
        self.stdout.write(self.style.SUCCESS('Semesters loaded successfully!'))

    def load_courses(self):
        """Load seed courses data."""
        courses_data = [
            ('ICE101', 'Introduction to Computer Science', 3.0, 'theory'),
            ('ICE102', 'Programming Fundamentals', 3.0, 'lab'),
            ('ICE201', 'Data Structures', 3.0, 'theory'),
            ('ICE202', 'Database Systems', 3.0, 'theory'),
            ('ICE301', 'Software Engineering', 3.0, 'theory'),
        ]

        for code, name, credit_hours, course_type in courses_data:
            Course.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'credit_hours': credit_hours,
                    'course_type': course_type
                }
            )
        self.stdout.write(self.style.SUCCESS('Courses loaded successfully!'))

    def load_teachers(self):
        """Load seed teachers data."""
        teachers_data = [
            ('MAH', 'Prof. Dr. Md. Anwar Hossain'),
            ('MOF', 'Dr. Md. Omar Faruk'),
            ('MSH', 'Dr. Md. Sarwar Hosain'),
            ('MIH', 'Dr. Md. Imran Hossain'),
            ('TNT', 'Taskin Noor Turna'),
            ('TD', 'Tarun Debnath'),
            ('AM', 'Akif Mahdi'),
        ]

        for short_code, full_name in teachers_data:
            Teacher.objects.get_or_create(
                short_code=short_code,
                defaults={
                    'full_name': full_name,
                    'designation': 'Lecturer'
                }
            )
        self.stdout.write(self.style.SUCCESS('Teachers loaded successfully!'))

    def load_rooms(self):
        """Load seed rooms data."""
        rooms_data = [
            901, 902, 903, 904, 919, 920, 921
        ]

        for room_number in rooms_data:
            Room.objects.get_or_create(
                room_number=str(room_number),
                defaults={
                    'room_type': 'classroom',
                    'capacity': 50
                }
            )
        self.stdout.write(self.style.SUCCESS('Rooms loaded successfully!'))

    def load_time_slots(self):
        """Load seed time slots data."""
        time_slots_data = [
            (1, '09:00', '10:00', False, '9:00–10:00 AM'),
            (2, '10:00', '11:00', False, '10:00–11:00 AM'),
            (3, '11:00', '12:00', False, '11:00–12:00 PM'),
            (4, '12:00', '13:00', False, '12:00–1:00 PM'),
            (0, '13:00', '14:00', True, 'Prayer & Lunch Break'),
            (5, '14:00', '15:00', False, '2:00–3:00 PM'),
            (6, '15:00', '16:00', False, '3:00–4:00 PM'),
            (7, '16:00', '17:00', False, '4:00–5:00 PM'),
        ]

        for slot_number, start_time, end_time, is_break, label in time_slots_data:
            TimeSlot.objects.get_or_create(
                slot_number=slot_number,
                defaults={
                    'start_time': start_time,
                    'end_time': end_time,
                    'is_break': is_break,
                    'label': label
                }
            )
        self.stdout.write(self.style.SUCCESS('Time slots loaded successfully!'))

    def load_batches(self):
        """Load seed batches data."""
        batches_data = [
            ('MSc', '2024-2025', '2025-11-02', 'MSc'),
            ('13B', '2020-2021', '2026-01-03', 'BSc'),
            ('14B', '2021-2022', '2025-11-08', 'BSc'),
            ('15B', '2022-2023', '2025-11-29', 'BSc'),
            ('16B', '2023-2024', '2025-11-15', 'BSc'),
            ('17B', '2024-2025', '2025-08-11', 'BSc'),
        ]

        for name, session, effective_date, program in batches_data:
            Batch.objects.get_or_create(
                name=name,
                defaults={
                    'session': session,
                    'effective_date': effective_date,
                    'program': program
                }
            )
        self.stdout.write(self.style.SUCCESS('Batches loaded successfully!'))
