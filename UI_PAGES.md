# UI Pages & Components
# University Routine Management System

---

## 1. Public Pages (No Login)

---

### Page 1: Public Routine View
**Route:** `/`  
**File:** `src/pages/PublicRoutinePage.jsx`

**What it shows:**
- Department name header: "ICE Department — Pabna University of Science and Technology"
- Semester name + effective date
- Full timetable grid: rows = Batches, columns = Time Slots, grouped by Day
- Each cell shows: Course Code, Teacher Code(s), Room Number
- Color-coded by batch (each batch gets a unique color)
- Lunch break row (1:00–2:00) shown as merged grey row labeled "Prayer & Lunch Break"
- Odd/Even week slots show a small badge: "ODD" or "EVEN"
- Multi-teacher slots show both codes: "MSH + MIH"

**Filter panel (above grid):**
- Dropdown: Filter by Batch (All, 13B, 14B, 15B, 16B, 17B, MSc)
- Dropdown: Filter by Teacher (All, MAH, MOF, MSH, MIH, TNT, TD, AM)
- Dropdown: Filter by Day (All, Saturday, Sunday, Monday, Tuesday, Wednesday)
- Button: "Clear Filters"
- Button: "Download PDF" → calls `/api/v1/export/routine/pdf/`

**Layout (ASCII wireframe):**
```
┌────────────────────────────────────────────────────┐
│   ICE Dept — PUST          [January 2026 Semester]  │
│   Class Routine (Effective from 3 January 2026)     │
├─────────────────────────────────────────────────────┤
│  Filter: [Batch ▼]  [Teacher ▼]  [Day ▼]  [Clear]  │
│                                    [Download PDF]    │
├─────────────────────────────────────────────────────┤
│         │ 9–10 │ 10–11 │ 11–12 │ 12–1 │BR│2–3│3–4│4–5 │
│ SAT 13B │ ICE  │ ICE   │       │      │  │   │   │    │
│ SAT 14B │      │ ICE   │ ICE   │ ICE  │  │   │   │    │
│ SAT 15B │ ...  │  ...  │  ...  │  ... │  │   │   │    │
│ ─────── │ ─────│ ───── │ ───── │ ──── │  │   │   │    │
│ SUN 13B │ ...  │  ...  │  ...  │  ... │  │   │   │    │
│  ...    │  ... │  ...  │  ...  │  ... │  │   │   │    │
└─────────────────────────────────────────────────────┘
```

---

### Page 2: Batch Schedule Page
**Route:** `/schedule/batch/:batchName`  
**File:** `src/pages/BatchSchedulePage.jsx`

**What it shows:**
- Heading: "Class Schedule — Batch 15B (2022-2023)"
- Filtered timetable showing only that batch's rows
- Same grid format as public routine view
- "Back to Full Routine" link

---

### Page 3: Teacher Schedule Page
**Route:** `/schedule/teacher/:shortCode`  
**File:** `src/pages/TeacherSchedulePage.jsx`

**What it shows:**
- Heading: "Schedule — Dr. Md. Sarwar Hosain (MSH)"
- Weekly grid showing all slots where this teacher appears
- "Download PDF" for personal schedule
- "Back to Full Routine" link

---

### Page 4: Login Page
**Route:** `/login`  
**File:** `src/pages/LoginPage.jsx`

**What it shows:**
- Centered card layout
- Heading: "Admin Login"
- Subtext: "ICE Department Routine Management"
- Email input field
- Password input field
- "Login" button
- Error message area (shown if credentials wrong)
- No "Register" or "Forgot Password" link

---

## 2. Admin Pages (Login Required)

All admin pages use a consistent layout:
- Left sidebar: navigation links
- Top bar: page title + logged-in user + logout button
- Main content area

---

### Page 5: Admin Dashboard
**Route:** `/admin/dashboard`  
**File:** `src/pages/admin/DashboardPage.jsx`

**What it shows:**
- Stats cards row: Total Courses | Total Teachers | Total Rooms | Total Batches
- Active semester info card: name, effective date, published status
- Quick action buttons: "Open Routine Builder", "Manage Teachers", "Add Course"
- Recent changes list (last 5 edits) — optional for v1

---

### Page 6: Routine Builder
**Route:** `/admin/routine-builder`  
**File:** `src/pages/admin/RoutineBuilderPage.jsx`

**This is the most complex page in the app.**

