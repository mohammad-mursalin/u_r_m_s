/**
 * Semesters management page with actions
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Edit, ExternalLink, CheckCircle, AlertCircle, Trash2, Clock, Plus } from 'lucide-react'
import AddEditModal from '../../components/ui/AddEditModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useToastStore from '../../store/toastStore'
import { getSemesters, createSemester, updateSemester, activateSemester, publishSemester, unpublishSemester, cloneSemester } from '../../api/routine'

export default function SemestersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [semesters, setSemesters] = useState([])
  const [filteredSemesters, setFilteredSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [cloneSemesterId, setCloneSemesterId] = useState(null)
  const [showCloning, setShowCloning] = useState(false)
  const { showSuccess, showError } = useToastStore()

  const fields = [
    { name: 'name', label: 'Semester Name', type: 'text', required: true },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date' }
  ]

  useEffect(() => {
    fetchSemesters()
  }, [])

  useEffect(() => {
    filterSemesters()
  }, [searchTerm, semesters])

  const fetchSemesters = async () => {
    try {
      setLoading(true)
      const data = await getSemesters()
      setSemesters(data)
    } catch (err) {
      console.error('Failed to fetch semesters:', err)
      showError('Failed to fetch semesters')
    } finally {
      setLoading(false)
    }
  }

  const filterSemesters = () => {
    if (searchTerm.trim() === '') {
      setFilteredSemesters(semesters)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredSemesters(semesters.filter(s =>
        s.name?.toLowerCase().includes(term)
      ))
    }
  }

  const handleAdd = () => {
    setEditingSemester(null)
    setModalOpen(true)
  }

  const handleEdit = (semester) => {
    setEditingSemester(semester)
    setModalOpen(true)
  }

  const handleActivate = async (id) => {
    if (!window.confirm('Are you sure you want to activate this semester? All other semesters will be deactivated.')) {
      return
    }

    try {
      await activateSemester(id)
      fetchSemesters()
      showSuccess('Semester activated successfully')
    } catch (err) {
      console.error('Failed to activate semester:', err)
      showError('Failed to activate semester')
    }
  }

  const handlePublish = async (id) => {
    try {
      await publishSemester(id)
      fetchSemesters()
      showSuccess('Semester published successfully')
    } catch (err) {
      console.error('Failed to publish semester:', err)
      showError('Failed to publish semester')
    }
  }

  const handleUnpublish = async (id) => {
    try {
      await unpublishSemester(id)
      fetchSemesters()
      showSuccess('Semester unpublished successfully')
    } catch (err) {
      console.error('Failed to unpublish semester:', err)
      showError('Failed to unpublish semester')
    }
  }

  const handleClone = (semester) => {
    setCloneSemesterId(semester.id)
    setShowCloning(true)
  }

  const handleCloneConfirm = async (newName) => {
    try {
      await cloneSemester(cloneSemesterId, newName)
      setShowCloning(false)
      setCloneSemesterId(null)
      fetchSemesters()
      showSuccess(`Semester cloned successfully as ${newName}`)
    } catch (err) {
      console.error('Failed to clone semester:', err)
      showError('Failed to clone semester')
    }
  }

  const handleOpenBuilder = (semester) => {
    navigate(`/admin/routine-builder?semester=${semester.id}`)
  }

  const handleSave = async (data) => {
    setModalLoading(true)
    try {
      if (editingSemester) {
        await updateSemester(editingSemester.id, data)
      } else {
        await createSemester(data)
      }
      setModalOpen(false)
      fetchSemesters()
      showSuccess(editingSemester ? 'Semester updated successfully' : 'Semester created successfully')
    } catch (err) {
      showError(editingSemester ? 'Failed to update semester' : 'Failed to create semester')
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  const getStatusBadge = (semester) => {
    if (semester.is_active && semester.is_published) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Active & Published
        </span>
      )
    } else if (semester.is_active) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" />
          Active (Draft)
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle size={12} className="mr-1" />
          Archived
        </span>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Semesters</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Semester
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredSemesters.length === 0 ? (
          <EmptyState
            message="No semesters found."
            actionLabel="Add Semester"
            onAction={() => handleEdit({ name: '', start_date: '', end_date: '' })}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSemesters.map(semester => (
                  <tr key={semester.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {semester.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {semester.start_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(semester)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(semester)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      {semester.is_active ? (
                        <button
                          onClick={() => handlePublish(semester.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(semester.id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleUnpublish(semester.id)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                      >
                        <AlertCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleClone(semester)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenBuilder(semester)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
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
            title={editingSemester ? `Edit Semester — ${editingSemester.name}` : 'Add Semester'}
            fields={fields}
            initialData={editingSemester}
            loading={modalLoading}
          />
        )}

        {showCloning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-bold mb-4">Clone Semester</h3>
              <input
                type="text"
                placeholder="New semester name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
                onChange={(e) => handleCloneConfirm(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCloning(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCloneConfirm('New Semester')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clone
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
