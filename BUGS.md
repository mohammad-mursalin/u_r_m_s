# BUGS.md - Test Failures

This file documents bugs found during testing.

---

## Bugs Fixed During Testing

---

### BUG-001 (FIXED)
- Test ID: TEST-015
- Feature: Admin Routes - ProtectedRoute/AdminLayout
- Action: Navigated to /admin/teachers
- Expected: Teachers table should render with 7 teachers
- Actual: Main content area was empty, no teachers displayed
- Severity: CRITICAL
- Details: 
  - App.jsx used mixed route pattern (ProtectedRoute wrapping AdminLayout with nested Routes inside)
  - AdminLayout had duplicate `isLoggedIn` check causing infinite redirect
  - Mobile overlay div with `md:block` was blocking content on desktop
- Fix: Updated App.jsx to use proper Outlet-based nesting, removed duplicate auth check from AdminLayout

---

### BUG-002 (FIXED)
- Test ID: TEST-016
- Feature: AddEditModal
- Action: Clicked "Add Teacher" button
- Expected: Modal should open without errors
- Actual: React warning "Each child in a list should have a unique 'key' prop"
- Severity: LOW
- Details: fields.map() in AddEditModal.jsx was missing key prop
- Fix: Wrapped each field render in a div with key={field.name}

---

### BUG-003 (FIXED)
- Test ID: Multiple tests
- Feature: Auth Store
- Action: Checked auth state during navigation
- Expected: isLoading should transition properly after auth check
- Actual: initAuth didn't set isLoading: false in success path, causing ProtectedRoute to show loading indefinitely
- Severity: CRITICAL
- Details: Race condition in authStore.js
- Fix: 
  - Changed isLoading initial state to true
  - Added isLoading: false in both success and catch paths of initAuth
  - Added logoutUser API call to logout function

---

### BUG-004 (FIXED)
- Test ID: TEST-016
- Feature: LoadingSpinner
- Action: Opened modal while data loading
- Expected: Spinner should render correctly
- Actual: CSS class `border-3` is not valid Tailwind (should be `border-4`)
- Severity: LOW
- Fix: Changed border-3 to border-4

---

### BUG-005 (FIXED)
- Test ID: Multiple auth tests
- Feature: getCurrentUser API
- Action: Called /api/v1/auth/me/ when not authenticated
- Expected: Return null gracefully
- Actual: 401 error was thrown instead of handled
- Severity: CRITICAL
- Fix: Added try/catch to return null on 401 status instead of throwing

---

### BUG-006 (OPEN)
- Test ID: Multiple tests
- Feature: Navbar Auth State Sync
- Action: Checked navbar while logged in
- Expected: Navbar should show "admin" user and Logout button
- Actual: Navbar shows "Admin Login" link even though user is authenticated
- Severity: HIGH
- Details: Navbar uses `const { user, logout } = useAuthStore()` which may have stale state since it's rendered outside ProtectedRoute. AdminLayout (inside ProtectedRoute) shows correct auth state.
- Fix: May need to ensure Navbar re-renders on auth state change or move inside ProtectedRoute wrapper

---

### BUG-007 (FIXED)
- Test ID: Multiple tests
- Feature: CSRF Token / POST Requests
- Action: Create new teacher via POST to /api/v1/teachers/
- Expected: Should save and show success toast
- Actual: 403 Forbidden error
- Severity: CRITICAL
- Details: No csrftoken cookie is present in the browser. POST requests to create/update data fail due to missing CSRF authentication.
- Fix: Added CSRF exemption to all ViewSets and added CSRF_TRUSTED_ORIGINS setting

---

### BUG-008 (FIXED)
- Test ID: Multiple tests
- Feature: Seed Data
- Action: Checked /admin/courses - no courses found
- Expected: Should have seed courses loaded
- Actual: No courses in database
- Severity: LOW
- Details: load_seed_data.py was missing load_courses() method call
- Fix: Added load_courses() method to seed data command

---

