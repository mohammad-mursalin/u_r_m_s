import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import useToastStore from './store/toastStore'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import AdminLayout from './components/layout/AdminLayout'
import Toast from './components/ui/Toast'
import PublicRoutinePage from './pages/PublicRoutinePage'
import BatchSchedulePage from './pages/BatchSchedulePage'
import TeacherSchedulePage from './pages/TeacherSchedulePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import RoutineBuilderPage from './pages/admin/RoutineBuilderPage'
import ViewRoutinePage from './pages/admin/ViewRoutinePage'
import TeachersPage from './pages/admin/TeachersPage'
import CoursesPage from './pages/admin/CoursesPage'
import RoomsPage from './pages/admin/RoomsPage'
import BatchesPage from './pages/admin/BatchesPage'
import SemestersPage from './pages/admin/SemestersPage'

function App() {
  const initAuth = useAuthStore(state => state.initAuth)

  useEffect(() => {
    initAuth()
  }, [])

  const toasts = useToastStore(state => state.toasts)
  const removeToast = useToastStore(state => state.removeToast)

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoutinePage />} />
        <Route path="/schedule/batch/:batchName" element={<BatchSchedulePage />} />
        <Route path="/schedule/teacher/:code" element={<TeacherSchedulePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes — nested under AdminLayout via Outlet */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/routine-builder" element={<RoutineBuilderPage />} />
          <Route path="/admin/view-routine" element={<ViewRoutinePage />} />
          <Route path="/admin/teachers" element={<TeachersPage />} />
          <Route path="/admin/courses" element={<CoursesPage />} />
          <Route path="/admin/rooms" element={<RoomsPage />} />
          <Route path="/admin/batches" element={<BatchesPage />} />
          <Route path="/admin/semesters" element={<SemestersPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </Router>
  )
}

export default App