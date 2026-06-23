# Product Requirements Document (PRD)
# University Routine Management System
**Project:** B.Sc. Final Year Project — 3rd Year, 2nd Semester  
**University:** Pabna University of Science and Technology  
**Department:** Information and Communication Engineering (ICE)  
**Version:** 1.0  
**Date:** 2026

---

## 1. Project Overview

A web-based routine management system that allows a designated admin to create, manage, and publish class schedules for the ICE department. The public (students, teachers) can view the routine without logging in. The system must detect scheduling conflicts automatically and support complex real-world constraints like alternating odd/even week slots and multi-hour lab sessions.

---

## 2. Problem Statement

Every semester, the admin creates the class routine manually from scratch — assigning courses, teachers, rooms, and time slots by hand, with no automated conflict detection. This is error-prone, time-consuming, and hard to update when changes occur mid-semester.

**This app solves:**
- Difficult routine creation from scratch each semester
- No automatic detection of teacher/room double-booking
- No easy way for students/teachers to find their personalized schedule

---

## 3. Users & Roles

### 3.1 Public User (No Login Required)
- Students, teachers, visitors
- Can view the full department routine
- Can filter routine by: batch, teacher, day, room
- Cannot modify anything

### 3.2 Admin (Login Required)
- Designated coordinator of the ICE department
- Full CRUD on all routine data
- Only one or two admin accounts exist (created manually in the system)
- Can publish/unpublish a routine (draft mode)

> **Note:** There is NO self-registration. Admin accounts are created by the developer/superadmin only.

---

## 4. Core Features

### 4.1 Public Routine View (Priority: HIGH)
- Display the full weekly routine as a grid (Days × Time Slots)
- Each cell shows: Course Code, Teacher Code, Room Number
- Color-coded by batch
- Responsive — works on mobile
- Filter panel: filter by Batch, Teacher, Day
- Print / export to PDF button

### 4.2 Admin Login (Priority: HIGH)
- Email + password login via Django's auth system
- Redirect to admin dashboard after login
- Session-based authentication
- No "Forgot Password" flow needed for v1

### 4.3 Admin Dashboard (Priority: HIGH)
- Overview stats: total courses, teachers, rooms, batches
- Quick links to manage each entity
- Current semester's routine summary

### 4.4 Master Data Management (Priority: HIGH)
Admin can create/edit/delete:
- **Teachers** — name, short code (e.g. MAH), email
- **Courses** — course code (e.g. ICE-3101), course name, credit hours, type (theory/lab)
- **Rooms** — room number, capacity, type (classroom/lab)
- **Batches** — batch name (e.g. 15B), year, section, session (e.g. 2022-2023), effective date
- **Time Slots** — start time, end time, day of week
- **Semesters** — name, start date, is_active flag

### 4.5 Routine Builder (Priority: HIGH)
- Grid-based UI (Days × Time Slots) for building the routine
- Admin clicks a cell and assigns: Course + Teacher + Room + Batch
- Support for special slot types:
  - **Odd week only** slots
  - **Even week only** slots
  - **Multi-teacher slots** (e.g. MSH + MIH in same room)
  - **Multi-hour slots** (lab sessions spanning 2–3 time slots)
- Lunch/Prayer break slot (1:00–2:00) is fixed and non-assignable
- Drag-and-drop to move slots (v2, not required for v1)

### 4.6 Conflict Detection (Priority: HIGH)
Automatically flag conflicts when saving a routine slot:
- Same teacher assigned to two classes at the same time
- Same room assigned to two classes at the same time
- Same batch assigned to two classes at the same time
- Show conflict as a red warning with details — do not silently block

### 4.7 Semester Management (Priority: MEDIUM)
- Admin can create a new semester and clone the previous routine as a starting point
- Mark one semester as "active" — this is what the public sees
- Archive old semesters (still viewable but not editable)

### 4.8 Teacher Personal Schedule View (Priority: MEDIUM)
- Public page: `/schedule/teacher/<teacher-code>`
- Shows only that teacher's slots for the week
- Useful for teachers to share their own link

### 4.9 Batch Schedule View (Priority: MEDIUM)
- Public page: `/schedule/batch/<batch-name>`
- Shows only that batch's classes for the week

---

## 5. Out of Scope (v1)

- Student/teacher self-registration or profiles
- Notifications or announcements
- Attendance tracking
- Exam schedule management
- Mobile app
- Multi-department support (only ICE department for now)
- Drag-and-drop routine builder (planned for v2)

---

## 6. Real Routine Data (Extracted from Image)

### Days
Saturday, Sunday, Monday, Tuesday, Wednesday

### Time Slots
| Slot | Start | End |
|------|-------|-----|
| 1 | 09:00 | 10:00 |
| 2 | 10:00 | 11:00 |
| 3 | 11:00 | 12:00 |
| 4 | 12:00 | 13:00 |
| — | 13:00 | 14:00 | ← Prayer & Lunch Break (fixed) |
| 5 | 14:00 | 15:00 |
| 6 | 15:00 | 16:00 |
| 7 | 16:00 | 17:00 |

### Batches (from routine image)
| Batch | Session | Effective Date |
|-------|---------|----------------|
| MSc | 2024-2025 | 02.11.2025 |
| 13B | 2020-2021 | 03.01.2026 |
| 14B | 2021-2022 | 08.11.2025 |
| 15B | 2022-2023 | 29.11.2025 |
| 16B | 2023-2024 | 15.11.2025 |
| 17B | 2024-2025 | 11.08.2025 |

### Teachers
| Code | Full Name |
|------|-----------|
| MAH | Prof. Dr. Md. Anwar Hossain |
| MOF | Dr. Md. Omar Faruk |
| MSH | Dr. Md. Sarwar Hosain |
| MIH | Dr. Md. Imran Hossain |
| TNT | Taskin Noor Turna |
| TD | Tarun Debnath |
| AM | Akif Mahdi |

### Rooms Used
901, 902, 903, 904, 919, 920, 921

### Sample Courses Seen in Routine
ICE-6603, ICE-6302, ICE-4203, ICE-4201, ICE-4205, ICE-4212, ICE-3101, ICE-3105, ICE-3102, ICE-2105, ICE-2103, ICE-2102, ICE-4221, ICE-4205, ICE-4216, ICE-3203, ICE-3209, ICE-3201, ICE-3208, ICE-3103, CSE-3101, ICE-2106, ICE-4222, ICE-4221, ICE-3205, ICE-3207, ICE-3202, ICE-3104, ICE-2104, ICE-2101, ICE-4222, ICE-3209, ICE-3107, ICE-3103, CSE-3101, ICE-4202, ICE-4217, ICE-3204, ICE-3106, ICE-4213, ICE-3206, ICE-4206, ICE-4204, MATH-2101, MATH-2102, STAT-2101, ICE-2102

---

## 7. Non-Functional Requirements

- Page load under 2 seconds for public routine view
- Works on Chrome, Firefox, Edge (latest versions)
- Mobile responsive (minimum 375px width)
- No data loss — all changes saved to PostgreSQL
- Admin session expires after 8 hours of inactivity

---

## 8. Success Criteria

The project is considered complete when:
1. Admin can log in and build a full semester routine from scratch
2. Conflicts are detected and shown in real time
3. The public can view and filter the routine without logging in
4. The routine matches the structure of the real PUST ICE routine exactly
