/**
 * Teacher schedule page showing a specific teacher's timetable
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { getTeacherSchedule } from '../api/routine'
import RoutineGrid from '../components/routine/RoutineGrid'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function TeacherSchedulePage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSchedule()
  }, [code])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTeacherSchedule(code)

      if (data.slots && data.slots.length > 0) {
        setSlots(data.slots)
      } else {
        setError(`No schedule found for ${code}.`)
      }
    } catch (err) {
      setError(`Could not connect to the server. Please check your connection.`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (day, timeSlot, batch, slot) => {
    console.log('Cell clicked:', { day, timeSlot, batch, slot })
  }

  if (loading) {
    return <LoadingSpinner message="Loading schedule..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center max-w-md">
          <CalendarDays size={48} className="text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No Schedule Published
          </h3>
          <p className="text-gray-500 text-sm">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Full Routine
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Schedule — {code}
              </h1>
              <p className="text-gray-600 mt-1">Pabna University of Science and Technology</p>
            </div>
            <div className="flex gap-4">
              <a
                href={`/api/v1/export/routine/pdf/?teacher=${code}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Download PDF
              </a>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                ← Back to Full Routine
              </button>
            </div>
          </div>
        </div>

        <RoutineGrid slots={slots} isEditable={false} onCellClick={handleCellClick} />
      </div>
    </div>
  )
}
