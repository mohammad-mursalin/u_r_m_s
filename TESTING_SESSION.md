# TESTING SESSION INSTRUCTIONS

## 1. Project Overview (brief)

What this app is:
- ICE Dept — Pabna University of Science and Technology (PUST)
- University routine management system for scheduling classes
- Full-stack application with React frontend and Django REST API backend

Frontend:
- React 18 + Vite on http://localhost:5173
- Built with TypeScript, Tailwind CSS, React Router, Zustand
- Provides public routine view and admin interface

Backend:
- Django 5.0 + DRF on http://localhost:8000
- RESTful API with PostgreSQL database
- Provides CRUD operations for teachers, courses, rooms, batches, semesters, and routine slots
- Includes conflict detection and PDF export features

Database:
- PostgreSQL 16 running in Docker
- Stores all application data
- Seed data loaded: 7 teachers, courses, rooms, batches, time slots

## 2. How to Start the Servers

### Step 1: Start Docker Desktop
- **Manual action required**: Open Docker Desktop from Windows Start Menu
- **Wait for**: "Engine running" message in Docker Desktop status bar
- **Do not proceed** until Docker shows it's ready

### Step 2: Start Backend + Database
```bash
cd D:\Desktop\u_r_m_s
docker-compose up -d
```

### Step 3: Verify Backend is Running
```bash
docker-compose logs backend
```

**Look for**: "Starting development server at http://0.0.0.0:8000/"

If you see "Engine starting" or "Wait for engine to start", Docker Desktop is still starting up.

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Verify Frontend is Running
**Look for**: "Local: http://localhost:5173/" in the terminal output

### Step 6: Admin Login Credentials
- Username: `admin`
- Password: `admin123`

## 3. How to Run Tests

### Testing Order
Follow the TEST_CHECKLIST.md sections in order:
1. Section 1: Public Routine View (no login)
2. Section 2: Batch & Teacher Schedule Pages
3. Section 3: Admin Login & Logout
4. Section 4: Master Data (Teachers, Courses, Rooms, Batches)
5. Section 5: Semester Management
6. Section 6: Routine Builder
7. Section 7: Conflict Detection
8. Section 8: PDF Export
9. Section 9: Mobile View
10. Section 10: Edge Cases

### Per-Test Procedure
For each test case:

1. **Read the test**: Look at `[ ] TEST-XXX: <what to do> → <expected result>`

2. **Perform the action**: Do exactly what the test describes in the browser

3. **Verify the result**: Check if the expected result happened

4. **Mark the test**:
   - Pass: Change `[ ]` to `[x]` at the start of the test line
   - Fail: Change `[ ]` to `[F]` at the start of the test line

5. **Document any failures**: Copy the failed test details to BUGS.md (see Section 5)

6. **Continue to next test**: Move to the next test case

### File Organization
- Keep both TEST_CHECKLIST.md and BUGS.md open in separate tabs/files
- Update TEST_CHECKLIST.md as you test (mark [x] for passes, [F] for failures)
- Update BUGS.md only for failures

## 4. When a Test Fails — What To Do

### Important: Do NOT Fix Immediately
When you encounter a failing test:
1. **Do NOT fix it yet**
2. **Document it in BUGS.md**
3. **Continue testing all 240 tests**
4. **Only after all tests are attempted**, fix bugs in order of severity

### What to Record in BUGS.md
For each failing test, create an entry with:

```markdown
---
### BUG-XXX
- Test ID: TEST-XXX
- Feature: [Feature name from checklist]
- Action: [What you did to trigger the test]
- Expected: [What should have happened]
- Actual: [What actually happened]
- Severity: [CRITICAL | HIGH | LOW]
- Screenshot: [Describe what you see in the browser]
---
```

### Bug Severity Levels
- **CRITICAL**: App crashes, data loss, security vulnerability, or completely broken functionality
- **HIGH**: Feature doesn't work at all, major functionality missing
- **LOW**: Visual issue, minor bug, UX improvement needed

### Example BUGS.md Entry
```markdown
---
### BUG-001
- Test ID: TEST-023
- Feature: Conflict Detection
- Action: Assigned MAH to two slots at same time
- Expected: Red conflict warning shown
- Actual: No warning appeared, slot saved silently
- Severity: HIGH
- Screenshot: See screenshot capture showing slot saved without warning
---
```

