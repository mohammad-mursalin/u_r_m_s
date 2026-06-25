/**
 * Courses management page
 */
import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import AddEditModal from '../../components/ui/AddEditModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useToastStore from '../../store/toastStore'
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/routine'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { showSuccess, showError } = useToastStore()

  const fields = [
    { name: 'code', label: 'Course Code', type: 'text', required: true },
    { name: 'name', label: 'Course Name', type: 'text', required: true },
    { name: 'credit_hours', label: 'Credit Hours', type: 'number', required: true, min: 0.5, max: 6, step: 0.5 },
    { name: 'course_type', label: 'Type', type: 'select', required: true, options: ['theory', 'lab'] }
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, courses])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      console.error('Failed to fetch courses:', err)
      showError('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredCourses(courses.filter(c =>
        c.code?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term)
      ))
    }
  }

  const handleAdd = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setModalOpen(true)
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete ${course.code}?`)) {
      return
    }

    try {
      await deleteCourse(course.id)
      fetchCourses()
      showSuccess(`Course ${course.code} deleted successfully`)
    } catch (err) {
      console.error('Failed to delete course:', err)
      showError('Failed to delete course')
    }
  }

  const handleSave = async (data) => {
    setModalLoading(true)
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, data)
      } else {
        await createCourse(data)
      }
      setModalOpen(false)
      fetchCourses()
      showSuccess(editingCourse ? 'Course updated successfully' : 'Course created successfully')
    } catch (err) {
      showError(editingCourse ? 'Failed to update course' : 'Failed to create course')
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            message="No courses found. Click 'Add Course' to create one."
            actionLabel="Add Course"
            onAction={handleAdd}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map(course => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.credit_hours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {course.course_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <AddEditModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            title={editingCourse ? `Edit Course — ${editingCourse.code}` : 'Add Course'}
            fields={fields}
            initialData={editingCourse}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  )
}
