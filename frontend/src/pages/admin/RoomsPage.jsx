/**
 * Rooms management page
 */
import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import AddEditModal from '../../components/ui/AddEditModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import useToastStore from '../../store/toastStore'
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../api/routine'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { showSuccess, showError } = useToastStore()

  const fields = [
    { name: 'room_number', label: 'Room Number', type: 'text', required: true },
    { name: 'room_type', label: 'Type', type: 'select', required: true, options: ['classroom', 'lab'] },
    { name: 'capacity', label: 'Capacity', type: 'number', required: false }
  ]

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    filterRooms()
  }, [searchTerm, rooms])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await getRooms()
      setRooms(data)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
      showError('Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  const filterRooms = () => {
    if (searchTerm.trim() === '') {
      setFilteredRooms(rooms)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredRooms(rooms.filter(r =>
        r.room_number?.toLowerCase().includes(term) ||
        r.room_type?.toLowerCase().includes(term)
      ))
    }
  }

  const handleAdd = () => {
    setEditingRoom(null)
    setModalOpen(true)
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setModalOpen(true)
  }

  const handleDelete = async (room) => {
    if (!window.confirm(`Are you sure you want to delete room ${room.room_number}?`)) {
      return
    }

    try {
      await deleteRoom(room.id)
      fetchRooms()
      showSuccess(`Room ${room.room_number} deleted successfully`)
    } catch (err) {
      console.error('Failed to delete room:', err)
      showError('Failed to delete room')
    }
  }

  const handleSave = async (data) => {
    setModalLoading(true)
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data)
      } else {
        await createRoom(data)
      }
      setModalOpen(false)
      fetchRooms()
      showSuccess(editingRoom ? 'Room updated successfully' : 'Room created successfully')
    } catch (err) {
      showError(editingRoom ? 'Failed to update room' : 'Failed to create room')
      throw err
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add Room
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by room number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredRooms.length === 0 ? (
          <EmptyState
            message="No rooms found. Click 'Add Room' to create one."
            actionLabel="Add Room"
            onAction={handleAdd}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map(room => (
                  <tr key={room.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.room_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.room_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.capacity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
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
            title={editingRoom ? `Edit Room — ${editingRoom.room_number}` : 'Add Room'}
            fields={fields}
            initialData={editingRoom}
            loading={modalLoading}
          />
        )}
      </div>
    </div>
  )
}
