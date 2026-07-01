# API Routes
# University Routine Management System

**Base URL:** `/api/v1/`  
**Format:** All requests and responses are JSON  
**Auth:** Endpoints marked 🔒 require admin session cookie

---

## 1. Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login/` | ❌ | Login |
| POST | `/api/v1/auth/logout/` | 🔒 | Logout |
| GET | `/api/v1/auth/me/` | 🔒 | Get current user |

### POST `/api/v1/auth/login/`
Request:
```json
{ "username": "admin@ice.pust.ac.bd", "password": "mypassword" }
```
Response 200:
```json
{ "user": { "id": 1, "username": "admin@ice.pust.ac.bd", "is_staff": true } }
```
Response 401:
```json
{ "error": true, "message": "Invalid credentials" }
```

---

## 2. Routine (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/routine/active/` | ❌ | Get full active semester routine |
| GET | `/api/v1/routine/batch/<batch_name>/` | ❌ | Get routine for one batch |
| GET | `/api/v1/routine/teacher/<short_code>/` | ❌ | Get routine for one teacher |

### GET `/api/v1/routine/active/`
Returns the published active semester's complete slot data.

Query params (optional):
- `?day=monday` — filter by day
- `?batch=15B` — filter by batch name
- `?teacher=MAH` — filter by teacher code

Response 200:
```json
{
  "semester": {
    "id": 1,
    "name": "January 2026 Semester",
    "start_date": "2026-01-03"
  },
  "slots": [
    {
      "id": 12,
      "day": "saturday",
      "week_type": "all",
      "time_slot": {
        "id": 1,
        "start_time": "09:00",
        "end_time": "10:00",
        "slot_number": 1
      },
      "batch": { "id": 3, "name": "14B", "session": "2021-2022" },
      "course": { "id": 5, "code": "ICE-4203", "name": "...", "course_type": "theory" },
      "room": { "id": 2, "room_number": "904" },
      "teachers": [
        { "id": 1, "short_code": "MAH", "full_name": "Prof. Dr. Md. Anwar Hossain" }
      ],
      "slot_duration": 1
    }
  ]
}
```

---

## 3. Master Data (Admin CRUD)

All master data endpoints follow REST conventions.  
All require 🔒 admin auth except GET (GET is public for dropdown population).

### Teachers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/teachers/` | ❌ | List all active teachers |
| POST | `/api/v1/teachers/` | 🔒 | Create teacher |
| GET | `/api/v1/teachers/<id>/` | ❌ | Get one teacher |
| PUT | `/api/v1/teachers/<id>/` | 🔒 | Update teacher |
| DELETE | `/api/v1/teachers/<id>/` | 🔒 | Soft delete (sets is_active=False) |

POST/PUT request body:
```json
{
  "full_name": "Prof. Dr. Md. Anwar Hossain",
  "short_code": "MAH",
  "email": "mah@pust.ac.bd",
  "designation": "Professor"
}
```

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/courses/` | ❌ | List all courses |
| POST | `/api/v1/courses/` | 🔒 | Create course |
| GET | `/api/v1/courses/<id>/` | ❌ | Get one course |
| PUT | `/api/v1/courses/<id>/` | 🔒 | Update course |
| DELETE | `/api/v1/courses/<id>/` | 🔒 | Soft delete |

POST/PUT request body:
```json
{
  "code": "ICE-3101",
  "name": "Digital Signal Processing",
  "credit_hours": 3.0,
  "course_type": "theory"
}
```

### Rooms
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/rooms/` | ❌ | List all rooms |
| POST | `/api/v1/rooms/` | 🔒 | Create room |
| GET | `/api/v1/rooms/<id>/` | ❌ | Get one room |
| PUT | `/api/v1/rooms/<id>/` | 🔒 | Update room |
| DELETE | `/api/v1/rooms/<id>/` | 🔒 | Soft delete |

