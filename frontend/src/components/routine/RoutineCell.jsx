/**
 * Renders one cell in the timetable grid
 * Props: slots (array), isEditable (bool), onClick (func), hasConflict (bool)
 */
import { formatDay } from '../../utils/formatters'
import { getBatchColor, getTeacherCodes } from '../../utils/formatters'
import { BATCH_COLORS } from '../../utils/constants'

const DEFAULT_BATCH_COLOR = 'bg-gray-100 text-gray-800 border-gray-300'

export default function RoutineCell({ slots = [], isEditable, onClick, hasConflict }) {
  const slotCount = slots.length

  if (slotCount === 0) {
    return (
      <div onClick={() => onClick({ slot: null })} className="h-full w-full bg-gray-100 border border-gray-200 rounded flex items-center justify-center hover:bg-gray-200 transition cursor-pointer">
        <span className="text-gray-400 text-xs">+</span>
      </div>
    )
  }

  if (slotCount === 1 && slots[0].week_type === 'all') {
    const slot = slots[0]
    const batchName = slot.batch.name
    const teacherCodes = getTeacherCodes(slot.teachers)
    const courseCode = slot.course.code

    return (
      <div
        onClick={() => onClick({ slot })}
        className={`h-full w-full p-1 rounded border-2 ${getBatchColor(batchName)} ${
          hasConflict ? 'border-red-500' : 'border-opacity-20'
        } ${isEditable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      >
        <div className="h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-bold text-xs leading-tight">{courseCode}</span>
          </div>
          <div className="text-[10px] leading-tight mb-1">{teacherCodes}</div>
          <div className="text-[10px] font-semibold text-gray-600">[{slot.room.room_number}]</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 h-full">
      {slots.map(slot => {
        const batchName = slot.batch?.name
        const teacherCodes = slot.teachers ? getTeacherCodes(slot.teachers) : ''
        const courseCode = slot.course?.code
        return (
          <div
            key={slot.id}
            onClick={(e) => { e.stopPropagation(); onClick({ slot }) }}
            className={`flex-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 border-2 ${getBatchColor(batchName) || DEFAULT_BATCH_COLOR} ${
              hasConflict ? 'border-red-500' : 'border-opacity-20'
            }`}
          >
            <div className="font-bold text-xs leading-tight">{courseCode}</div>
            <div className="text-[9px] leading-tight">{teacherCodes}</div>
            <div className="text-[9px] font-semibold text-gray-600">[{slot.room?.room_number}]</div>
            <span className={`text-[8px] font-bold ${slot.week_type === 'odd' ? 'text-purple-600' : 'text-green-600'}`}>
              {slot.week_type.toUpperCase()}
            </span>
          </div>
        )
      })}
      {slotCount === 1 && isEditable && (
        <div
          onClick={(e) => { 
            e.stopPropagation()
            onClick({ slot: null, suggestedWeekType: slots[0].week_type === 'odd' ? 'even' : 'odd' })
          }}
          className="flex-1 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 hover:border-gray-400 cursor-pointer text-xs"
        >
          + {slots[0].week_type === 'odd' ? 'EVEN' : 'ODD'}
        </div>
      )}
    </div>
  )
}