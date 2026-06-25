/**
 * Renders one cell in the timetable grid
 * Props: slot (object|null), isEditable (bool), onClick (func), hasConflict (bool)
 */
import { formatDay } from '../../utils/formatters'
import { getBatchColor, getTeacherCodes } from '../../utils/formatters'

export default function RoutineCell({ slot, isEditable, onClick, hasConflict }) {
  if (!slot) {
    return (
      <div className="h-full w-full bg-gray-100 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-200 transition cursor-pointer">
        <span className="text-gray-400 text-xs">+</span>
      </div>
    )
  }

  const batchName = slot.batch.name
  const teacherCodes = getTeacherCodes(slot.teachers)
  const courseCode = slot.course.code

  return (
    <div
      onClick={() => onClick(slot)}
      className={`h-full w-full p-1 rounded border-2 ${getBatchColor(batchName)} ${
        hasConflict ? 'border-red-500' : 'border-opacity-20'
      } ${isEditable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
    >
      <div className="h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="font-bold text-xs leading-tight">{courseCode}</span>
          {slot.week_type !== 'all' && (
            <span className={`text-[10px] px-1 rounded ${slot.week_type === 'odd' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
              {slot.week_type.toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-[10px] leading-tight mb-1">{teacherCodes}</div>
        <div className="text-[10px] font-semibold text-gray-600">[{slot.room.room_number}]</div>
      </div>
    </div>
  )
}
