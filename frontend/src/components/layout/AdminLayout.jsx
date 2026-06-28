import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { X, Eye, LayoutGrid, Users, BookOpen, MapPin, UserCheck, Calendar, CalendarDays } from 'lucide-react'
import { useState } from 'react'

const iconMap = {
  '/admin/dashboard': CalendarDays,
  '/admin/routine-builder': LayoutGrid,
  '/admin/view-routine': Eye,
  '/admin/teachers': Users,
  '/admin/courses': BookOpen,
  '/admin/rooms': MapPin,
  '/admin/batches': UserCheck,
  '/admin/semesters': Calendar,
}

export default function AdminLayout() {
  const location = useLocation()
  const { isLoggedIn } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Routine Builder', path: '/admin/routine-builder' },
    { name: 'View Routine', path: '/admin/view-routine' },
    { name: 'Teachers', path: '/admin/teachers' },
    { name: 'Courses', path: '/admin/courses' },
    { name: 'Rooms', path: '/admin/rooms' },
    { name: 'Batches', path: '/admin/batches' },
    { name: 'Semesters', path: '/admin/semesters' },
  ]

  return (
    <div className="flex min-h-screen">
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

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
            const Icon = iconMap[link.path]
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-6 py-3 transition ${
                  isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {Icon && <Icon size={18} />}
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