## 5. Error Reporting Format

Create or update BUGS.md with this exact structure:

```markdown
# BUGS.md - Test Failures

This file contains all test failures encountered during testing.

---
### BUG-001
- Test ID: TEST-023
- Feature: Conflict Detection
- Action: Assigned MAH to two slots at same time
- Expected: Red conflict warning shown
- Actual: No warning appeared, slot saved silently
- Severity: HIGH
---

---
### BUG-002
- Test ID: TEST-045
- Feature: Semester Management
- Action: Tried to publish inactive semester
- Expected: Error message shown
- Actual: Semester published successfully (shouldn't have allowed it)
- Severity: CRITICAL
---

## Severity Key
- CRITICAL: App crashes, data loss, security issue, complete feature failure
- HIGH: Feature doesn't work, significant bug
- LOW: Visual issue, minor bug, improvement needed
```

### Important Notes
- Number bugs sequentially (BUG-001, BUG-002, etc.)
- Only document FAILED tests (not passing ones)
- Keep BUGS.md updated as you go
- Include screenshot descriptions for every bug
- Do NOT fix any bugs until all 240 tests are completed

## 6. After All Tests Are Done

When you have:
- [x] Tested all 240 tests from TEST_CHECKLIST.md
- [x] Marked all test results ([x] for pass, [F] for fail)
- [x] Documented all failures in BUGS.md
- [x] Verified test count is 240

**Start a new session and say:**

> "Read TESTING_SESSION.md and BUGS.md. Fix all CRITICAL bugs first,
> then HIGH, then LOW. Fix one bug at a time and tell me what you changed."

## 7. Files the New Session Needs

In the new testing session, you only need to provide:

### Starting Testing:
- `TESTING_SESSION.md` (this file)
- `TEST_CHECKLIST.md`

### For Bug Fixing Session:
- `TESTING_SESSION.md` (this file)
- `BUGS.md` (with all documented bugs)
- For each bug: the specific source file where it exists (e.g., `frontend/src/pages/admin/TeachersPage.jsx`)

### File Structure Reference:
```
D:\Desktop\u_r_m_s\
├── TESTING_SESSION.md          ← Start here in testing session
├── TEST_CHECKLIST.md           ← Test cases to execute
├── BUGS.md                      ← Document failures here
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   └── ...
├── backend/
│   ├── apps/
│   │   └── routine/
│   └── ...
└── docker-compose.yml
```

## 8. Quick Reference: Test Execution Checklist

When you're ready to start:

- [ ] Docker Desktop is running (status: Engine running)
- [ ] Database container is running (`docker-compose ps`)
- [ ] Backend container is running (`docker-compose ps`)
- [ ] Backend logs show "Starting development server"
- [ ] Frontend is running (`cd frontend && npm run dev`)
- [ ] Frontend logs show "Local: http://localhost:5173/"
- [ ] You can access http://localhost:5173 in browser
- [ ] You can access http://localhost:8000/api/v1/ in browser
- [ ] Admin login works: admin/admin123
- [ ] TEST_CHECKLIST.md is open
- [ ] BUGS.md file is ready (or create it if it doesn't exist)

## 9. Common Issues to Watch For

### Docker Issues:
- Backend won't start: Check if Docker Desktop is running
- Database connection failed: Wait for Docker Desktop to fully start
- Container crashes: Check `docker-compose logs backend`

### Frontend Issues:
- Port 5173 already in use: Kill the process on that port, restart frontend
- Cannot find module: Run `npm install` in frontend folder
- Build errors: Check terminal for specific error messages

### Backend Issues:
- 500 error on API: Check `docker-compose logs backend`
- 404 error: Check URL configuration and view functions
- Database error: Check database container status

## 10. Safety Measures

- **Never** fix a bug immediately when it's found
- **Always** continue testing all 240 tests first
- **Always** mark tests as [F] for failures
- **Always** document in BUGS.md
- **Only** fix bugs after the complete testing cycle
- **Do NOT** skip any tests (even if they seem trivial)

---

**Ready to test? Follow Section 2 to start the servers, then Section 3 to begin testing with TEST-001!**
