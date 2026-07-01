# Database Schema
# University Routine Management System

All tables use PostgreSQL. Django ORM manages migrations.

---

## 1. Entity Relationship Overview

```
Semester
  └── RoutineSlot (many)
        ├── Batch (FK)
        ├── Course (FK)
        ├── Room (FK)
        ├── TimeSlot (FK)
        └── RoutineSlotTeacher (M2M) ← supports multi-teacher slots
              └── Teacher (FK)

Teacher
  └── User (OneToOne) ← Django built-in User model

Course ← standalone master data
Room   ← standalone master data
Batch  ← standalone master data
TimeSlot ← standalone master data
```

---

## 2. Tables

---

### 2.1 `accounts_user` (Django Built-in, extended)
Django's default `auth_user` table. No custom fields needed for v1.

Fields used:
| Field | Type | Notes |
|-------|------|-------|
| id | int PK | auto |
| username | varchar | used as email |
| email | varchar | admin's email |
| password | varchar | hashed by Django |
| is_staff | bool | True = can access admin |
| is_superuser | bool | True = full access |
| is_active | bool | True = can login |

---

### 2.2 `routine_teacher`
Represents faculty members who teach courses.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | auto-increment |
| full_name | VARCHAR(200) | NOT NULL | e.g. "Prof. Dr. Md. Anwar Hossain" |
| short_code | VARCHAR(10) | NOT NULL, UNIQUE | e.g. "MAH" — shown in routine grid |
| email | VARCHAR(254) | NULLABLE, UNIQUE | optional contact |
| designation | VARCHAR(100) | NULLABLE | e.g. "Professor", "Lecturer" |
| is_active | BOOLEAN | DEFAULT TRUE | soft delete |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | auto-update | |

**Seed data from real routine:**
```
MAH → Prof. Dr. Md. Anwar Hossain
MOF → Dr. Md. Omar Faruk
MSH → Dr. Md. Sarwar Hosain
MIH → Dr. Md. Imran Hossain
TNT → Taskin Noor Turna
TD  → Tarun Debnath
AM  → Akif Mahdi
```

---

### 2.3 `routine_course`
Represents academic courses offered by the department.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| code | VARCHAR(20) | NOT NULL, UNIQUE | e.g. "ICE-3101", "CSE-3101", "MATH-2101" |
| name | VARCHAR(200) | NOT NULL | e.g. "Digital Electronics" |
| credit_hours | DECIMAL(3,1) | NOT NULL | e.g. 3.0 or 1.5 |
| course_type | VARCHAR(10) | NOT NULL | ENUM: 'theory' or 'lab' |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | auto-update | |

---

### 2.4 `routine_room`
Classrooms and labs in the department building.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| room_number | VARCHAR(20) | NOT NULL, UNIQUE | e.g. "901", "919" |
| room_type | VARCHAR(15) | NOT NULL | ENUM: 'classroom' or 'lab' |
| capacity | INTEGER | NULLABLE | seating capacity |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | auto-update | |

**Seed data from real routine:**
Rooms: 901, 902, 903, 904, 919, 920, 921

---

### 2.5 `routine_batch`
Represents a student batch/cohort.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| name | VARCHAR(20) | NOT NULL, UNIQUE | e.g. "15B", "MSc", "13B" |
| session | VARCHAR(20) | NOT NULL | e.g. "2022-2023" |
| effective_date | DATE | NOT NULL | date routine is effective from |
| year_of_study | INTEGER | NULLABLE | 1, 2, 3, 4 or NULL for MSc |
| program | VARCHAR(10) | DEFAULT 'BSc' | ENUM: 'BSc' or 'MSc' |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | auto-update | |

**Seed data from real routine:**
```
MSc  | 2024-2025 | 02.11.2025 | MSc
13B  | 2020-2021 | 03.01.2026 | BSc
14B  | 2021-2022 | 08.11.2025 | BSc
15B  | 2022-2023 | 29.11.2025 | BSc
16B  | 2023-2024 | 15.11.2025 | BSc
17B  | 2024-2025 | 11.08.2025 | BSc
```

---

### 2.6 `routine_timeslot`
Defines the fixed time blocks in a day.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| slot_number | INTEGER | NOT NULL | display order: 1, 2, 3... |
| start_time | TIMETZ | NOT NULL | e.g. 09:00 |
| end_time | TIMETZ | NOT NULL | e.g. 10:00 |
| is_break | BOOLEAN | DEFAULT FALSE | TRUE for 1–2pm lunch break |
| label | VARCHAR(30) | NULLABLE | e.g. "9:00–10:00 AM" |

