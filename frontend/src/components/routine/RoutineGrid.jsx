/**

 * The main timetable grid component
 * Props: slots (array), isEditable (bool), onCellClick (func), conflicts (object keyed by slot id)
 */
import { useState, Fragment } from "react";
import { DAYS_OF_WEEK, TIME_SLOTS, BATCH_COLORS } from "../../utils/constants";
import { formatDay } from "../../utils/formatters";
import { getTeacherCodes } from "../../utils/formatters";
import RoutineCell from "./RoutineCell";
import ConflictBadge from "./ConflictBadge";

export default function RoutineGrid({
  slots,
  isEditable = false,
  onCellClick,
  conflicts = {},
  batches = [],
}) {
  const batchList =
    batches.length > 0 ? batches : ["MSc", "13B", "14B", "15B", "16B", "17B"];

  const filteredSlots = slots || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-2 border-gray-400">
        <colgroup>
          <col style={{ width: "120px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="bg-gray-200 p-2 text-xs font-semibold text-gray-700 min-w-[80px] border-2 border-gray-400">
              Day | Batch
            </th>
            {TIME_SLOTS.map((ts, index) => (
              <th
                key={index}
                className={`bg-gray-200 p-2 text-xs font-semibold min-w-[100px] border-2 border-gray-400 ${
                  ts.isBreak ? "bg-gray-300 text-gray-600" : ""
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
              <Fragment key={day}>
                <tr>
                  <td
                    colSpan={TIME_SLOTS.length + 1}
                    className={`bg-gray-700 text-white p-2 text-sm font-bold border-b-2 border-gray-500`}
                  >
                    {formatDay(day).toUpperCase()}
                  </td>
                </tr>
                {batchList.map((batch, batchIndex) => {
                  const batchName =
                    typeof batch === "string" ? batch : batch.name;
                  const batchId = typeof batch === "object" ? batch.id : null;
                  return (
                    <Fragment key={batchName}>
                      <tr>
                        <td className="bg-gray-100 p-2 text-sm font-semibold text-gray-700 border-2 border-gray-400">
                          {batchName}
                        </td>
                        {TIME_SLOTS.map((ts, tsIndex) => {
                          if (ts.isBreak) {
                            if (batchIndex === 0) {
                              return (
                                <td
                                  key={tsIndex}
                                  rowSpan={batchList.length}
                                  className="bg-gray-200 text-gray-600 text-sm p-2 text-center italic border-2 border-gray-400"
                                >
                                  Prayer & Lunch Break
                                </td>
                              );
                            }
                            return null;
                          }

                          // Find ALL matching slots for this cell (ODD + EVEN)
                          const matchedSlots = filteredSlots.filter(
                            (slot) =>
                              slot.day === day &&
                              slot.time_slot.id === ts.id &&
                              slot.batch.name === batchName,
                          );

                          const slotIds = matchedSlots.map((s) => s.id);
                          const hasConflict = slotIds.some(
                            (id) => conflicts[id]?.length > 0,
                          );

                          return (
                            <td
                              key={tsIndex}
                              className="border-2 border-gray-300 p-1 min-w-[100px]"
                            >
                              <RoutineCell
                                slots={matchedSlots}
                                isEditable={isEditable}
                                onClick={({
                                  slot,
                                  suggestedWeekType,
                                  prefillSlot,
                                }) =>
                                  onCellClick(
                                    day,
                                    ts,
                                    { id: batchId, name: batchName },
                                    slot,
                                    suggestedWeekType,
                                    prefillSlot,
                                  )
                                }
                                hasConflict={hasConflict}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