### Batches
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/batches/` | ❌ | List all batches |
| POST | `/api/v1/batches/` | 🔒 | Create batch |
| GET | `/api/v1/batches/<id>/` | ❌ | Get one batch |
| PUT | `/api/v1/batches/<id>/` | 🔒 | Update batch |
| DELETE | `/api/v1/batches/<id>/` | 🔒 | Soft delete |

### Time Slots
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/timeslots/` | ❌ | List all time slots |
| POST | `/api/v1/timeslots/` | 🔒 | Create time slot |
| PUT | `/api/v1/timeslots/<id>/` | 🔒 | Update time slot |
| DELETE | `/api/v1/timeslots/<id>/` | 🔒 | Delete time slot |

---

## 4. Semesters (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/semesters/` | ❌ | List all semesters |
| POST | `/api/v1/semesters/` | 🔒 | Create new semester |
| GET | `/api/v1/semesters/<id>/` | ❌ | Get one semester |
| PUT | `/api/v1/semesters/<id>/` | 🔒 | Update semester |
| POST | `/api/v1/semesters/<id>/activate/` | 🔒 | Set as active semester |
| POST | `/api/v1/semesters/<id>/publish/` | 🔒 | Publish (make public) |
| POST | `/api/v1/semesters/<id>/unpublish/` | 🔒 | Unpublish (hide from public) |
| POST | `/api/v1/semesters/<id>/clone/` | 🔒 | Clone this semester's slots into a new semester |

### POST `/api/v1/semesters/<id>/clone/`
Request:
```json
{ "new_semester_name": "July 2026 Semester" }
```
Response 201:
```json
{ "new_semester_id": 2, "slots_cloned": 87, "message": "Semester cloned successfully" }
```

---

## 5. Routine Slots (Admin CRUD)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/semesters/<sem_id>/slots/` | 🔒 | Get all slots for a semester |
| POST | `/api/v1/semesters/<sem_id>/slots/` | 🔒 | Create a slot (triggers conflict check) |
| GET | `/api/v1/semesters/<sem_id>/slots/<id>/` | 🔒 | Get one slot |
| PUT | `/api/v1/semesters/<sem_id>/slots/<id>/` | 🔒 | Update slot (triggers conflict check) |
| DELETE | `/api/v1/semesters/<sem_id>/slots/<id>/` | 🔒 | Delete a slot |

### POST `/api/v1/semesters/<sem_id>/slots/`
Request:
```json
{
  "batch_id": 3,
  "course_id": 5,
  "room_id": 2,
  "time_slot_id": 1,
  "day_of_week": "saturday",
  "week_type": "all",
  "slot_duration": 1,
  "teacher_ids": [1]
}
```

Response 201 (no conflict):
```json
{
  "id": 99,
  "batch": "14B",
  "course": "ICE-4203",
  "day_of_week": "saturday",
  "conflicts": []
}
```

Response 200 (conflict detected — slot saved but conflict flagged):
```json
{
  "id": 99,
  "conflicts": [
    {
      "conflict_type": "teacher",
      "message": "MAH already has ICE-3101 at Saturday 9:00–10:00",
      "conflicting_slot_id": 45
    }
  ]
}
```

> **Note:** Conflicts are warnings, not hard blocks. The slot is saved. Admin sees the warning and decides what to do.

---

## 6. Conflict Check (Standalone)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/semesters/<sem_id>/slots/check-conflicts/` | 🔒 | Check conflicts without saving |

Use this before saving to preview conflicts.

---

## 7. Export

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/export/routine/pdf/` | ❌ | Download full routine as PDF |
| GET | `/api/v1/export/routine/pdf/?batch=15B` | ❌ | Download batch-specific PDF |
| GET | `/api/v1/export/routine/pdf/?teacher=MAH` | ❌ | Download teacher-specific PDF |

---

## 8. Standard Error Responses

```json
// 400 Bad Request (validation error)
{
  "error": true,
  "message": "Validation failed",
  "fields": {
    "short_code": ["This field is required."],
    "day_of_week": ["Value must be one of: saturday, sunday, monday, tuesday, wednesday"]
  }
}

// 401 Unauthorized
{ "error": true, "message": "Authentication required" }

// 403 Forbidden
{ "error": true, "message": "You do not have permission to perform this action" }

// 404 Not Found
{ "error": true, "message": "Teacher with id 99 not found" }

// 500 Server Error
{ "error": true, "message": "Internal server error" }
```
