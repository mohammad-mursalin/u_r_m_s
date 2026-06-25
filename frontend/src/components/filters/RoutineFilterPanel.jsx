/**
 * Filter dropdowns for batch, teacher, day
 * Props: batches (array), teachers (array), onFilterChange (func), currentFilters (object)
 */
import { useEffect, useState } from 'react'
import { Filter, X, Download } from 'lucide-react'

export default function RoutineFilterPanel({ batches, teachers, onFilterChange, currentFilters = {} }) {
  const [filters, setFilters] = useState({
    batch: currentFilters.batch || 'All',
    teacher: currentFilters.teacher || 'All',
    day: currentFilters.day || 'All'
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({ batch: 'All', teacher: 'All', day: 'All' })
    onFilterChange({ batch: 'All', teacher: 'All', day: 'All' })
  }

  const handleDownloadPDF = () => {
    let url = '/api/v1/export/routine/pdf/'
    const params = new URLSearchParams()

    if (filters.batch !== 'All') {
      params.append('batch', filters.batch)
    }
    if (filters.teacher !== 'All') {
      params.append('teacher', filters.teacher)
    }
    if (filters.day !== 'All') {
      params.append('day', filters.day)
    }

    if (params.toString()) {
      url += '?' + params.toString()
    }

    window.open(url, '_blank')
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="font-semibold text-gray-700">Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.batch}
            onChange={(e) => handleFilterChange('batch', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Batches</option>
            {batches.filter(b => b !== 'All').map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.teacher}
            onChange={(e) => handleFilterChange('teacher', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Teachers</option>
            {teachers.filter(t => t !== 'All').map(teacher => (
              <option key={teacher.short_code} value={teacher.short_code}>{teacher.full_name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filters.day}
            onChange={(e) => handleFilterChange('day', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Days</option>
            {['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'].map(day => (
              <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex-1"></div>

        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition"
        >
          <X size={14} />
          Clear Filters
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>
    </div>
  )
}
