/**
 * Teachers management page
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import AddEditModal from '../../components/ui/AddEditModal'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../api/routine'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useToastStore from '../../store/toastStore'

export default function TeachersPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToastStore()
  const [teachers, setTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const fields = [
    { name: 'short_code', label: 'Short Code', type: 'text', required: true, max: 10 },
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' }
  ]

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    filterTeachers()
  }, [searchTerm, teachers])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const data = await getTeachers()
      setTeachers(data)
    } catch (err) {
      console.error('Failed to fetch teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterTeachers = () => {
    if (searchTerm.trim() === '') {
      setFilteredTeachers(teachers)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredTeachers(teachers.filter(t =>
        t.full_name?.toLowerCase().includes(term) ||
        t.short_code?.toLowerCase().includes(term)
      ))
    }
  }

  const handleAdd = () => {
    setEditingTeacher(null)
    setModalOpen(true)
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    setModalOpen(true)
  }

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.short_code}?`)) {
      return
    }

    try {
      await deleteTeacher(teacher.id)
      fetchTeachers()
      showSuccess(`Teacher ${teacher.short_code} deleted successfully`)
    } catch (err) {
      console.error('Failed to delete teacher:', err)
      showError('Failed to delete teacher. Please try again.')
    }
  }

  const handleSave = async (data) => {
    setModalLoading(true)
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, data)
        showSuccess('Teacher updated successfully')
      } else {
        await createTeacher(data)
        showSuccess(`Teacher ${data.short_code} created successfully`)
      }
      setModalOpen(false)
      fetchTeachers()
    } catch (err) {
      showError('Failed to save teacher. Please try again.')
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Teachers</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Teacher
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading teachers..." />
        ) : filteredTeachers.length === 0 ? (
          <EmptyState
            message="No teachers found. Click 'Add Teacher' to create one."
            actionLabel="Add Teacher"
            onAction={handleAdd}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.short_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {teacher.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {teacher.designation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {teacher.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
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
            title={editingTeacher ? `Edit Teacher — ${editingTeacher.short_code}` : 'Add Teacher'}
            fields={fields}
            initialData={editingTeacher}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  )
}