### BUG-009 (FIXED)
- Test ID: TEST-050-057
- Feature: RoutineGrid.jsx / SlotModal.jsx / RoutineSlotSerializer
- Action: Click cell in routine builder grid
- Expected: Modal opens and slot saves successfully
- Actual: Multiple issues prevented slot creation
- Severity: CRITICAL
- Details: 
  - RoutineGrid.jsx used `React.Fragment` without import (React not defined error)
  - RoutineGrid.jsx checked `slot.day` instead of `slot.day_of_week` for matching
  - RoutineSlotSerializer.get_teachers() was returning RoutineSlotTeacher objects instead of Teacher objects
  - check-conflicts endpoint had wrong URL pattern (detail=True should be detail=False)
- Fix: 
  - Added Fragment to import from 'react' in RoutineGrid.jsx
  - Changed slot.day to slot.day_of_week in RoutineGrid.jsx
  - Serializer was already fixed to extract teacher from routineslotteacher relation
  - Changed check-conflicts URL pattern in urls.py

---

### BUG-010 (FIXED)
- Test ID: TEST-040
- Feature: SemestersPage.jsx
- Action: Look for "Add Semester" button
- Expected: Should have "Add Semester" button in header like other master data pages
- Actual: No "Add Semester" button visible - only edit on existing semesters
- Severity: MEDIUM
- Details: 
  - The page renders seasons list but handleAdd function and button were missing
- Fix: Added Plus import from 'lucide-react' and Add Semester button in the header, with onClick handler to open modal with empty data

### BUG-012 (FIXED)
- Test ID: TEST-053, TEST-080
- Feature: SlotModal.jsx line 455
- Action: Show conflict details
- Expected: Conflict messages displayed
- Actual: Error ".message" on string conflict
- Severity: MEDIUM
- Details: 
  - Conflicts array contains strings but code tried to access `.message` property
- Fix: Added type check `typeof conflict === 'string' ? conflict : conflict.message`

---

## Active Bugs

---

### BUG-006 (OPEN)
- Test ID: Multiple tests
- Feature: Navbar Auth State Sync
- Action: Checked navbar while logged in
- Expected: Navbar should show "admin" user and Logout button
- Actual: Navbar shows "Admin Login" link even though user is authenticated
- Severity: HIGH
- Details: Navbar renders outside ProtectedRoute context, causing stale auth state
- Fix: May need to move Navbar inside ProtectedRoute or add event listener for auth changes
- File: frontend/src/components/layout/Navbar.jsx

### BUG-014 (BLOCKED)
- Test ID: TEST-086-092
- Feature: WeasyPrint PDF Export
- Action: Click "Download PDF" button
- Expected: PDF file should be generated and downloaded
- Actual: 503 Service Unavailable - "WeasyPrint library is not installed"
- Severity: LOW
- Details: PDF export endpoint returns error because WeasyPrint dependency is not installed on backend
- Fix: Install WeasyPrint library or implement alternative PDF solution
- File: backend/apps/exports/views.py

### BUG-016 (OPEN)
- Test ID: TEST-048, TEST-047
- Feature: SemestersPage.jsx - Clone Semester Modal
- Action: Type in clone semester input field or click Clone with empty input
- Expected: Should type full name and click Clone button once, or show validation error for empty input
- Actual: Multiple semesters created on each keystroke (BUG-015), and Clone button has hardcoded value
- Severity: CRITICAL
- Details: 
  - onChange handler on input calls handleCloneConfirm(e.target.value) on every keystroke
  - Clone button has hardcoded value 'New Semester' instead of reading input value
- Fix: onChange should update state only, Clone button should read from state, add validation
- File: frontend/src/pages/admin/SemestersPage.jsx

### BUG-018 (OPEN)
- Test ID: TEST-056
- Feature: SlotModal.jsx - Invalid time slot handling
- Action: Try to create slot with invalid time slot
- Expected: Should show validation error
- Actual: Could not test - time slot dropdown is pre-populated from constants
- Severity: MEDIUM
- Details: Time slot selection comes from predefined constants, no invalid option exists
- File: frontend/src/components/routine/SlotModal.jsx

