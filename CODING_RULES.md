# Coding Rules for AI Coding Agent
# University Routine Management System

> **AGENT INSTRUCTION:** Read this file completely before writing any code.  
> These rules are non-negotiable. Follow every rule on every file you create or edit.

---

## 0. The Golden Rule

**Never assume. Never invent. Never skip.**

- If a requirement is not in the docs, do NOT add it silently.
- If something is ambiguous, leave a `# TODO: clarify with developer` comment and continue.
- Do not add features that were not asked for.
- Do not install packages not listed in this document.

---

## 1. General Rules

- Always write in **English** — all code, comments, variable names
- Use **clear, descriptive names** — no single letters except loop counters (`i`, `j`)
- Every file must start with a comment explaining what it does
- No hardcoded values — use constants files or environment variables
- No `console.log` or `print()` left in final code — use proper logging
- All dates stored as ISO 8601 format: `YYYY-MM-DD`
- All times stored as 24-hour format: `HH:MM`

---

## 2. Backend Rules (Django)

### 2.1 Project Structure
- Follow the folder structure defined in `ARCHITECTURE.md` exactly
- All apps go inside `backend/apps/` folder
- Settings split into `base.py`, `development.py`, `production.py`
- Never put business logic in views — put it in `services/` files

### 2.2 Models
- Every model must have `created_at` and `updated_at` fields with `auto_now_add` and `auto_now`
- Every model must have a `__str__` method that returns a human-readable string
- Use `is_active` boolean field for soft deletes (never hard delete master data)
- Foreign keys must always specify `on_delete` behavior explicitly
- Add `verbose_name` and `verbose_name_plural` to every model's Meta class

```python
# CORRECT model example:
class Teacher(models.Model):
    full_name = models.CharField(max_length=200)
    short_code = models.CharField(max_length=10, unique=True)
    
    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['full_name']
    
    def __str__(self):
        return f"{self.short_code} — {self.full_name}"
```

### 2.3 API Views
- Use DRF `ViewSet` and `Router` for all CRUD endpoints
- Use `ModelSerializer` for all serializers
- Public endpoints: use `AllowAny` permission
- Admin endpoints: use `IsAdminUser` permission
- Always validate input in serializers, never in views
- Return proper HTTP status codes (200, 201, 400, 401, 403, 404)

### 2.4 Naming Conventions
- Models: `PascalCase` (e.g. `RoutineSlot`)
- Variables/functions: `snake_case` (e.g. `get_active_semester`)
- Constants: `UPPER_SNAKE_CASE` (e.g. `DAYS_OF_WEEK`)
- URLs: `kebab-case` (e.g. `/api/v1/routine-slots/`)
- App names: lowercase (e.g. `routine`, `accounts`)

### 2.5 Allowed Python Packages (requirements.txt)
```
django==5.0.*
djangorestframework==3.15.*
django-cors-headers==4.3.*
psycopg2-binary==2.9.*
python-dotenv==1.0.*
django-filter==24.*
weasyprint==62.*
pillow==10.*
```
Do NOT install any package not on this list without explicit instruction.

### 2.6 Environment Variables
- All secrets from `.env` file via `python-dotenv`
- Never hardcode: SECRET_KEY, database URL, passwords
- Access env vars with `os.environ.get('KEY', 'default')`

### 2.7 Conflict Detection
- Conflict detection logic lives ONLY in `backend/apps/routine/services/conflict_detector.py`
- Views call the service, never implement conflict logic themselves
- Conflicts are WARNINGS not hard blocks — always save the slot, return conflicts in response
- See `DATABASE_SCHEMA.md` section 6 for conflict rules

---

## 3. Frontend Rules (React)

### 3.1 Project Structure
- Follow the folder structure in `ARCHITECTURE.md` exactly
- One component per file — no multiple exports from one file
- Pages go in `src/pages/`, reusable UI in `src/components/`
- All API calls go in `src/api/` — never call axios directly from a component

### 3.2 Component Rules
- Use **functional components only** — no class components
- Use React hooks (`useState`, `useEffect`, `useCallback`)
- Every component must have a JSDoc comment at the top explaining its purpose
- Props must be documented in the JSDoc comment
- No inline styles — use Tailwind CSS classes only
- No magic numbers in JSX — define them as constants

```jsx
// CORRECT component example:
/**
 * RoutineCell — renders one cell in the timetable grid
 * @param {Object} slot - the slot data (or null if empty)
 * @param {boolean} isEditable - if true, clicking opens edit modal
 * @param {Function} onClick - handler called when cell is clicked
 */
function RoutineCell({ slot, isEditable, onClick }) {
  // component code
}
```

### 3.3 State Management
- Local UI state: `useState`
- Global app state (auth, active semester): `Zustand` store
- Server data: fetched via Axios, stored in local state per page
- Do NOT use Redux — it's not in this project's stack

### 3.4 API Calls
- Always use the `axiosInstance` from `src/api/axiosInstance.js`
- All API functions live in `src/api/` folder files
- Always handle loading state, success state, and error state
- Show a loading spinner during API calls
- Show a user-friendly error message if API call fails (not a raw error object)

