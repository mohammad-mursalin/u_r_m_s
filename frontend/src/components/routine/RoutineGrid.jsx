/**
 * The main timetable grid component
 * Props: slots (array), isEditable (bool), onCellClick (func), conflicts (object keyed by slot id)
 */
import { useEffect, useState } from 'react'
import { DAYS_OF_WEEK, TIME_SLOTS, BATCH_COLORS } from '../../utils/constants'
import { formatDay } from '../../utils/formatters'
import { getTeacherCodes } from '../../utils/formatters'
import RoutineCell from './RoutineCell'
import ConflictBadge from './ConflictBadge'

export default function RoutineGrid({ slots, isEditable = false, onCellClick, conflicts = {} }) {
  const [batches, setBatches] = useState([
    'MSc', '13B', '14B', '15B', '16B', '17B'
  ])

  const filteredSlots = slots || []

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="bg-gray-200 p-2 text-xs font-semibold text-gray-700 min-w-[80px]">
              Day | Batch
            </th>
            {TIME_SLOTS.map((ts, index) => (
              <th
                key={index}
                className={`bg-gray-200 p-2 text-xs font-semibold min-w-[100px] ${
                  ts.isBreak ? 'bg-gray-300 text-gray-600' : ''
                }`}
              >
                {ts.label || ts.start_time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            return (
              <React.Fragment key={day}>
                <tr>
                  <td
                    colSpan={TIME_SLOTS.length}
                    className={`bg-gray-700 text-white p-2 text-sm font-bold ${
                      dayIndex === 0 ? 'border-b-4 border-gray-900' : ''
                    }`}
                  >
                    {formatDay(day).toUpperCase()}
                  </td>
                </tr>
                {batches.map(batchName => {
                  const breakCell = TIME_SLOTS.find(ts => ts.isBreak)
                  return (
                    <React.Fragment key={batchName}>
                      <tr>
                        <td className="bg-gray-100 p-2 text-sm font-semibold text-gray-700 border-r-2 border-gray-300">
                          {batchName}
                        </td>
                        {TIME_SLOTS.map((ts, tsIndex) => {
                          if (ts.isBreak) {
                            return (
                              <td
                                key={tsIndex}
                                colSpan={batches.length}
                                className="bg-gray-200 text-gray-600 text-sm p-2 text-center italic border-b-2 border-gray-300"
                              >
                                Prayer & Lunch Break
                              </td>
                            )
                          }

                          const matchedSlot = filteredSlots.find(slot =>
                            slot.day === day &&
                            slot.time_slot.id === ts.id &&
                            slot.batch.name === batchName
                          )

                          const slotId = matchedSlot?.id

                          return (
                            <td
                              key={tsIndex}
                              className="border-r border-gray-200 border-b border-gray-200 p-1 min-w-[100px]"
                            >
                              {matchedSlot ? (
                                <RoutineCell
                                  slot={matchedSlot}
                                  isEditable={isEditable}
                                  onClick={() => onCellClick(day, ts, batchName, matchedSlot)}
                                  hasConflict={conflicts[slotId]?.length > 0}
                                />
                              ) : (
                                <RoutineCell
                                  slot={null}
                                  isEditable={isEditable}
                                  onClick={() => onCellClick(day, ts, batchName, null)}
                                  hasConflict={false}
                                />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