**Seed data:**
```
1 | 09:00 | 10:00 | is_break=False
2 | 10:00 | 11:00 | is_break=False
3 | 11:00 | 12:00 | is_break=False
4 | 12:00 | 13:00 | is_break=False
— | 13:00 | 14:00 | is_break=True  ← Prayer & Lunch Break
5 | 14:00 | 15:00 | is_break=False
6 | 15:00 | 16:00 | is_break=False
7 | 16:00 | 17:00 | is_break=False
```

---

### 2.7 `routine_semester`
Represents an academic semester. The "active" one is shown publicly.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| name | VARCHAR(100) | NOT NULL, UNIQUE | e.g. "January 2026 Semester" |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NULLABLE | |
| is_active | BOOLEAN | DEFAULT FALSE | only ONE can be TRUE at a time |
| is_published | BOOLEAN | DEFAULT FALSE | FALSE = draft, admin only |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | auto-update | |

> **Rule:** When setting `is_active = True` for a semester, a Django signal automatically sets all other semesters' `is_active = False`.

---

### 2.8 `routine_routineslot`
**Core table.** Each row is one cell in the timetable grid.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| semester_id | INTEGER | FK → routine_semester | |
| batch_id | INTEGER | FK → routine_batch | |
| course_id | INTEGER | FK → routine_course | |
| room_id | INTEGER | FK → routine_room | |
| time_slot_id | INTEGER | FK → routine_timeslot | |
| day_of_week | VARCHAR(10) | NOT NULL | ENUM: 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday' |
| week_type | VARCHAR(10) | DEFAULT 'all' | ENUM: 'all', 'odd', 'even' |
| slot_duration | INTEGER | DEFAULT 1 | number of consecutive time slots (1 for theory, 2–3 for lab) |
| notes | TEXT | NULLABLE | extra info if needed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | auto-update | |

**Unique constraint:**
```sql
UNIQUE (semester_id, batch_id, time_slot_id, day_of_week, week_type)
-- Prevents same batch being assigned twice to same slot
-- BUT: 'odd' and 'even' do NOT conflict with each other
```

---

### 2.9 `routine_routineslotteacher` (Junction Table)
Supports multi-teacher slots (e.g. MSH + MIH together in Room 920).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | SERIAL | PK | |
| routine_slot_id | INTEGER | FK → routine_routineslot | |
| teacher_id | INTEGER | FK → routine_teacher | |

**Unique constraint:**
```sql
UNIQUE (routine_slot_id, teacher_id)
```

> This means a RoutineSlot can have 1 or more teachers attached via this table.

---

## 3. Django Model Summary

```python
# Quick reference for the agent — full models go in routine/models.py

class Teacher(models.Model):
    full_name, short_code (unique), email, designation, is_active

class Course(models.Model):
    code (unique), name, credit_hours, course_type ('theory'/'lab'), is_active

class Room(models.Model):
    room_number (unique), room_type ('classroom'/'lab'), capacity, is_active

class Batch(models.Model):
    name (unique), session, effective_date, year_of_study, program, is_active

class TimeSlot(models.Model):
    slot_number, start_time, end_time, is_break, label

class Semester(models.Model):
    name (unique), start_date, end_date, is_active, is_published

class RoutineSlot(models.Model):
    semester (FK), batch (FK), course (FK), room (FK),
    time_slot (FK), day_of_week, week_type, slot_duration, notes
    teachers = ManyToManyField(Teacher, through='RoutineSlotTeacher')

class RoutineSlotTeacher(models.Model):
    routine_slot (FK), teacher (FK)
    # unique_together: (routine_slot, teacher)
```

---

## 4. Indexes to Create

```sql
-- Speed up the most common query: "get all slots for active semester"
CREATE INDEX idx_routineslot_semester ON routine_routineslot(semester_id);

-- Speed up filter by day
CREATE INDEX idx_routineslot_day ON routine_routineslot(day_of_week);

-- Speed up teacher schedule lookup
CREATE INDEX idx_slotteacher_teacher ON routine_routineslotteacher(teacher_id);

-- Speed up batch schedule lookup
CREATE INDEX idx_routineslot_batch ON routine_routineslot(batch_id);
```