```jsx
// CORRECT pattern for API calls:
const [slots, setSlots] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchSlots = async () => {
    setIsLoading(true)
    try {
      const data = await getActiveRoutine()
      setSlots(data.slots)
    } catch (err) {
      setError('Failed to load routine. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }
  fetchSlots()
}, [])
```

### 3.5 Naming Conventions
- Components: `PascalCase` (e.g. `RoutineGrid`)
- Variables/functions: `camelCase` (e.g. `fetchRoutine`, `isLoading`)
- Constants: `UPPER_SNAKE_CASE` (e.g. `DAYS_OF_WEEK`)
- Files: `PascalCase` for components, `camelCase` for utilities

### 3.6 Allowed npm Packages
```
react: 18.x
react-dom: 18.x
react-router-dom: 6.x
axios: 1.x
zustand: 4.x
tailwindcss: 3.x
@headlessui/react: 1.x    ← for accessible modals and dropdowns
lucide-react: latest       ← for icons
```
Do NOT install any package not on this list without explicit instruction.

### 3.7 Routing
- All routes defined in `src/App.jsx`
- Admin routes wrapped in `<ProtectedRoute>` component
- 404 catch-all route at the bottom redirects to `/`

### 3.8 Constants File
All fixed values defined in `src/utils/constants.js`:
```javascript
export const DAYS_OF_WEEK = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday']

export const TIME_SLOTS = [
  { id: 1, label: '9:00–10:00', start: '09:00', end: '10:00' },
  { id: 2, label: '10:00–11:00', start: '10:00', end: '11:00' },
  { id: 3, label: '11:00–12:00', start: '11:00', end: '12:00' },
  { id: 4, label: '12:00–1:00', start: '12:00', end: '13:00' },
  { id: null, label: 'Prayer & Lunch Break', isBreak: true },
  { id: 5, label: '2:00–3:00', start: '14:00', end: '15:00' },
  { id: 6, label: '3:00–4:00', start: '15:00', end: '16:00' },
  { id: 7, label: '4:00–5:00', start: '16:00', end: '17:00' },
]

export const WEEK_TYPES = ['all', 'odd', 'even']

export const BATCH_COLORS = {
  'MSc': 'bg-purple-100 text-purple-800',
  '13B': 'bg-blue-100 text-blue-800',
  '14B': 'bg-green-100 text-green-800',
  '15B': 'bg-yellow-100 text-yellow-800',
  '16B': 'bg-orange-100 text-orange-800',
  '17B': 'bg-red-100 text-red-800',
}
```

---

## 4. Build Order (Follow This Sequence)

The agent must build in this exact order. Complete each step fully before moving to the next.

```
PHASE 1 — Backend Foundation
  Step 1: Django project setup (settings, requirements.txt, .env)
  Step 2: Database models (all models in routine/models.py)
  Step 3: Migrations (python manage.py makemigrations && migrate)
  Step 4: Seed data (management command to load teachers, rooms, timeslots)
  Step 5: Django admin registration (admin.py)

PHASE 2 — Backend API
  Step 6: Auth endpoints (login, logout, me)
  Step 7: Master data endpoints (teachers, courses, rooms, batches, timeslots)
  Step 8: Semester endpoints (CRUD + activate + publish + clone)
  Step 9: Routine slot endpoints (CRUD)
  Step 10: Conflict detector service
  Step 11: Export PDF endpoint

PHASE 3 — Frontend Foundation
  Step 12: React + Vite setup (package.json, Tailwind config)
  Step 13: axiosInstance + API files
  Step 14: Zustand stores (authStore, routineStore)
  Step 15: Router setup (App.jsx with all routes)
  Step 16: Layout components (Navbar, AdminSidebar, ProtectedRoute)

PHASE 4 — Frontend Pages (Public)
  Step 17: PublicRoutinePage (RoutineGrid + RoutineCell + filters)
  Step 18: BatchSchedulePage
  Step 19: TeacherSchedulePage
  Step 20: LoginPage

PHASE 5 — Frontend Pages (Admin)
  Step 21: DashboardPage
  Step 22: Master data pages (Teachers, Courses, Rooms, Batches, Semesters)
  Step 23: RoutineBuilderPage + SlotModal + ConflictBadge

PHASE 6 — Polish & Testing
  Step 24: Error handling and loading states everywhere
  Step 25: Mobile responsive check
  Step 26: End-to-end test: create semester → build routine → publish → view public
```

---

## 5. What NOT To Do

- ❌ Do not use `localStorage` to store auth state (use session cookies)
- ❌ Do not use inline styles in JSX
- ❌ Do not put API calls directly inside JSX or components (use `src/api/`)
- ❌ Do not hard delete database records (use `is_active = False`)
- ❌ Do not put business logic in Django views (use services/)
- ❌ Do not create endpoints not listed in `API_ROUTES.md`
- ❌ Do not create pages not listed in `UI_PAGES.md`
- ❌ Do not use any package not in the approved list
- ❌ Do not skip error handling
- ❌ Do not leave TODO comments unaddressed without flagging them

---

## 6. How to Ask for Clarification

If any requirement is unclear, the agent must:
1. Continue building what IS clear
2. Leave a comment: `# TODO: [describe what needs clarification]`
3. List all TODOs in a summary at the end of the response

Never silently guess and implement. Always flag uncertainty.
