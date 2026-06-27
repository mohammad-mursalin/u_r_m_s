"""
Management command to load the real PUST ICE department routine.
"""

from django.core.management.base import BaseCommand
from apps.routine.models import Teacher, Course, Room, Batch, TimeSlot, Semester, RoutineSlot, RoutineSlotTeacher
import datetime


class Command(BaseCommand):
    help = 'Load the real PUST ICE department routine for January 2026 Semester'

    def handle(self, *args, **options):
        self.stdout.write('Loading seed data first...')
        self.load_seed_data()
        
        self.stdout.write(self.style.SUCCESS('\nCreating January 2026 Semester...'))
        semester = self.create_semester()
        
        inserted = 0
        skipped = 0
        
        for slot_data in self.get_routine_data():
            created = self.create_slot(semester, slot_data)
            if created:
                inserted += 1
            else:
                skipped += 1
        
        self.stdout.write(self.style.SUCCESS(f'\nDone. {inserted} slots inserted, {skipped} skipped (already exist)'))

    def load_seed_data(self):
        """Load seed data to ensure teachers, rooms, batches, timeslots exist."""
        teachers = [
            ('MAH', 'Prof. Dr. Md. Anwar Hossain'),
            ('MOF', 'Dr. Md. Omar Faruk'),
            ('MSH', 'Dr. Md. Sarwar Hosain'),
            ('MIH', 'Dr. Md. Imran Hossain'),
            ('TNT', 'Taskin Noor Turna'),
            ('TD', 'Tarun Debnath'),
            ('AM', 'Akif Mahdi'),
        ]
        for code, name in teachers:
            Teacher.objects.get_or_create(
                short_code=code,
                defaults={'full_name': name, 'designation': 'Lecturer'}
            )

        rooms = [901, 902, 903, 904, 919, 920, 921]
        for room_num in rooms:
            Room.objects.get_or_create(
                room_number=str(room_num),
                defaults={'room_type': 'classroom', 'capacity': 50}
            )

        batches = [
            ('MSc', '2024-2025', '2025-11-02', 'MSc'),
            ('13B', '2020-2021', '2026-01-03', 'BSc'),
            ('14B', '2021-2022', '2025-11-08', 'BSc'),
            ('15B', '2022-2023', '2025-11-29', 'BSc'),
            ('16B', '2023-2024', '2025-11-15', 'BSc'),
        ]
        for name, session, eff_date, prog in batches:
            Batch.objects.get_or_create(
                name=name,
                defaults={
                    'session': session,
                    'effective_date': eff_date,
                    'program': prog
                }
            )

        time_slots = [
            (1, '09:00', '10:00', False, '9:00–10:00 AM'),
            (2, '10:00', '11:00', False, '10:00–11:00 AM'),
            (3, '11:00', '12:00', False, '11:00–12:00 PM'),
            (4, '12:00', '13:00', False, '12:00–1:00 PM'),
            (0, '13:00', '14:00', True, 'Prayer & Lunch Break'),
            (5, '14:00', '15:00', False, '2:00–3:00 PM'),
            (6, '15:00', '16:00', False, '3:00–4:00 PM'),
            (7, '16:00', '17:00', False, '4:00–5:00 PM'),
        ]
        for num, start, end, is_break, label in time_slots:
            TimeSlot.objects.get_or_create(
                slot_number=num,
                defaults={
                    'start_time': start,
                    'end_time': end,
                    'is_break': is_break,
                    'label': label
                }
            )

    def create_semester(self):
        semester, created = Semester.objects.get_or_create(
            name='January 2026 Semester',
            defaults={
                'start_date': datetime.date(2026, 1, 3),
                'is_active': True,
                'is_published': True
            }
        )
        return semester

    def get_routine_data(self):
        """Return the real routine data as list of dicts."""
        return [
            # SATURDAY
            {'day': 'saturday', 'time': '09:00', 'batch': 'MSc', 'course': 'ICE-6603', 'teachers': 'MSH', 'room': '901', 'week_type': 'all'},
            {'day': 'saturday', 'time': '10:00', 'batch': 'MSc', 'course': 'ICE-6603', 'teachers': 'MSH', 'room': '901', 'week_type': 'all'},
            {'day': 'saturday', 'time': '11:00', 'batch': 'MSc', 'course': 'ICE-6302', 'teachers': 'MAH', 'room': '901', 'week_type': 'all'},
            {'day': 'saturday', 'time': '12:00', 'batch': 'MSc', 'course': 'ICE-6302', 'teachers': 'MAH', 'room': '901', 'week_type': 'all'},
            {'day': 'saturday', 'time': '14:00', 'batch': 'MSc', 'course': 'ICE-6603', 'teachers': 'MSH', 'room': '901', 'week_type': 'all'},
            {'day': 'saturday', 'time': '15:00', 'batch': 'MSc', 'course': 'ICE-6302', 'teachers': 'MAH', 'room': '901', 'week_type': 'all'},
            
            {'day': 'saturday', 'time': '09:00', 'batch': '13B', 'course': 'ICE-4203', 'teachers': 'MAH', 'room': '904', 'week_type': 'all'},
            {'day': 'saturday', 'time': '10:00', 'batch': '13B', 'course': 'ICE-4203', 'teachers': 'MAH', 'room': '904', 'week_type': 'all'},
            {'day': 'saturday', 'time': '11:00', 'batch': '13B', 'course': 'ICE-4201', 'teachers': 'MSH', 'room': '904', 'week_type': 'all'},
            
            {'day': 'saturday', 'time': '14:00', 'batch': '14B', 'course': 'ICE-4205', 'teachers': 'MIH', 'room': '904', 'week_type': 'all'},
            {'day': 'saturday', 'time': '15:00', 'batch': '14B', 'course': 'ICE-4212', 'teachers': 'MOF', 'room': '904', 'week_type': 'all'},
            {'day': 'saturday', 'time': '16:00', 'batch': '14B', 'course': 'ICE-4212', 'teachers': 'MOF', 'room': '904', 'week_type': 'all'},
            
            {'day': 'saturday', 'time': '09:00', 'batch': '15B', 'course': 'ICE-3101', 'teachers': 'TD', 'room': '902', 'week_type': 'all'},
            {'day': 'saturday', 'time': '10:00', 'batch': '15B', 'course': 'ICE-3101', 'teachers': 'TD', 'room': '902', 'week_type': 'all'},
            {'day': 'saturday', 'time': '11:00', 'batch': '15B', 'course': 'ICE-3105', 'teachers': 'MIH', 'room': '902', 'week_type': 'all'},
            {'day': 'saturday', 'time': '12:00', 'batch': '15B', 'course': 'ICE-3105', 'teachers': 'MIH', 'room': '902', 'week_type': 'all'},
            {'day': 'saturday', 'time': '14:00', 'batch': '15B', 'course': 'ICE-3102', 'teachers': 'TD', 'room': '921', 'week_type': 'odd'},
            {'day': 'saturday', 'time': '14:00', 'batch': '15B', 'course': 'CSE-3102', 'teachers': 'TD', 'room': '921', 'week_type': 'even'},
            
            {'day': 'saturday', 'time': '09:00', 'batch': '16B', 'course': 'ICE-2105', 'teachers': 'TNT', 'room': '903', 'week_type': 'all'},
            {'day': 'saturday', 'time': '10:00', 'batch': '16B', 'course': 'ICE-2105', 'teachers': 'TNT', 'room': '903', 'week_type': 'all'},
            {'day': 'saturday', 'time': '11:00', 'batch': '16B', 'course': 'ICE-2103', 'teachers': 'MOF', 'room': '903', 'week_type': 'all'},
            {'day': 'saturday', 'time': '12:00', 'batch': '16B', 'course': 'ICE-2103', 'teachers': 'MOF', 'room': '903', 'week_type': 'all'},
            {'day': 'saturday', 'time': '14:00', 'batch': '16B', 'course': 'MATH-2102', 'teachers': 'MAH', 'room': '920', 'week_type': 'all'},
            
            # SUNDAY
            {'day': 'sunday', 'time': '09:00', 'batch': '13B', 'course': 'ICE-4201', 'teachers': 'MSH', 'room': '902', 'week_type': 'all'},
            {'day': 'sunday', 'time': '10:00', 'batch': '13B', 'course': 'ICE-4201', 'teachers': 'MSH', 'room': '902', 'week_type': 'all'},
            {'day': 'sunday', 'time': '11:00', 'batch': '13B', 'course': 'ICE-4212', 'teachers': 'MOF', 'room': '902', 'week_type': 'all'},
            {'day': 'sunday', 'time': '12:00', 'batch': '13B', 'course': 'ICE-4203', 'teachers': 'MAH', 'room': '921', 'week_type': 'all'},
            {'day': 'sunday', 'time': '14:00', 'batch': '13B', 'course': 'ICE-4202', 'teachers': 'MSH', 'room': '921', 'week_type': 'even'},
            {'day': 'sunday', 'time': '14:00', 'batch': '13B', 'course': 'ICE-4217', 'teachers': 'MAH', 'room': '921', 'week_type': 'odd'},
            
            {'day': 'sunday', 'time': '09:00', 'batch': '14B', 'course': 'ICE-3201', 'teachers': 'TNT', 'room': '904', 'week_type': 'all'},
            {'day': 'sunday', 'time': '10:00', 'batch': '14B', 'course': 'ICE-3201', 'teachers': 'TNT', 'room': '904', 'week_type': 'all'},
            {'day': 'sunday', 'time': '11:00', 'batch': '14B', 'course': 'ICE-3205', 'teachers': 'MSH', 'room': '904', 'week_type': 'all'},
            {'day': 'sunday', 'time': '12:00', 'batch': '14B', 'course': 'ICE-3207', 'teachers': 'MSH', 'room': '904', 'week_type': 'all'},
            {'day': 'sunday', 'time': '14:00', 'batch': '14B', 'course': 'ICE-3204', 'teachers': 'MOF', 'room': '920', 'week_type': 'all'},
            
            {'day': 'sunday', 'time': '10:00', 'batch': '15B', 'course': 'ICE-3106', 'teachers': 'MIH', 'room': '921', 'week_type': 'odd'},
            {'day': 'sunday', 'time': '12:00', 'batch': '15B', 'course': 'ICE-3107', 'teachers': 'MOF', 'room': '902', 'week_type': 'all'},
            
            {'day': 'sunday', 'time': '09:00', 'batch': '16B', 'course': 'MATH-2101', 'teachers': 'MAH', 'room': '903', 'week_type': 'all'},
            {'day': 'sunday', 'time': '10:00', 'batch': '16B', 'course': 'MATH-2101', 'teachers': 'MAH', 'room': '903', 'week_type': 'all'},
            {'day': 'sunday', 'time': '11:00', 'batch': '16B', 'course': 'STAT-2101', 'teachers': 'MSH', 'room': '903', 'week_type': 'all'},
            {'day': 'sunday', 'time': '12:00', 'batch': '16B', 'course': 'ICE-2101', 'teachers': 'TD', 'room': '903', 'week_type': 'all'},
            {'day': 'sunday', 'time': '14:00', 'batch': '16B', 'course': 'ICE-2102', 'teachers': 'TD', 'room': '919', 'week_type': 'all'},
            
            # MONDAY
            {'day': 'monday', 'time': '09:00', 'batch': '13B', 'course': 'ICE-4221', 'teachers': 'TD', 'room': '920', 'week_type': 'all'},
            {'day': 'monday', 'time': '10:00', 'batch': '13B', 'course': 'ICE-4205', 'teachers': 'MIH', 'room': '920', 'week_type': 'all'},
            {'day': 'monday', 'time': '11:00', 'batch': '13B', 'course': 'ICE-4205', 'teachers': 'MIH', 'room': '920', 'week_type': 'all'},
            {'day': 'monday', 'time': '12:00', 'batch': '13B', 'course': 'ICE-4216', 'teachers': 'MAH', 'room': '920', 'week_type': 'all'},
            
            {'day': 'monday', 'time': '09:00', 'batch': '14B', 'course': 'ICE-3203', 'teachers': 'MOF', 'room': '904', 'week_type': 'all'},
            {'day': 'monday', 'time': '10:00', 'batch': '14B', 'course': 'ICE-3203', 'teachers': 'MOF', 'room': '904', 'week_type': 'all'},
            {'day': 'monday', 'time': '11:00', 'batch': '14B', 'course': 'ICE-3209', 'teachers': 'TNT', 'room': '904', 'week_type': 'all'},
            {'day': 'monday', 'time': '12:00', 'batch': '14B', 'course': 'ICE-3201', 'teachers': 'TNT', 'room': '904', 'week_type': 'all'},
            {'day': 'monday', 'time': '14:00', 'batch': '14B', 'course': 'ICE-3208', 'teachers': 'MSH+MIH', 'room': '920', 'week_type': 'all'},
            
            {'day': 'monday', 'time': '09:00', 'batch': '15B', 'course': 'ICE-3103', 'teachers': 'MSH', 'room': '902', 'week_type': 'all'},
            {'day': 'monday', 'time': '10:00', 'batch': '15B', 'course': 'CSE-3101', 'teachers': 'TD', 'room': '902', 'week_type': 'all'},
            {'day': 'monday', 'time': '11:00', 'batch': '15B', 'course': 'CSE-3101', 'teachers': 'TD', 'room': '902', 'week_type': 'all'},
            {'day': 'monday', 'time': '12:00', 'batch': '15B', 'course': 'ICE-3105', 'teachers': 'MIH', 'room': '902', 'week_type': 'all'},
            
            {'day': 'monday', 'time': '09:00', 'batch': '16B', 'course': 'MATH-2101', 'teachers': 'MAH', 'room': '903', 'week_type': 'all'},
            {'day': 'monday', 'time': '10:00', 'batch': '16B', 'course': 'ICE-2105', 'teachers': 'TNT', 'room': '903', 'week_type': 'all'},
            {'day': 'monday', 'time': '11:00', 'batch': '16B', 'course': 'ICE-2103', 'teachers': 'MOF', 'room': '903', 'week_type': 'all'},
            {'day': 'monday', 'time': '12:00', 'batch': '16B', 'course': 'STAT-2101', 'teachers': 'MSH', 'room': '903', 'week_type': 'all'},
            {'day': 'monday', 'time': '14:00', 'batch': '16B', 'course': 'ICE-2106', 'teachers': 'TNT', 'room': '919', 'week_type': 'all'},
            
            # TUESDAY
            {'day': 'tuesday', 'time': '09:00', 'batch': '13B', 'course': 'ICE-4222', 'teachers': 'MIH', 'room': '903', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '10:00', 'batch': '13B', 'course': 'ICE-4221', 'teachers': 'TD', 'room': '903', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '11:00', 'batch': '13B', 'course': 'ICE-4221', 'teachers': 'TD', 'room': '903', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '14:00', 'batch': '13B', 'course': 'ICE-4206', 'teachers': 'MIH', 'room': '921', 'week_type': 'even'},
            {'day': 'tuesday', 'time': '14:00', 'batch': '13B', 'course': 'ICE-4204', 'teachers': 'MAH', 'room': '921', 'week_type': 'odd'},
            
            {'day': 'tuesday', 'time': '09:00', 'batch': '14B', 'course': 'ICE-3205', 'teachers': 'TD', 'room': '904', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '10:00', 'batch': '14B', 'course': 'ICE-3207', 'teachers': 'MIH', 'room': '904', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '11:00', 'batch': '14B', 'course': 'ICE-3207', 'teachers': 'MIH', 'room': '904', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '12:00', 'batch': '14B', 'course': 'ICE-3203', 'teachers': 'MOF', 'room': '904', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '14:00', 'batch': '14B', 'course': 'ICE-3202', 'teachers': 'TNT', 'room': '920', 'week_type': 'all'},
            
            {'day': 'tuesday', 'time': '10:00', 'batch': '15B', 'course': 'ICE-3104', 'teachers': 'MSH', 'room': '920', 'week_type': 'odd'},
            {'day': 'tuesday', 'time': '12:00', 'batch': '15B', 'course': 'ICE-3101', 'teachers': 'TD', 'room': '902', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '14:00', 'batch': '15B', 'course': 'ICE-3103', 'teachers': 'MSH', 'room': '902', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '15:00', 'batch': '15B', 'course': 'ICE-3103', 'teachers': 'MSH', 'room': '902', 'week_type': 'all'},
            
            {'day': 'tuesday', 'time': '12:00', 'batch': '16B', 'course': 'STAT-2101', 'teachers': 'MSH', 'room': '903', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '14:00', 'batch': '16B', 'course': 'ICE-2101', 'teachers': 'TD', 'room': '903', 'week_type': 'all'},
            {'day': 'tuesday', 'time': '15:00', 'batch': '16B', 'course': 'ICE-2101', 'teachers': 'TD', 'room': '903', 'week_type': 'all'},
            
            # WEDNESDAY
            {'day': 'wednesday', 'time': '09:00', 'batch': '13B', 'course': 'ICE-4222', 'teachers': 'MIH', 'room': '903', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '10:00', 'batch': '13B', 'course': 'ICE-4222', 'teachers': 'MIH', 'room': '903', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '11:00', 'batch': '13B', 'course': 'ICE-4216', 'teachers': 'MAH', 'room': '903', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '12:00', 'batch': '13B', 'course': 'ICE-4216', 'teachers': 'MAH', 'room': '903', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '14:00', 'batch': '13B', 'course': 'ICE-4213', 'teachers': 'MOF', 'room': '919', 'week_type': 'even'},
            
            {'day': 'wednesday', 'time': '10:00', 'batch': '14B', 'course': 'ICE-3209', 'teachers': 'TNT', 'room': '904', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '11:00', 'batch': '14B', 'course': 'ICE-3209', 'teachers': 'TNT', 'room': '904', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '12:00', 'batch': '14B', 'course': 'ICE-3205', 'teachers': 'MIH', 'room': '904', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '14:00', 'batch': '14B', 'course': 'ICE-3206', 'teachers': 'MIH+TD', 'room': '921', 'week_type': 'all'},
            
            {'day': 'wednesday', 'time': '09:00', 'batch': '15B', 'course': 'ICE-3107', 'teachers': 'MOF', 'room': '902', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '10:00', 'batch': '15B', 'course': 'ICE-3107', 'teachers': 'MOF', 'room': '902', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '11:00', 'batch': '15B', 'course': 'ICE-3103', 'teachers': 'MSH', 'room': '902', 'week_type': 'all'},
            {'day': 'wednesday', 'time': '12:00', 'batch': '15B', 'course': 'CSE-3101', 'teachers': 'TD', 'room': '902', 'week_type': 'all'},
        ]

    def create_slot(self, semester, data):
        """Create a single routine slot. Returns True if created, False if skipped."""
        batch = Batch.objects.get(name=data['batch'])
        
        course, _ = Course.objects.get_or_create(
            code=data['course'],
            defaults={'name': data['course'], 'credit_hours': 3.0, 'course_type': 'theory'}
        )
        
        room = Room.objects.get(room_number=data['room'])
        
        slot_num = {
            '09:00': 1, '10:00': 2, '11:00': 3, '12:00': 4,
            '14:00': 5, '15:00': 6, '16:00': 7
        }[data['time']]
        
        time_slot = TimeSlot.objects.get(slot_number=slot_num)
        
        slot, created = RoutineSlot.objects.get_or_create(
            semester=semester,
            batch=batch,
            time_slot=time_slot,
            day_of_week=data['day'],
            week_type=data['week_type'],
            defaults={'course': course, 'room': room, 'slot_duration': 1}
        )
        
        if created:
            for teacher_code in data['teachers'].split('+'):
                teacher = Teacher.objects.get(short_code=teacher_code.strip())
                RoutineSlotTeacher.objects.get_or_create(
                    routine_slot=slot,
                    teacher=teacher
                )
            teacher_str = '+'.join(t.strip() for t in data['teachers'].split('+'))
            self.stdout.write(f'Added: {data["day"][:3].upper()} | {data["batch"]} | {data["time"]} | {data["course"]} | {teacher_str} | Room {data["room"]}')
        
        return created