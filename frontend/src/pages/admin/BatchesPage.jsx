/**
 * Batches management page
 */
import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import AddEditModal from '../../components/ui/AddEditModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useToastStore from '../../store/toastStore'
import { getBatches, createBatch, updateBatch, deleteBatch } from '../../api/routine'

export default function BatchesPage() {
  const [batches, setBatches] = useState([])
  const [filteredBatches, setFilteredBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { showSuccess, showError } = useToastStore()

  const fields = [
    { name: 'name', label: 'Batch Name', type: 'text', required: true },
    { name: 'session', label: 'Session', type: 'text', required: true },
    { name: 'program', label: 'Program', type: 'select', required: true, options: ['BSc', 'MSc'] },
    { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
    { name: 'year_of_study', label: 'Year of Study', type: 'number', required: false }
  ]

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    filterBatches()
  }, [searchTerm, batches])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const data = await getBatches()
      setBatches(data)
    } catch (err) {
      console.error('Failed to fetch batches:', err)
      showError('Failed to fetch batches')
    } finally {
      setLoading(false)
    }
  }

  const filterBatches = () => {
    if (searchTerm.trim() === '') {
      setFilteredBatches(batches)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredBatches(batches.filter(b =>
        b.name?.toLowerCase().includes(term) ||
        b.session?.toLowerCase().includes(term)
      ))
    }
  }

  const handleAdd = () => {
    setEditingBatch(null)
    setModalOpen(true)
  }

  const handleEdit = (batch) => {
    setEditingBatch(batch)
    setModalOpen(true)
  }

  const handleDelete = async (batch) => {
    if (!window.confirm(`Are you sure you want to delete batch ${batch.name}?`)) {
      return
    }

    try {
      await deleteBatch(batch.id)
      fetchBatches()
      showSuccess(`Batch ${batch.name} deleted successfully`)
    } catch (err) {
      console.error('Failed to delete batch:', err)
      showError('Failed to delete batch')
    }
  }

  const handleSave = async (data) => {
    setModalLoading(true)
    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, data)
      } else {
        await createBatch(data)
      }
      setModalOpen(false)
      fetchBatches()
      showSuccess(editingBatch ? 'Batch updated successfully' : 'Batch created successfully')
    } catch (err) {
      showError(editingBatch ? 'Failed to update batch' : 'Failed to create batch')
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Batches</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Batch
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredBatches.length === 0 ? (
          <EmptyState
            message="No batches found. Click 'Add Batch' to create one."
            actionLabel="Add Batch"
            onAction={handleAdd}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.map(batch => (
                  <tr key={batch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {batch.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {batch.session}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {batch.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {batch.effective_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(batch)}
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
            title={editingBatch ? `Edit Batch — ${editingBatch.name}` : 'Add Batch'}
            fields={fields}
            initialData={editingBatch}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  )
}