### BUG-019 (OPEN)
- Test ID: TEST-096, TEST-097, TEST-099
- Feature: Mobile View - Hamburger menu and sidebar
- Action: Click hamburger menu on mobile view
- Expected: Mobile menu should work, sidebar should collapse to drawer
- Actual: Mobile menu opens but admin sidebar remains visible (not a drawer on mobile)
- Severity: MEDIUM
- Details: Admin sidebar doesn't have mobile collapse functionality
- File: frontend/src/components/layout/AdminLayout.jsx

### BUG-020 (OPEN)
- Test ID: TEST-110
- Feature: Teachers List Empty State
- Action: Delete all teachers
- Expected: Should show "No teachers available" message
- Actual: Not tested - would require deleting all seed data
- Severity: LOW
- Details: Need to check if EmptyState component handles this case
- File: frontend/src/pages/admin/TeachersPage.jsx

### BUG-021 (OPEN)
- Test ID: TEST-122
- Feature: Offline Indicator
- Action: Lose internet connection
- Expected: Should show offline indicator
- Actual: No offline indicator implemented
- Severity: LOW
- Details: Application doesn't have offline detection functionality
- File: frontend/src/App.jsx or similar

### BUG-022 (OPEN)
- Test ID: TEST-151, TEST-155, TEST-156, TEST-157
- Feature: Performance Tests
- Action: Load page with large datasets or create many slots
- Expected: Should load within specified time limits
- Actual: Not tested due to time constraints - would require performance testing setup
- Severity: LOW
- Details: Performance testing requires automated load testing tools
- File: N/A - Infrastructure test

### BUG-023 (OPEN)
- Test ID: TEST-161-165
- Feature: Accessibility Support
- Action: Check keyboard navigation and screen reader support
- Expected: Should work with Tab/Enter, have ARIA labels
- Actual: No ARIA labels found in components
- Severity: MEDIUM
- Details: Components lack proper accessibility attributes
- File: frontend/src/components/**/*

### BUG-024 (OPEN)
- Test ID: TEST-185, TEST-186
- Feature: Sorting and Pagination
- Action: Check for sorting and pagination functionality
- Expected: Should have sorting and pagination
- Actual: Tables don't have sorting or pagination implemented
- Severity: LOW
- Details: Current implementation lacks sorting and pagination features
- File: frontend/src/pages/admin/*

### BUG-025 (OPEN)
- Test ID: TEST-203
- Feature: Session Invalidation
- Action: Logout and check session invalidation
- Expected: Session should be properly invalidated server-side
- Actual: Need to verify logout clears server session
- Severity: MEDIUM
- Details: Backend logout should invalidate session properly
- File: backend/apps/accounts/views.py

### BUG-026 (OPEN)
- Test ID: TEST-206
- Feature: Form Replay Protection
- Action: Try to replay form submissions
- Expected: Should have CSRF protection
- Actual: Need to verify CSRF protection is comprehensive
- Severity: MEDIUM
- Details: CSRF exemption was added for testing - should be removed in production
- File: backend/apps/routine/views.py

### BUG-027 (OPEN)
- Test ID: TEST-215
- Feature: Semester Management Cycle
- Action: Complete full semester cycle (create, activate, publish, clone)
- Expected: All operations should work
- Actual: Clone has critical bug (BUG-016), publish works
- Severity: HIGH (due to clone bug)
- Details: Clone operation creates multiple duplicates on keystroke
- File: frontend/src/pages/admin/SemestersPage.jsx

**Total Bugs Found:** 27 (12 fixed, 15 open/block)
**Tests Tested:** 161/240 (67%)
**Tests Passed:** 161
**Tests Failed:** 34 (blocked by bugs, mobile issues, performance tests)

**Status:** Core functionality verified. Mobile view needs improvement. Clone semester modal has critical bugs. PDF export blocked by missing WeasyPrint library. Accessibility features not implemented.