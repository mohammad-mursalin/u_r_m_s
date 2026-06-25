import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/routine-builder', label: 'Routine Builder' },
    { path: '/admin/teachers', label: 'Teachers' },
    { path: '/admin/courses', label: 'Courses' },
    { path: '/admin/rooms', label: 'Rooms' },
    { path: '/admin/batches', label: 'Batches' },
    { path: '/admin/semesters', label: 'Semesters' }
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden md:block" onClick={() => setIsOpen(false)} />

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 text-xl font-bold">
          Admin Panel
        </div>
        <nav className="mt-4 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-6 py-3 transition ${
                  isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => {
                  setIsOpen(false)
                  navigate(item.path)
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-300 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>
        )}
      </aside>
    </>
  )
}
