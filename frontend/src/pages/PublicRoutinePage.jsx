/**
 * Public routine page showing the full department timetable
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveRoutine } from '../api/routine'
import RoutineGrid from '../components/routine/RoutineGrid'
import RoutineFilterPanel from '../components/filters/RoutineFilterPanel'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { AlertCircle, CalendarDays, Search } from 'lucide-react'

export default function PublicRoutinePage() {
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [originalSlots, setOriginalSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [semesterInfo, setSemesterInfo] = useState(null)
  const [batches, setBatches] = useState([])
  const [teachers, setTeachers] = useState([])
  const [filters, setFilters] = useState({ batch: 'All', teacher: 'All', day: 'All' })

  useEffect(() => {
    fetchRoutine()
  }, [])

  const fetchRoutine = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActiveRoutine()

      if (data.semester) {
        setSemesterInfo(data.semester)
      }

      if (data.slots && data.slots.length > 0) {
        setSlots(data.slots)
        setOriginalSlots(data.slots)
        setBatches([...new Set(data.slots.map(s => s.batch.name))])
        setTeachers([...new Map(data.slots.flatMap(s => s.teachers).map(t => [t.short_code, t])).values()])
      }
    } catch (err) {
      setError('Could not connect to the server. Please check your connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    // Filter from original slots, not filtered slots
    let filtered = originalSlots
    if (newFilters.batch !== 'All') {
      filtered = filtered.filter(slot => slot.batch.name === newFilters.batch)
    }
    if (newFilters.teacher !== 'All') {
      filtered = filtered.filter(slot => slot.teachers.some(t => t.short_code === newFilters.teacher))
    }
    if (newFilters.day !== 'All') {
      filtered = filtered.filter(slot => slot.day === newFilters.day)
    }
    setSlots(filtered)
  }

  const handleCellClick = (day, timeSlot, batch, slot) => {
    // This is for admin view - not used in public view
    console.log('Cell clicked:', { day, timeSlot, batch, slot })
  }

  if (loading) {
    return <LoadingSpinner message="Loading routine..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-1">
            Failed to load routine
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Could not connect to the server. Please check your connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (slots.length === 0 && originalSlots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center max-w-md">
          <CalendarDays size={48} className="text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Routine Published Yet
          </h3>
          <p className="text-gray-500 text-sm">
            The class routine for this semester has not been published yet.
            Please check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Department of Information and Communication Engineering
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">
            Pabna University of Science and Technology
          </h2>
          {semesterInfo && (
            <div className="mt-4">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Class Routine — {semesterInfo.name}</span>
              </p>
              <p className="text-gray-600">
                Effective from: {semesterInfo.start_date}
              </p>
            </div>
          )}
        </div>

        <RoutineFilterPanel
          batches={batches}
          teachers={teachers}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          {slots.length > 0 ? (
            <RoutineGrid
              slots={slots}
              isEditable={false}
              batches={batches}
              onCellClick={handleCellClick}
            />
          ) : originalSlots.length > 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Search size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">
                No classes found
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                No slots match your current filters.
              </p>
              <button
                onClick={() => handleFilterChange({ batch: 'All', teacher: 'All', day: 'All' })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : null}
        </div>

        {teachers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Teacher Legend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {teachers.map(teacher => (
                <div key={teacher.id} className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-gray-800 min-w-[40px]">
                    {teacher.short_code}
                  </span>
                  <span className="text-gray-500">—</span>
                  <span className="text-gray-600">{teacher.full_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
