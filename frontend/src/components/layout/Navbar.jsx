import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuthStore()
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

      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-600">
            {user?.username || 'Admin'}
          </span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-800">
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
            {isLoggedIn && (
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