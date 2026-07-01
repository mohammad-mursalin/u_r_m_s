# University Routine Management System
## Complete Project Documentation
**Department of Information and Communication Engineering**
**Pabna University of Science and Technology (PUST)**
**Project Type:** B.Sc. Final Year Project — 3rd Year, 2nd Semester

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Database Design](#7-database-design)
8. [API Reference](#8-api-reference)
9. [Frontend Pages](#9-frontend-pages)
10. [Authentication System](#10-authentication-system)
11. [Conflict Detection System](#11-conflict-detection-system)
12. [How to Run the Project](#12-how-to-run-the-project)
13. [Key Workflows](#13-key-workflows)
14. [Real Routine Data](#14-real-routine-data)
15. [Known Limitations](#15-known-limitations)

---

## 1. Project Overview

This is a **web-based class routine management system** built specifically for the ICE Department at Pabna University of Science and Technology. It solves the problem of manually creating and managing class schedules every semester.

The system has two sides:
- **Public side** — Students and teachers can view the routine without logging in
- **Admin side** — A designated coordinator can build, edit, and publish the routine

---

## 2. Problem Statement

Every semester the department coordinator creates the class routine manually on paper or in Excel, with no automatic conflict detection. This leads to:
- Teacher double-bookings (same teacher assigned to two classes at the same time)
- Room double-bookings
- Time-consuming manual work every semester
- No easy way for students to find their schedule
- No version history or rollback

This system solves all of the above.

---

## 3. Features

### Public Features (No Login Required)
| Feature | Description |
|---------|-------------|
| View Full Routine | See the complete weekly timetable grid for all batches |
| Filter by Batch | Show only one batch's classes |
| Filter by Teacher | Show only one teacher's classes |
| Filter by Day | Show only one day's schedule |
| Batch Schedule Page | Dedicated URL for each batch's schedule |
| Teacher Schedule Page | Dedicated URL for each teacher's schedule |
| Download PDF | Print-ready HTML page with full routine |
| Teacher Legend | Shows full names of all teachers below the grid |

### Admin Features (Login Required)
| Feature | Description |
|---------|-------------|
| Email + Password Login | Secure login for admin coordinator |
| Dashboard | Stats overview (courses, teachers, rooms, batches) |
| Routine Builder | Visual grid editor — click any cell to add/edit a slot |
| Conflict Detection | Real-time warnings when teacher/room/batch is double-booked |
| ODD/EVEN Week Support | Different classes on alternating weeks in the same slot |
| Multi-teacher Slots | Assign multiple teachers to one slot (e.g. MSH + MIH) |
| Multi-hour Slots | Creating 2 or 3 consecutive slots in one action |
| Semester Management | Create, activate, publish, unpublish, clone semesters |
| Master Data CRUD | Manage teachers, courses, rooms, batches |
| View Routine (Admin) | Read-only routine view with sidebar still visible |
| Toast Notifications | Auto-dismissing success/error messages |

---

## 4. Tech Stack

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Frontend Framework | React | 18.x | Component-based UI |
| Frontend Routing | React Router | 6.x | Client-side navigation |
| Frontend State | Zustand | 4.x | Lightweight global state |
| Frontend HTTP | Axios | 1.x | API requests |
| Frontend Styling | Tailwind CSS | 3.x | Utility-first CSS |
| UI Components | Headless UI | 1.x | Accessible modals/dialogs |
| Icons | Lucide React | latest | Icon library |
| Frontend Build | Vite | 5.x | Fast development server |
| Backend Framework | Django | 5.x | Python web framework |
| Backend API | Django REST Framework | 3.x | REST API layer |
| Authentication | Django Session Auth | built-in | Cookie-based sessions |
| Database | PostgreSQL | 16.x | Primary database |
| ORM | Django ORM | built-in | Database queries |
| Containerization | Docker + docker-compose | latest | Local development |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────┐
│              BROWSER                        │
│                                             │
│   React App (Vite — port 5173)              │
│   ┌─────────────────────────────────────┐   │
│   │  Public Pages  │  Admin Pages       │   │
│   │  / (routine)   │  /admin/dashboard  │   │
│   │  /schedule/... │  /admin/builder    │   │
│   └────────┬────────────────────────────┘   │
└────────────┼────────────────────────────────┘
             │ HTTP/JSON via Axios
             │ Vite proxy → http://backend:8000
┌────────────▼────────────────────────────────┐
│         Django Backend (port 8000)          │
│                                             │
│   Django REST Framework ViewSets            │
│   Session Authentication Middleware         │
│   Conflict Detector Service                 │
│   PDF Export View                           │
│                                             │
│   Django ORM                                │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│         PostgreSQL Database (port 5432)     │
│         (runs inside Docker container)      │
└─────────────────────────────────────────────┘
```

### How Frontend Talks to Backend
- Vite dev server proxies `/api/*` requests to Django
- All requests include session cookie (`withCredentials: true`)
- CSRF token read from cookie and sent as `X-CSRFToken` header
- Django validates session + CSRF on every mutating request

---

## 6. Project Folder Structure

```
university-routine-manager/
│
├── docker-compose.yml          ← starts all services
├── README.md                   ← quick start guide
│
├── backend/                    ← Django project
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── .env                    ← secrets (not committed)
│   ├── .env.example
│   │
│   ├── config/                 ← project configuration
│   │   ├── settings/
│   │   │   ├── base.py         ← common settings
│   │   │   ├── development.py  ← dev overrides
│   │   │   └── production.py   ← prod overrides
│   │   ├── urls.py             ← root URL routing
│   │   └── wsgi.py
│   │
│   └── apps/
│       ├── accounts/           ← authentication
│       │   ├── views.py        ← login, logout, me endpoints
│       │   └── urls.py
│       │
│       ├── routine/            ← core business logic
│       │   ├── models.py       ← ALL database models
│       │   ├── serializers.py  ← DRF serializers
│       │   ├── admin.py        ← Django admin panel config
│       │   ├── filters.py      ← query param filtering
│       │   ├── views/
│       │   │   ├── public.py       ← public routine endpoints
│       │   │   ├── master_data.py  ← teachers/courses/rooms/batches
│       │   │   ├── semesters.py    ← semester management
│       │   │   └── routine_slots.py ← slot CRUD + conflict check
│       │   ├── services/
│       │   │   └── conflict_detector.py  ← conflict logic
│       │   └── management/
│       │       └── commands/
│       │           ├── load_seed_data.py      ← loads teachers/rooms/timeslots
│       │           └── load_real_routine.py   ← loads actual PUST routine
│       │
│       └── exports/            ← PDF export
│           └── views.py        ← generates print-ready HTML
│
└── frontend/                   ← React application
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js          ← proxy config
    ├── tailwind.config.js
    ├── .env
    │
    └── src/
        ├── main.jsx            ← React entry point
        ├── App.jsx             ← router + route definitions
        │
        ├── api/                ← all API calls (never call axios directly from components)
        │   ├── axiosInstance.js    ← base URL, CSRF interceptor, withCredentials
        │   ├── auth.js             ← login, logout, getCurrentUser
        │   ├── routine.js          ← all routine + master data endpoints
        │   └── masterdata.js
        │
        ├── store/              ← Zustand global state
        │   ├── authStore.js        ← isLoggedIn, user, login(), logout(), initAuth()
        │   ├── routineStore.js     ← activeSemester, filters
        │   └── toastStore.js       ← toast notifications with auto-dismiss
        │
        ├── pages/              ← one file per route
        │   ├── PublicRoutinePage.jsx       ← / (main public page)
        │   ├── BatchSchedulePage.jsx       ← /schedule/batch/:name
        │   ├── TeacherSchedulePage.jsx     ← /schedule/teacher/:code
        │   ├── LoginPage.jsx               ← /login
        │   └── admin/
        │       ├── DashboardPage.jsx        ← /admin/dashboard
        │       ├── RoutineBuilderPage.jsx   ← /admin/routine-builder
        │       ├── ViewRoutinePage.jsx      ← /admin/view-routine
        │       ├── TeachersPage.jsx         ← /admin/teachers
        │       ├── CoursesPage.jsx          ← /admin/courses
        │       ├── RoomsPage.jsx            ← /admin/rooms
        │       ├── BatchesPage.jsx          ← /admin/batches
        │       └── SemestersPage.jsx        ← /admin/semesters
        │
        ├── components/
        │   ├── layout/
        │   │   ├── AdminLayout.jsx      ← sidebar + navbar wrapper for admin pages
        │   │   ├── AdminSidebar.jsx     ← left navigation sidebar
        │   │   ├── Navbar.jsx           ← top navigation bar
        │   │   └── ProtectedRoute.jsx   ← redirects to /login if not authenticated
        │   │
        │   ├── routine/
        │   │   ├── RoutineGrid.jsx      ← THE main timetable table component
        │   │   ├── RoutineCell.jsx      ← single cell — handles 0/1/2 slots display
        │   │   ├── SlotModal.jsx        ← add/edit slot popup with conflict preview
        │   │   └── ConflictBadge.jsx    ← red conflict warning badge
        │   │
        │   ├── filters/
        │   │   └── RoutineFilterPanel.jsx  ← batch/teacher/day dropdowns
        │   │
        │   └── ui/
        │       ├── AddEditModal.jsx     ← reusable CRUD modal for master data
        │       ├── LoadingSpinner.jsx   ← loading indicator
        │       ├── ErrorMessage.jsx     ← red error box with retry button
        │       ├── EmptyState.jsx       ← empty state illustration
        │       └── Toast.jsx            ← auto-dismissing notification
        │
        └── utils/
            ├── constants.js        ← DAYS_OF_WEEK, TIME_SLOTS, BATCH_COLORS
            └── formatters.js       ← formatDay(), formatTime(), getTeacherCodes()
```

---

## 7. Database Design

### Entity Relationship
```
Semester
  └── RoutineSlot (many per semester)
        ├── Batch (FK)
        ├── Course (FK)
        ├── Room (FK)
        ├── TimeSlot (FK)
        └── Teachers (M2M via RoutineSlotTeacher)

Teacher ← master data
Course  ← master data
Room    ← master data
Batch   ← master data
TimeSlot ← master data (fixed 7 slots per day + 1 break)
```

### Tables

#### `routine_teacher`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| full_name | varchar(200) | e.g. "Prof. Dr. Md. Anwar Hossain" |
| short_code | varchar(10) UNIQUE | e.g. "MAH" — shown in grid |
| email | varchar | optional |
| designation | varchar | e.g. "Professor" |
| is_active | bool | soft delete |

#### `routine_course`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| code | varchar(20) UNIQUE | e.g. "ICE-3101" |
| name | varchar(200) | full course name |
| course_type | varchar | 'theory' or 'lab' |
| is_active | bool | soft delete |

#### `routine_room`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| room_number | varchar UNIQUE | e.g. "901" |
| room_type | varchar | 'classroom' or 'lab' |
| capacity | int | optional |

#### `routine_batch`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| name | varchar UNIQUE | e.g. "15B", "MSc" |
| session | varchar | e.g. "2022-2023" |
| effective_date | date | |
| program | varchar | 'BSc' or 'MSc' |

#### `routine_timeslot`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| slot_number | int | display order (0=break, 1-7=slots) |
| start_time | time | e.g. 09:00 |
| end_time | time | e.g. 10:00 |
| is_break | bool | True for 13:00-14:00 lunch break |
| label | varchar | e.g. "9:00–10:00" |

#### `routine_semester`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| name | varchar UNIQUE | e.g. "January 2026 Semester" |
| start_date | date | |
| is_active | bool | only ONE at a time (signal enforces this) |
| is_published | bool | False = draft, True = visible to public |

#### `routine_routineslot` ← CORE TABLE
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| semester_id | FK | |
| batch_id | FK | |
| course_id | FK | |
| room_id | FK | |
| time_slot_id | FK | |
| day_of_week | varchar | 'saturday' to 'wednesday' |
| week_type | varchar | 'all', 'odd', or 'even' |
| slot_duration | int | always 1 (multi-hour = multiple records) |

**Unique constraint:** `(semester, batch, time_slot, day_of_week, week_type)`
This means ODD and EVEN week slots can coexist at the same time for the same batch.

#### `routine_routineslotteacher` ← Junction table
| Column | Type | Notes |
|--------|------|-------|
| routine_slot_id | FK | |
| teacher_id | FK | |
**Unique:** `(routine_slot, teacher)` — supports multi-teacher slots

---

## 8. API Reference

**Base URL:** `/api/v1/`
All responses are JSON. `🔒` = requires admin session.

### Authentication
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/v1/auth/csrf/` | ❌ | Get CSRF token |
| POST | `/api/v1/auth/login/` | ❌ | Login with email+password |
| POST | `/api/v1/auth/logout/` | 🔒 | Logout |
| GET | `/api/v1/auth/me/` | 🔒 | Get current user |

### Public Routine
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/v1/routine/active/` | ❌ | Full active routine (supports ?batch=15B&teacher=MAH&day=monday) |
| GET | `/api/v1/routine/batch/<name>/` | ❌ | One batch's schedule |
| GET | `/api/v1/routine/teacher/<code>/` | ❌ | One teacher's schedule |

### Master Data (GET=public, mutate=🔒)
| Method | URL | Description |
|--------|-----|-------------|
| GET/POST | `/api/v1/teachers/` | List/Create |
| GET/PUT/DELETE | `/api/v1/teachers/<id>/` | Detail/Update/Delete |
| (same pattern) | `/api/v1/courses/` | |
| (same pattern) | `/api/v1/rooms/` | |
| (same pattern) | `/api/v1/batches/` | |
| (same pattern) | `/api/v1/timeslots/` | |

### Semesters 🔒
| Method | URL | Description |
|--------|-----|-------------|
| GET/POST | `/api/v1/semesters/` | List/Create |
| GET/PUT/DELETE | `/api/v1/semesters/<id>/` | Detail |
| POST | `/api/v1/semesters/<id>/activate/` | Set as active |
| POST | `/api/v1/semesters/<id>/publish/` | Make public |
| POST | `/api/v1/semesters/<id>/unpublish/` | Hide from public |
| POST | `/api/v1/semesters/<id>/clone/` | Copy to new semester |

### Routine Slots 🔒
| Method | URL | Description |
|--------|-----|-------------|
| GET/POST | `/api/v1/semesters/<sem_id>/slots/` | List/Create slots |
| GET/PUT/DELETE | `/api/v1/semesters/<sem_id>/slots/<id>/` | Slot detail |
| POST | `/api/v1/semesters/<sem_id>/slots/check-conflicts/` | Check without saving |

### Export
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/export/routine/pdf/` | Print-ready HTML routine |

---

## 9. Frontend Pages

### Public Pages

#### `/` — PublicRoutinePage
The main page. Shows the full weekly timetable grid.
- Fetches active+published semester via `getActiveRoutine()`
- Filter panel: Batch, Teacher, Day dropdowns
- Filters applied client-side from `allSlots` (original unfiltered copy)
- RoutineGrid with `isEditable=false`
- Teacher Legend below grid
- Download PDF button

#### `/schedule/batch/:batchName` — BatchSchedulePage
Shows only one batch's slots. URL parameter used to fetch data.

#### `/schedule/teacher/:code` — TeacherSchedulePage
Shows only one teacher's slots. URL parameter used to fetch data.

#### `/login` — LoginPage
Email + password form with real-time validation.
Redirects to `/admin/dashboard` on success.

### Admin Pages (all protected by ProtectedRoute)

#### `/admin/dashboard` — DashboardPage
Stats cards + active semester info + quick action buttons.

#### `/admin/routine-builder` — RoutineBuilderPage
The most complex page. Shows the same grid but editable.
- Semester selector dropdown
- Publish/Unpublish toggle
- Check All Conflicts button
- Clicking any cell opens SlotModal
- Handles ODD+EVEN split cells

#### `/admin/view-routine` — ViewRoutinePage
Read-only routine view inside the admin layout with sidebar.
Same data as public page but accessible from admin sidebar.

#### `/admin/teachers` — TeachersPage
Table of all teachers with Search, Add, Edit, Delete.

#### `/admin/courses` — CoursesPage
Table of all courses with Search, Add, Edit, Delete.

#### `/admin/rooms` — RoomsPage
Table of all rooms with Add, Edit, Delete.

#### `/admin/batches` — BatchesPage
Table of all batches with Add, Edit, Delete.

#### `/admin/semesters` — SemestersPage
List of semesters with status badges and action buttons:
Set Active, Publish, Unpublish, Clone, Edit, Delete (with warnings).

---

## 10. Authentication System

### How Login Works
```
1. Admin visits /login
2. App calls GET /api/v1/auth/csrf/ → sets csrftoken cookie
3. Admin enters email + password → clicks Sign In
4. Frontend validates: email format, password min 6 chars
5. POST /api/v1/auth/login/ with { email, password }
6. Backend: looks up user by email → authenticates → creates session
7. Browser stores sessionid cookie automatically
8. React stores user info in authStore (Zustand)
9. Redirect to /admin/dashboard
```

### Session Persistence
On every page load, `App.jsx` calls `authStore.initAuth()` which:
1. Fetches CSRF token first
2. Calls `GET /api/v1/auth/me/` with session cookie
3. If valid → restores login state
4. If invalid → sets isLoggedIn=false

### Protected Routes
`ProtectedRoute` component wraps all `/admin/*` routes.
If `isLoading=true` → shows spinner.
If `isLoggedIn=false` → redirects to `/login`.

### CSRF Protection
- Django requires CSRF token for all POST/PUT/PATCH/DELETE
- `axiosInstance.js` reads `csrftoken` from browser cookies
- Adds `X-CSRFToken` header to every mutating request
- `CSRF_COOKIE_HTTPONLY = False` in Django settings (required for JS to read it)

---

## 11. Conflict Detection System

### What Gets Detected
When saving a slot, the system checks for:
1. **Teacher conflict** — same teacher already has a class at this day+time
2. **Room conflict** — same room already booked at this day+time
3. **Batch conflict** — same batch already has a class at this day+time

### ODD/EVEN Week Rule
```
ODD slot does NOT conflict with EVEN slot (they run on different weeks)
ALL slot DOES conflict with both ODD and EVEN slots
```

Implemented in `conflict_detector.py`:
```python
query = Q(week_type__in=['all', week_type])
# If adding ODD slot, checks against 'all' and 'odd' existing slots
# If adding EVEN slot, checks against 'all' and 'even' existing slots
# ODD and EVEN never conflict with each other
```

### Conflict Flow
1. Admin opens SlotModal and selects course/room/teacher
2. `useEffect` fires automatically → calls `checkConflicts()` API
3. Result shown inside modal:
   - Green: "✓ No conflicts detected"
   - Red: lists each conflict with description
4. If conflicts exist → Save button is **disabled** ("Resolve Conflicts First")
5. Admin must change room/teacher/time to resolve before saving

### When Editing
`exclude_slot_id` is passed to the conflict check so the slot
doesn't conflict with itself.

---

## 12. How to Run the Project

### Prerequisites
- Docker Desktop (running)
- Node.js 20 LTS
- Git

### First Time Setup
```bash
# 1. Clone the project
git clone <repo-url>
cd university-routine-manager

# 2. Set up environment files
cp backend/.env.example backend/.env

# 3. Start PostgreSQL + Django via Docker
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend python manage.py migrate

# 5. Load seed data (teachers, rooms, timeslots, batches)
docker-compose exec backend python manage.py load_seed_data

# 6. Load the real PUST ICE routine
docker-compose exec backend python manage.py load_real_routine

# 7. Create admin account
docker-compose exec backend python manage.py createsuperuser
# Set email when prompted (e.g. admin@ice.pust.ac.bd)

# 8. Set email for admin user (if not set during createsuperuser)
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.get(is_staff=True)
u.email = 'admin@ice.pust.ac.bd'
u.save()
"

# 9. Install frontend dependencies and start
cd frontend
npm install
npm run dev
```

### Access Points
| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public routine page |
| http://localhost:5173/login | Admin login |
| http://localhost:5173/admin/dashboard | Admin dashboard |
| http://localhost:8000/api/v1/ | Django REST API |
| http://localhost:8000/admin/ | Django admin panel |

### Daily Development
```bash
# Start backend + database
docker-compose up -d

# Start frontend (in a separate terminal)
cd frontend && npm run dev

# Stop everything
docker-compose down
```

### Useful Commands
```bash
# View backend logs
docker-compose logs backend

# Run Django management commands
docker-compose exec backend python manage.py <command>

# Open Django shell
docker-compose exec backend python manage.py shell

# Rebuild Docker images after dependency changes
docker-compose build --no-cache
```

---

## 13. Key Workflows

### Workflow 1: Creating a New Semester Routine

```
1. Admin logs in → goes to Semesters page
2. Clicks "Add Semester" → enters name, start date
3. Clicks "Set Active" on the new semester
4. Clicks "Open Builder" → goes to Routine Builder
5. Clicks each empty cell in the grid
6. In SlotModal: selects Course, Room, Teacher(s), Week Type, Duration
7. Conflict preview automatically checks for clashes
8. Clicks "Save Slot" if no conflicts
9. Repeats for all slots
10. When done → clicks "Publish"
11. Routine is now visible on the public / page
```

### Workflow 2: Next Semester (Clone)

```
1. Admin goes to Semesters page
2. Clicks "Clone" on the current semester
3. Enters new semester name (e.g. "July 2026 Semester")
4. New semester created with ALL existing slots copied
5. Admin opens the cloned semester in Routine Builder
6. Makes changes (add/remove/edit slots as needed)
7. Clicks "Set Active" → "Publish"
8. Old semester automatically deactivated
```

### Workflow 3: Adding a 2-Hour Lab Slot

```
1. Click a cell (e.g. Monday 9:00 for batch 14B)
2. In SlotModal: select course, room, teachers
3. Set Duration → "2 hours (consecutive)"
4. Click Save
5. System automatically creates TWO RoutineSlot records:
   - Monday 9:00-10:00 for 14B, same course/room/teacher
   - Monday 10:00-11:00 for 14B, same course/room/teacher
6. Both cells fill up in the grid simultaneously
```

### Workflow 4: ODD/EVEN Week Slots

```
Scenario: Room 921 used for ICE-3102 on odd weeks and CSE-3102 on even weeks
at the same time slot for batch 15B.

1. Click Saturday 2:00-3:00 for 15B
2. Select ICE-3102, Room 921, Teacher TD
3. Set Week Type → "Odd Weeks Only"
4. Save → slot appears with "ODD" badge

5. The cell now shows the ODD slot + a "+ EVEN" hint button
6. Click "+ EVEN"
7. Modal pre-fills: same room (921), same teacher (TD)
   Week Type already set to "Even Weeks Only"
8. Change course to CSE-3102
9. Save → cell now shows both slots stacked vertically
```

---

## 14. Real Routine Data

The system is pre-loaded with the actual PUST ICE Department routine
(January 2026 semester, effective 3 January 2026).

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

### Batches
| Batch | Session | Program |
|-------|---------|---------|
| MSc | 2024-2025 | MSc |
| 13B | 2020-2021 | BSc |
| 14B | 2021-2022 | BSc |
| 15B | 2022-2023 | BSc |
| 16B | 2023-2024 | BSc |
| 17B | 2024-2025 | BSc |

### Rooms
901, 902, 903, 904, 919, 920, 921

### Time Slots
| Slot | Time | Type |
|------|------|------|
| 1 | 9:00 – 10:00 AM | Class |
| 2 | 10:00 – 11:00 AM | Class |
| 3 | 11:00 – 12:00 PM | Class |
| 4 | 12:00 – 1:00 PM | Class |
| — | 1:00 – 2:00 PM | Prayer & Lunch Break |
| 5 | 2:00 – 3:00 PM | Class |
| 6 | 3:00 – 4:00 PM | Class |
| 7 | 4:00 – 5:00 PM | Class |

### Days
Saturday, Sunday, Monday, Tuesday, Wednesday

---

## 15. Known Limitations

| Limitation | Notes |
|-----------|-------|
| Single department only | Only ICE dept — no multi-department support |
| No self-registration | Admin accounts created via Django shell only |
| No mobile app | Web only (responsive design works on mobile) |
| No notifications | No email/SMS when routine changes |
| No exam schedule | Only class routine, no exam timetable |
| No attendance tracking | Out of scope |
| No drag-and-drop builder | Planned for v2 |
| PDF uses browser print | Not a true PDF generation library |
| Performance tests not done | No load testing performed |

---

## Appendix: Environment Variables

### Backend (`backend/.env`)
```
SECRET_KEY=your-django-secret-key-here
DEBUG=True
DATABASE_URL=postgres://routine_user:routine_pass@db:5432/routine_db
ALLOWED_HOSTS=localhost,127.0.0.1,*
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=
# Leave empty to use Vite proxy (recommended for development)
```

---

*Document prepared for project presentation.*
*Department of ICE, Pabna University of Science and Technology.*
