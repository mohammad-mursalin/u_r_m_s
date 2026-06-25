/**
 * Shows conflict warnings as a red badge with tooltip
 * Props: conflicts (array of conflict objects)
 */
import { AlertTriangle } from 'lucide-react'

export default function ConflictBadge({ conflicts }) {
  if (!conflicts || conflicts.length === 0) {
    return null
  }

  const conflictMessages = conflicts.map(c => c.message).join('\n')

  return (
    <div className="group relative inline-flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs border border-red-300">
      <AlertTriangle size={12} />
      <span>{conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}</span>

      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
        <div className="font-bold mb-1">Conflicts detected:</div>
        {conflicts.map((c, i) => (
          <div key={i} className="mb-1">
            <div className="text-red-300">{c.conflict_type}:</div>
            <div className="pl-2">{c.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
