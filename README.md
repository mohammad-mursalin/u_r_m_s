# University Routine Management System
ICE Department — Pabna University of Science and Technology

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Django 5 + Django REST Framework
- Database: PostgreSQL 16
- Auth: Django session-based authentication

## Prerequisites
- Docker Desktop (running)
- Node.js 20 LTS
- Git

## Quick Start

### 1. Clone and setup
git clone <repo-url>
cd university-routine-manager

### 2. Backend environment
cp backend/.env.example backend/.env
(Edit backend/.env if needed — defaults work for local dev)

### 3. Start everything with Docker
docker-compose up -d

### 4. Run migrations (first time only)
docker-compose exec backend python manage.py migrate

### 5. Load seed data (first time only)
docker-compose exec backend python manage.py load_seed_data

### 6. Create admin account (first time only)
docker-compose exec backend python manage.py createsuperuser

### 7. Install frontend dependencies and start
cd frontend
npm install
npm run dev

## Access
- Public routine: http://localhost:5173
- Admin panel: http://localhost:5173/admin/dashboard
- Django API: http://localhost:8000/api/v1/
- Django admin: http://localhost:8000/admin/

## Project Structure

```
university-routine-manager/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── apps/
│       ├── accounts/
│       ├── routine/
│       └── exports/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env
│   └── src/
│       ├── api/
│       │   ├── axiosInstance.js
│       │   ├── auth.js
│       │   ├── routine.js
│       │   └── masterdata.js
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── AdminLayout.jsx
│       │   │   └── AdminSidebar.jsx
│       │   ├── routine/
│       │   │   ├── RoutineGrid.jsx
│       │   │   ├── RoutineCell.jsx
│       │   │   └── SlotModal.jsx
│       │   ├── filters/
│       │   │   └── RoutineFilterPanel.jsx
│       │   └── ui/
│       │       ├── Button.jsx
│       │       ├── LoadingSpinner.jsx
│       │       ├── ErrorMessage.jsx
│       │       ├── EmptyState.jsx
│       │       └── Toast.jsx
│       ├── pages/
│       │   ├── PublicRoutinePage.jsx
│       │   ├── BatchSchedulePage.jsx
│       │   ├── TeacherSchedulePage.jsx
│       │   ├── LoginPage.jsx
│       │   └── admin/
│       │       ├── DashboardPage.jsx
│       │       ├── TeachersPage.jsx
│       │       ├── CoursesPage.jsx
│       │       ├── RoomsPage.jsx
│       │       ├── BatchesPage.jsx
│       │       ├── SemestersPage.jsx
│       │       └── RoutineBuilderPage.jsx
│       ├── store/
│       │   ├── authStore.js
│       │   └── toastStore.js
│       └── utils/
│           ├── constants.js
│           └── formatters.js
│
├── docker-compose.yml
└── README.md
```

## Seed Data Included
- 7 teachers (MAH, MOF, MSH, MIH, TNT, TD, AM)
- 7 rooms (901, 902, 903, 904, 919, 920, 921)
- 8 time slots (9:00 AM to 5:00 PM with lunch break)
- 6 batches (MSc, 13B, 14B, 15B, 16B, 17B)

## Features

### Public Users
- View the full department routine as a grid
- Filter routine by batch, teacher, and day
- Download routine as PDF

### Admin Panel
- View dashboard with statistics
- Manage teachers, courses, rooms, and batches
- Create and manage semesters
- Build routine using interactive grid
- Publish/unpublish routine
- Detect and review conflicts

## API Endpoints
All endpoints are prefixed with `/api/v1/`:
- Authentication: `/api/v1/auth/login/`, `/api/v1/auth/logout/`, `/api/v1/auth/me/`
- Routine: `/api/v1/routine/active/`, `/api/v1/routine/batch/{name}/`, `/api/v1/routine/teacher/{code}/`
- Teachers: `/api/v1/teachers/`, `/api/v1/teachers/{id}/`
- Courses: `/api/v1/courses/`, `/api/v1/courses/{id}/`
- Rooms: `/api/v1/rooms/`, `/api/v1/rooms/{id}/`
- Batches: `/api/v1/batches/`, `/api/v1/batches/{id}/`
- Semesters: `/api/v1/semesters/`, `/api/v1/semesters/{id}/publish/`, `/api/v1/semesters/{id}/unpublish/`
- Slots: `/api/v1/semesters/{id}/slots/`, `/api/v1/semesters/{id}/slots/check-conflicts/`

## Development

### Frontend
```bash
cd frontend
npm run dev
```

### Backend
```bash
cd backend
python manage.py runserver
```

## Conflict Detection
The system automatically detects conflicts when saving a routine slot:
- Same teacher assigned to two classes at the same time
- Same room assigned to two classes at the same time
- Same batch assigned to two classes at the same time

Conflicts are warnings, not hard blocks. The slot is saved, and the conflict is flagged for review.

## License
MIT License
