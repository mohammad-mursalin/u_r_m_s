/**
 * Admin dashboard showing statistics and quick actions
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, DoorOpen, GraduationCap } from 'lucide-react'
import { getTeachers, getCourses, getRooms, getBatches, getSemesters } from '../../api/routine'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    teachers: 0,
    courses: 0,
    rooms: 0,
    batches: 0,
    activeSemester: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const [teachersData, coursesData, roomsData, batchesData, semestersData] = await Promise.all([
        getTeachers(),
        getCourses(),
        getRooms(),
        getBatches(),
        getSemesters()
      ])

      setStats({
        teachers: teachersData.length || 0,
        courses: coursesData.length || 0,
        rooms: roomsData.length || 0,
        batches: batchesData.length || 0,
        activeSemester: semestersData.find(s => s.is_active) || null
      })
    } catch (err) {
      setError('Failed to load dashboard statistics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const QuickActionCard = ({ title, count, icon: Icon, onClick, color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
    }

    return (
      <div
        onClick={onClick}
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-4"
      >
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={28} />
        </div>
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{count}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    )
  }

  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md h-36 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-12 bg-gray-200 rounded w-full"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            title="Total Courses"
            count={stats.courses}
            icon={BookOpen}
            color="blue"
            onClick={() => navigate('/admin/courses')}
          />
          <QuickActionCard
            title="Total Teachers"
            count={stats.teachers}
            icon={Users}
            color="green"
            onClick={() => navigate('/admin/teachers')}
          />
          <QuickActionCard
            title="Total Rooms"
            count={stats.rooms}
            icon={DoorOpen}
            color="purple"
            onClick={() => navigate('/admin/rooms')}
          />
          <QuickActionCard
            title="Total Batches"
            count={stats.batches}
            icon={GraduationCap}
            color="yellow"
            onClick={() => navigate('/admin/batches')}
          />
        </div>

        {/* Active Semester Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Semester</h2>
          {stats.activeSemester ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  {stats.activeSemester.name}
                </p>
                <p className="text-gray-600">
                  Start Date: {stats.activeSemester.start_date}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  stats.activeSemester.is_published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stats.activeSemester.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/semesters')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                View Semesters
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">No active semester. Go to Semesters to create one.</p>
              <button
                onClick={() => navigate('/admin/semesters')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Create Semester
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/admin/routine-builder')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Open Routine Builder
            </button>
            <button
              onClick={() => navigate('/admin/teachers')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Manage Teachers
            </button>
            <button
              onClick={() => navigate('/admin/courses')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Add Course
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
