# Architecture Document
# University Routine Management System

---

## 1. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 18.x | UI framework |
| Frontend Styling | Tailwind CSS | 3.x | Utility-first styling |
| Frontend State | Zustand | 4.x | Lightweight global state |
| Frontend Routing | React Router | 6.x | Client-side routing |
| HTTP Client | Axios | 1.x | API requests from React |
| Backend | Django | 5.x | Web framework |
| Backend API | Django REST Framework (DRF) | 3.x | REST API layer |
| Authentication | Django Session Auth + DRF SessionAuthentication | — | Admin login |
| Database | PostgreSQL | 16.x | Primary database |
| ORM | Django ORM | built-in | Database queries |
| PDF Export | WeasyPrint | — | Generate PDF routine |
| Dev Environment | Docker + docker-compose | — | Local development |
| Frontend Dev Server | Vite | 5.x | Fast React dev server |

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              React App (Vite)                       │  │
│   │   - Public Routine View                             │  │
│   │   - Admin Dashboard                                 │  │
│   │   - Routine Builder                                 │  │
│   └────────────────────┬────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP (JSON)
                         │ /api/v1/...
┌────────────────────────▼────────────────────────────────────┐
│                   Django Backend                             │
│                                                             │
│   ┌─────────────────┐   ┌──────────────────────────────┐   │
│   │  DRF API Views  │   │   Django Auth Middleware      │   │
│   │  (ViewSets)     │   │   (Session-based)             │   │
│   └────────┬────────┘   └──────────────────────────────┘   │
│            │                                                 │
│   ┌────────▼────────┐   ┌──────────────────────────────┐   │
│   │  Business Logic │   │   Conflict Detection Service  │   │
│   │  (Services)     │   │   (pure Python functions)     │   │
│   └────────┬────────┘   └──────────────────────────────┘   │
│            │                                                 │
│   ┌────────▼────────┐                                       │
│   │   Django ORM    │                                       │
│   └────────┬────────┘                                       │
└────────────┼────────────────────────────────────────────────┘
             │
┌────────────▼───────────┐
│      PostgreSQL         │
│      Database           │
└────────────────────────┘
```

---

## 3. Folder Structure

### Backend (Django)
```
backend/
├── manage.py
├── requirements.txt
├── .env                         ← secrets (never commit)
├── config/                      ← project settings
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py              ← common settings
│   │   ├── development.py       ← dev overrides
│   │   └── production.py        ← prod overrides
│   ├── urls.py                  ← root URL config
│   └── wsgi.py
│
└── apps/
    ├── accounts/                ← admin user auth
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    │
    ├── routine/                 ← core app
    │   ├── models.py            ← ALL database models live here
    │   ├── serializers.py       ← DRF serializers
    │   ├── views.py             ← API ViewSets
    │   ├── urls.py              ← /api/v1/routine/...
    │   ├── services/
    │   │   └── conflict_detector.py  ← conflict logic
    │   ├── filters.py           ← django-filter classes
    │   └── admin.py             ← Django admin panel config
    │
    └── exports/                 ← PDF/print generation
        ├── views.py
        └── pdf_generator.py
```

### Frontend (React)
```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env                         ← VITE_API_BASE_URL etc.
│
└── src/
    ├── main.jsx                 ← entry point
    ├── App.jsx                  ← router setup
    │
    ├── api/                     ← all Axios API calls
    │   ├── axiosInstance.js     ← base URL + interceptors
    │   ├── routine.js           ← routine endpoints
    │   ├── auth.js              ← login/logout endpoints
    │   └── masterdata.js        ← teachers, rooms, etc.
    │
    ├── store/                   ← Zustand global state
    │   ├── authStore.js         ← isLoggedIn, user info
    │   └── routineStore.js      ← active semester, filters
    │
    ├── pages/                   ← one file per route/page
    │   ├── PublicRoutinePage.jsx
    │   ├── BatchSchedulePage.jsx
    │   ├── TeacherSchedulePage.jsx
    │   ├── LoginPage.jsx
    │   ├── admin/
    │   │   ├── DashboardPage.jsx
    │   │   ├── RoutineBuilderPage.jsx
    │   │   ├── TeachersPage.jsx
    │   │   ├── CoursesPage.jsx
    │   │   ├── RoomsPage.jsx
    │   │   ├── BatchesPage.jsx
    │   │   └── SemestersPage.jsx
    │
    ├── components/              ← reusable UI components
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── AdminSidebar.jsx
    │   ├── routine/
    │   │   ├── RoutineGrid.jsx       ← the main timetable grid
    │   │   ├── RoutineCell.jsx       ← single cell in grid
    │   │   ├── SlotModal.jsx         ← assign slot popup
    │   │   └── ConflictBadge.jsx     ← red conflict warning
    │   ├── filters/
    │   │   └── RoutineFilterPanel.jsx
    │   └── ui/                  ← generic: Button, Modal, Table, Badge
    │
    └── utils/
        ├── constants.js         ← DAYS, TIME_SLOTS, WEEK_TYPES
        └── formatters.js        ← date/time display helpers
```

---

## 4. API Design Pattern

- All API routes prefixed with `/api/v1/`
- Public endpoints: no auth required (GET only)
- Admin endpoints: require session cookie (all methods)
- Responses always in JSON
- Errors follow format:
```json
{
  "error": true,
  "message": "Teacher MAH is already assigned at this time slot",
  "conflict_type": "teacher",
  "details": { ... }
}
```

---

## 5. Authentication Pattern

- Django session-based authentication
- Login: POST `/api/v1/auth/login/` → sets session cookie
- Logout: POST `/api/v1/auth/logout/` → clears session
- React checks `/api/v1/auth/me/` on app load to restore login state
- Protected React routes redirect to `/login` if not authenticated
- CSRF token sent with every mutating request (Django enforces this)

---

## 6. Conflict Detection Logic

Located in `backend/apps/routine/services/conflict_detector.py`

```
When admin tries to save a RoutineSlot, check:

1. TEACHER CONFLICT:
   Same teacher_id + same day + same time_slot + same semester
   → "Prof. MAH already has ICE-3101 at this time"

2. ROOM CONFLICT:
   Same room_id + same day + same time_slot + same semester
   → "Room 902 is already booked for CSE-3101 at this time"

3. BATCH CONFLICT:
   Same batch_id + same day + same time_slot + same semester
   → "Batch 15B already has a class at this time"

For ODD/EVEN week slots:
   Only conflict if both are "ALL weeks" or both are the same week type
   An ODD-week slot does NOT conflict with an EVEN-week slot
```

---

## 7. Environment Variables

### Backend `.env`
```
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/routine_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 8. Development Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd university-routine-manager

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver      # runs on http://localhost:8000

# 3. Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env            # fill in VITE_API_BASE_URL
npm run dev                     # runs on http://localhost:5173
```
