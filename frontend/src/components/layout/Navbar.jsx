import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut, Menu } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-white shadow-md h-16 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="text-xl font-bold text-gray-800">
          <span className="hidden md:inline">ICE Dept — PUST</span>
          <span className="md:hidden">ICE</span>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {user.username}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={closeMobileMenu}
        >
          Admin Login
        </Link>
      )}

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t md:hidden animate-slide-in">
          <div className="px-4 py-2">
            <Link
              to="/"
              className="block py-2 px-4 hover:bg-gray-100 rounded"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/semesters"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Semesters
                </Link>
                <Link
                  to="/admin/teachers"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Teachers
                </Link>
                <Link
                  to="/admin/courses"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Courses
                </Link>
                <Link
                  to="/admin/rooms"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Rooms
                </Link>
                <Link
                  to="/admin/batches"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Batches
                </Link>
                <Link
                  to="/admin/routine-builder"
                  className="block py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={closeMobileMenu}
                >
                  Routine Builder
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
