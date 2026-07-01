# Authentication Flow
# University Routine Management System

---

## 1. Overview

- **Method:** Django session-based authentication
- **Who logs in:** Admin only (1–2 people)
- **Public users:** No login required — read-only access
- **No self-registration** — admin accounts created via `python manage.py createsuperuser`

---

## 2. Login Flow (Step by Step)

```
1. User visits /login page (React)

2. User enters email + password → clicks "Login"

3. React sends POST /api/v1/auth/login/
   Body: { "username": "admin@pust.ac.bd", "password": "••••••" }

4. Django validates credentials using authenticate()
   - If INVALID → return 401 { "error": "Invalid credentials" }
   - If VALID   → create session, set cookie: sessionid=xxxxx

5. Django returns 200:
   { "user": { "id": 1, "username": "admin@pust.ac.bd", "is_staff": true } }

6. React stores user info in Zustand authStore (in memory only, NOT localStorage)

7. React redirects to /admin/dashboard
```

---

## 3. Session Persistence Flow

```
1. User refreshes browser or opens new tab

2. React app loads → immediately calls GET /api/v1/auth/me/
   (Browser automatically sends session cookie)

3. If session valid → Django returns user info
   → React sets isLoggedIn = true in authStore
   → User sees admin dashboard

4. If session expired/invalid → Django returns 401
   → React sets isLoggedIn = false
   → User sees public view (not redirected to login unless they try to access /admin/*)
```

---

## 4. Logout Flow

```
1. Admin clicks "Logout" button

2. React sends POST /api/v1/auth/logout/

3. Django calls logout(request) → destroys session in database

4. Django returns 200 { "message": "Logged out successfully" }

5. React clears authStore → redirects to /login
```

---

## 5. Route Protection (React Side)

```jsx
// src/components/layout/ProtectedRoute.jsx
// Wrap admin pages with this component

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuthStore()

  if (isLoading) return <LoadingSpinner />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

// Usage in App.jsx router:
<Route path="/admin/*" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
} />
```

---

## 6. API Endpoints (Auth)

| Method | URL | Auth Required | Description |
|--------|-----|--------------|-------------|
| POST | `/api/v1/auth/login/` | No | Login with email + password |
| POST | `/api/v1/auth/logout/` | Yes | Destroy session |
| GET | `/api/v1/auth/me/` | Yes | Get current logged-in user |

---

## 7. Django Settings Required

```python
# config/settings/base.py

SESSION_COOKIE_AGE = 28800          # 8 hours in seconds
SESSION_COOKIE_HTTPONLY = True       # JS cannot access cookie
SESSION_COOKIE_SAMESITE = 'Lax'     # CSRF protection
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173']  # React dev server

# CORS settings (for React on different port during dev)
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
CORS_ALLOW_CREDENTIALS = True        # Required for cookies to work cross-origin
```

---

## 8. CSRF Handling in React

Django requires a CSRF token for all POST/PUT/PATCH/DELETE requests.

```javascript
// src/api/axiosInstance.js

import axios from 'axios'

function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,   // send cookies with every request
})

axiosInstance.interceptors.request.use(config => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRFToken'] = getCsrfToken()
  }
  return config
})

export default axiosInstance
```

---

## 9. Permissions Summary

| Resource | Public | Admin |
|----------|--------|-------|
| View active routine | ✅ | ✅ |
| View batch schedule | ✅ | ✅ |
| View teacher schedule | ✅ | ✅ |
| Login page | ✅ | ✅ |
| Admin dashboard | ❌ | ✅ |
| Create/edit/delete any data | ❌ | ✅ |
| Publish/unpublish semester | ❌ | ✅ |
| Export PDF | ✅ | ✅ |

---

## 10. Admin Account Creation

**No UI registration.** Done via Django management command:

```bash
python manage.py createsuperuser
# Prompts: username (use email), email, password

# OR seed via fixture
python manage.py loaddata initial_admin.json
```

Initial admin credentials for development (NEVER use in production):
```
Email: admin@ice.pust.ac.bd
Password: set-this-yourself
```