**What it shows:**
- Semester selector dropdown at top (choose which semester to edit)
- Publish/Unpublish toggle button
- Same grid as public view BUT each cell is clickable
- Clicking an EMPTY cell → opens SlotModal to assign a slot
- Clicking a FILLED cell → shows edit/delete options
- Conflict badges shown inline (red warning icon on conflicted cells)
- "Check All Conflicts" button → scans entire routine and highlights all issues

**SlotModal (popup when clicking a cell):**
- Shows: Day, Time Slot (pre-filled from the clicked cell)
- Dropdown: Select Batch
- Dropdown: Select Course
- Dropdown: Select Room
- Multi-select: Select Teacher(s)
- Radio: Week Type (All Weeks / Odd Weeks Only / Even Weeks Only)
- Number input: Duration (1, 2, or 3 slots)
- "Save Slot" button
- "Delete Slot" button (if editing existing)
- Conflict warnings shown inside modal before saving

---

### Page 7: Manage Teachers
**Route:** `/admin/teachers`  
**File:** `src/pages/admin/TeachersPage.jsx`

**What it shows:**
- Table: Full Name | Short Code | Email | Designation | Actions
- "Add Teacher" button → opens inline form or modal
- Each row: Edit button | Delete button (soft delete)
- Search bar to filter the table

---

### Page 8: Manage Courses
**Route:** `/admin/courses`  
**File:** `src/pages/admin/CoursesPage.jsx`

**What it shows:**
- Table: Course Code | Course Name | Credit Hours | Type | Actions
- "Add Course" button
- Each row: Edit | Delete
- Filter by type: All / Theory / Lab

---

### Page 9: Manage Rooms
**Route:** `/admin/rooms`  
**File:** `src/pages/admin/RoomsPage.jsx`

**What it shows:**
- Table: Room Number | Type | Capacity | Actions
- "Add Room" button
- Each row: Edit | Delete

---

### Page 10: Manage Batches
**Route:** `/admin/batches`  
**File:** `src/pages/admin/BatchesPage.jsx`

**What it shows:**
- Table: Batch Name | Session | Effective Date | Program | Actions
- "Add Batch" button
- Each row: Edit | Delete

---

### Page 11: Manage Semesters
**Route:** `/admin/semesters`  
**File:** `src/pages/admin/SemestersPage.jsx`

**What it shows:**
- List of semesters with status badges: Active / Draft / Archived
- "Create New Semester" button
- Each row: "Set Active" | "Publish" | "Clone" | "Open Builder" buttons
- Clone button → popup asking for new semester name

---

## 3. Reusable Components

### `RoutineGrid.jsx`
Props:
- `slots` (array of slot objects from API)
- `isEditable` (boolean — shows click handlers if true)
- `highlightBatch` (optional string — dims all other batches)
- `highlightTeacher` (optional string)

### `RoutineCell.jsx`
Props:
- `slot` (slot object or null if empty)
- `day`, `timeSlot`, `batch` (for the cell's position)
- `onClick` (handler for admin edit mode)
- `hasConflict` (boolean — shows red border if true)

### `SlotModal.jsx`
Props:
- `isOpen`, `onClose`, `onSave`, `onDelete`
- `day`, `timeSlotId` (pre-filled)
- `existingSlot` (null for new, slot object for edit)

### `ConflictBadge.jsx`
Props:
- `conflicts` (array of conflict objects)
- Shows red badge with tooltip listing each conflict

### `RoutineFilterPanel.jsx`
Props:
- `batches`, `teachers` (arrays for dropdown options)
- `onFilterChange` (callback with selected filters)

---

## 4. Navigation Structure

```
Public:
  /                          → Full routine view
  /schedule/batch/:name      → Batch schedule
  /schedule/teacher/:code    → Teacher schedule
  /login                     → Admin login

Admin (protected):
  /admin/dashboard           → Overview
  /admin/routine-builder     → Edit routine grid
  /admin/teachers            → CRUD teachers
  /admin/courses             → CRUD courses
  /admin/rooms               → CRUD rooms
  /admin/batches             → CRUD batches
  /admin/semesters           → Manage semesters
```

---

## 5. Color Scheme for Batches (Routine Grid)

Use consistent soft background colors for each batch:
```
MSc → bg-purple-100  text-purple-800
13B → bg-blue-100    text-blue-800
14B → bg-green-100   text-green-800
15B → bg-yellow-100  text-yellow-800
16B → bg-orange-100  text-orange-800
17B → bg-red-100     text-red-800
```
Conflict cells: `bg-red-200 border-2 border-red-500`
Lunch break row: `bg-gray-200 text-gray-500 italic`
