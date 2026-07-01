# How to Talk to Your Coding Agent
# Copy-paste these prompts exactly (edit where marked)

---

## PROMPT 1 — Project Kickoff (Use This First)

```
I am building a University Routine Management System for the ICE Department at Pabna University of Science and Technology (PUST).

Before writing any code, read all of these documents in this order:
1. PRD.md — what the app does and who uses it
2. ARCHITECTURE.md — tech stack and folder structure
3. DATABASE_SCHEMA.md — every database table and column
4. AUTH_FLOW.md — how authentication works
5. API_ROUTES.md — every backend endpoint
6. UI_PAGES.md — every frontend page and component
7. CODING_RULES.md — rules you MUST follow strictly

After reading all documents, confirm you have read them by listing:
- The tech stack (backend + frontend + database)
- The number of database tables
- The number of API endpoints
- The build order phases from CODING_RULES.md

Do NOT write any code yet. Just confirm understanding.
```

---

## PROMPT 2 — Start Phase 1 (Backend Foundation)

```
You have read all the project documents. Now begin Phase 1 of the build order from CODING_RULES.md.

Complete these steps in order:
- Step 1: Django project setup
- Step 2: All database models
- Step 3: Migrations
- Step 4: Seed data management command
- Step 5: Django admin registration

Follow CODING_RULES.md strictly. Do NOT begin Phase 2 until all 5 steps are done.
Show me the file tree after completing Phase 1.
```

---

## PROMPT 3 — Start Phase 2 (Backend API)

```
Phase 1 is complete. Now begin Phase 2: Backend API.

Complete steps 6 through 11 from the build order in CODING_RULES.md:
- Step 6: Auth endpoints (login, logout, me)
- Step 7: Master data endpoints (teachers, courses, rooms, batches, timeslots)
- Step 8: Semester endpoints
- Step 9: Routine slot endpoints
- Step 10: Conflict detector service (in services/conflict_detector.py)
- Step 11: PDF export endpoint

Every endpoint must match API_ROUTES.md exactly — same URL, same request body, same response format.
Do not create any endpoint not listed in API_ROUTES.md.
```

---

## PROMPT 4 — Start Phase 3 (Frontend Foundation)

```
Phase 2 is complete. Now begin Phase 3: Frontend Foundation.

Complete steps 12 through 16 from CODING_RULES.md:
- Step 12: React + Vite project setup with Tailwind CSS
- Step 13: axiosInstance.js + all API files in src/api/
- Step 14: Zustand stores (authStore.js, routineStore.js)
- Step 15: App.jsx with all routes as defined in UI_PAGES.md navigation structure
- Step 16: Layout components (Navbar, AdminSidebar, ProtectedRoute)

Use only the approved npm packages from CODING_RULES.md.
```

---

## PROMPT 5 — Start Phase 4 (Public Pages)

```
Phase 3 is complete. Now build Phase 4: Public Frontend Pages.

Steps 17 through 20:
- Step 17: PublicRoutinePage with RoutineGrid, RoutineCell, filter panel
- Step 18: BatchSchedulePage
- Step 19: TeacherSchedulePage
- Step 20: LoginPage

The RoutineGrid must display the real structure from our routine:
- Days: Saturday, Sunday, Monday, Tuesday, Wednesday
- Time slots from 9:00 to 17:00 with a lunch break at 13:00–14:00
- Batches: MSc, 13B, 14B, 15B, 16B, 17B
- Batch colors from constants.js
- Odd/Even week badge on relevant slots
```

---

## PROMPT 6 — Start Phase 5 (Admin Pages)

```
Phase 4 is complete. Now build Phase 5: Admin Pages.

Steps 21 through 23:
- Step 21: DashboardPage with stats cards and quick links
- Step 22: Master data management pages (Teachers, Courses, Rooms, Batches, Semesters)
  - Each page has a table with Edit and Delete buttons
  - Each page has an Add button that opens a form/modal
- Step 23: RoutineBuilderPage
  - Same grid as public view but every cell is clickable
  - Clicking empty cell opens SlotModal
  - Clicking filled cell shows edit/delete options
  - SlotModal has dropdowns for Batch, Course, Room, Teacher(s), Week Type
  - Conflicts shown as red warning inside modal

This is the hardest phase. Build it step by step. Do Step 21, show me the result, then continue.
```

---

## PROMPT 7 — Fix a Specific Bug

```
There is a bug in [FILE NAME] at [DESCRIBE THE PROBLEM].

The expected behavior is: [WHAT SHOULD HAPPEN]
The actual behavior is: [WHAT IS HAPPENING]

Fix only this specific issue. Do not change any other part of the code.
After fixing, explain what was wrong and what you changed.
```

---

## PROMPT 8 — Load Seed Data

```
Create a Django management command called `load_seed_data` in:
backend/apps/routine/management/commands/load_seed_data.py

It should insert the following into the database if they don't already exist:

Teachers (from DATABASE_SCHEMA.md seed data):
MAH, MOF, MSH, MIH, TNT, TD, AM — with full names

Rooms: 901, 902, 903, 904, 919, 920, 921

Time Slots (from DATABASE_SCHEMA.md seed data):
Slot 1: 09:00–10:00, Slot 2: 10:00–11:00, ..., Lunch Break: 13:00–14:00, ..., Slot 7: 16:00–17:00

Batches (from DATABASE_SCHEMA.md seed data):
MSc, 13B, 14B, 15B, 16B, 17B — with sessions and effective dates

Use get_or_create() so running the command twice doesn't create duplicates.
```

---

## TIPS FOR TALKING TO YOUR AGENT

**Be specific about scope:**
> BAD: "build the frontend"
> GOOD: "build only Step 17 (PublicRoutinePage) from the build order"

**Always reference the documents:**
> "Follow API_ROUTES.md exactly for the endpoint structure"
> "The conflict rules are defined in DATABASE_SCHEMA.md section 6"

**One phase at a time:**
> Don't ask for everything at once. Complete Phase 1 fully before asking for Phase 2.

**When something looks wrong:**
> "This doesn't match UI_PAGES.md — the SlotModal should also have a Week Type radio button. Please add it."

**After each phase, verify:**
> "Show me the current folder structure so I can confirm it matches ARCHITECTURE.md"
