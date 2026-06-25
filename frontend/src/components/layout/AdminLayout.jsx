import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout() {
  const location = useLocation()
  const { isLoggedIn } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Routine Builder', path: '/admin/routine-builder' },
    { name: 'Teachers', path: '/admin/teachers' },
    { name: 'Courses', path: '/admin/courses' },
    { name: 'Rooms', path: '/admin/rooms' },
    { name: 'Batches', path: '/admin/batches' },
    { name: 'Semesters', path: '/admin/semesters' },
  ]

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:block" onClick={() => setMobileMenuOpen(false)} />

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 text-xl font-bold flex items-center justify-between">
          <span>Admin Panel</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-3">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-6 py-3 transition ${
                  isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
