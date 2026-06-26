/**
 * Slot Modal for adding/editing routine slots
 */
import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import {
  getActiveCourses,
  getRooms,
  getTeachers,
  checkConflicts,
  createSlot,
  updateSlot,
  deleteSlot,
} from "../../api/routine";
import { formatDay, formatTime } from "../../utils/formatters";
import { TIME_SLOTS } from "../../utils/constants";
import useToastStore from "../../store/toastStore";

export default function SlotModal({
  isOpen,
  onClose,
  day,
  timeSlot,
  batch,
  existingSlot,
  semesterId,
  onSaved,
  onDeleted,
}) {
  const { showSuccess, showWarning, showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    course: "",
    room: "",
    teacher_ids: [],
    week_type: "all",
    duration: 1,
  });
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (existingSlot) {
        setFormData({
          course: existingSlot.course.id,
          room: existingSlot.room.id,
          teacher_ids: existingSlot.teachers.map((t) => t.id),
          week_type: existingSlot.week_type,
          duration: existingSlot.slot_duration,
        });
      } else {
        setFormData({
          course: "",
          room: "",
          teacher_ids: [],
          week_type: "all",
          duration: 1,
        });
      }
    }
  }, [isOpen, existingSlot, day, timeSlot]);

  const fetchOptions = async () => {
    try {
      const [coursesData, roomsData, teachersData] = await Promise.all([
        getActiveCourses(),
        getRooms(),
        getTeachers(),
      ]);
      setCourses(coursesData);
      setRooms(roomsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error("Failed to fetch options:", err);
    }
  };

  const handleCheckConflicts = async () => {
    if (
      !formData.course ||
      !formData.room ||
      formData.teacher_ids.length === 0
    ) {
      setConflicts([]);
      return;
    }

    setCheckingConflicts(true);
    try {
      const result = await checkConflicts(semesterId, {
        batch: batch.id,
        teacher_ids: formData.teacher_ids,
        room: formData.room,
        time_slot: timeSlot.id,
        day_of_week: day,
        week_type: formData.week_type,
      });
      // Transform conflict object into flat array of conflict messages
      const conflictList = [];
      if (result.conflicts?.teachers?.length) {
        result.conflicts.teachers.forEach(c => conflictList.push(c.message));
      }
      if (result.conflicts?.rooms?.length) {
        result.conflicts.rooms.forEach(c => conflictList.push(c.message));
      }
      if (result.conflicts?.batches?.length) {
        result.conflicts.batches.forEach(c => conflictList.push(c.message));
      }
      setConflicts(conflictList);
    } catch (err) {
      console.error("Failed to check conflicts:", err);
      setConflicts([]);
    } finally {
      setCheckingConflicts(false);
    }
  };

  useEffect(() => {
    if (formData.course && formData.room && formData.teacher_ids.length > 0) {
      handleCheckConflicts();
    } else {
      setConflicts([]);
    }
  }, [
    formData.course,
    formData.room,
    formData.teacher_ids,
    formData.week_type,
    semesterId,
  ]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate required fields
    if (!formData.course || !formData.room || formData.teacher_ids.length === 0) {
      setErrors({ general: 'Please select course, room, and at least one teacher.' });
      setLoading(false);
      return;
    }

    try {
      const slotData = {
        batch: batch.id,
        course: formData.course ? parseInt(formData.course) : null,
        room: formData.room ? parseInt(formData.room) : null,
        time_slot: timeSlot.id,
        day_of_week: day,
        week_type: formData.week_type,
        slot_duration: formData.duration ? parseInt(formData.duration) : 1,
        teacher_ids: formData.teacher_ids
      };

      let successMessage = "Slot saved successfully";
      let conflictWarning = false;

      if (existingSlot) {
        await updateSlot(semesterId, existingSlot.id, slotData);
        successMessage = "Slot updated successfully";
        if (conflicts.length > 0) {
          conflictWarning = true;
          successMessage += " — review highlighted cells for conflicts";
        }
      } else {
        await createSlot(semesterId, slotData);
        successMessage = "Slot added successfully";
        if (conflicts.length > 0) {
          conflictWarning = true;
          successMessage += " — review highlighted cells for conflicts";
        }
      }

      showSuccess(successMessage);
      onSaved();
      onClose();
    } catch (err) {
      showError("Failed to save slot. Please try again.");
      setErrors({
        general: err.message || "Failed to save. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteSlot(semesterId, existingSlot.id);
      showSuccess("Slot removed successfully");
      onDeleted();
      onClose();
    } catch (err) {
      console.error("Failed to delete slot:", err);
      showError("Failed to delete slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <DialogTitle
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900"
                    >
                      {existingSlot
                        ? `Edit Slot — ${formatDay(day).toUpperCase()} — ${timeSlot.label} — ${batch.name}`
                        : `Add Slot — ${formatDay(day).toUpperCase()} — ${timeSlot.label} — ${batch.name}`}
                    </DialogTitle>

                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Day:</span>{" "}
                          {formatDay(day).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Time:</span>{" "}
                          {formatTime(timeSlot.start)} -{" "}
                          {formatTime(timeSlot.end)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Batch:</span>{" "}
                          {batch.name}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course * (required)
                          </label>
                          <select
                            value={formData.course}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                course: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.code} — {course.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room * (required)
                          </label>
                          <select
                            value={formData.room}
                            onChange={(e) =>
                              setFormData({ ...formData, room: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Room</option>
                            {rooms.map((room) => (
                              <option key={room.id} value={room.id}>
                                Room {room.room_number} ({room.room_type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teachers * (required, at least one)
                          </label>
                          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                            {teachers.map((teacher) => (
                              <label
                                key={teacher.id}
                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.teacher_ids.includes(
                                    teacher.id,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        teacher_ids: [
                                          ...formData.teacher_ids,
                                          teacher.id,
                                        ],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        teacher_ids:
                                          formData.teacher_ids.filter(
                                            (id) => id !== teacher.id,
                                          ),
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {teacher.short_code} — {teacher.full_name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Week Type * (required)
                          </label>
                          <div className="flex gap-4">
                            {["all", "odd", "even"].map((type) => (
                              <label key={type} className="flex items-center">
                                <input
                                  type="radio"
                                  name="week_type"
                                  value={type}
                                  checked={formData.week_type === type}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      week_type: e.target.value,
                                    })
                                  }
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 capitalize">
                                  {type === "all"
                                    ? "All Weeks"
                                    : type + " Weeks Only"}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration * (required)
                          </label>
                          <select
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="1">1 slot (theory)</option>
                            <option value="2">2 slots (lab)</option>
                            <option value="3">3 slots (lab)</option>
                          </select>
                        </div>

                        {errors.general && (
                          <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-2 rounded">
                            {errors.general}
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Conflict Preview:
                          </p>
                          {checkingConflicts ? (
                            <div className="flex items-center gap-2 text-blue-600">
                              <Loader2 size={16} className="animate-spin" />
                              <span className="text-sm">
                                Checking conflicts...
                              </span>
                            </div>
                          ) : conflicts.length > 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <AlertTriangle
                                size={16}
                                className="text-red-600 inline mr-2"
                              />
                              <span className="text-sm text-red-700">
                                {conflicts.length} conflict
                                {conflicts.length > 1 ? "s" : ""} detected
                              </span>
                              <div className="mt-2 space-y-1">
                                {conflicts.map((conflict, index) => (
                                  <p
                                    key={index}
                                    className="text-xs text-red-600"
                                  >
                                    {typeof conflict === 'string' ? conflict : conflict.message}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <CheckCircle
                                size={16}
                                className="text-green-600 inline mr-2"
                              />
                              <span className="text-sm text-green-700">
                                ✓ No conflicts detected
                              </span>
                            </div>
                          )}
                        </div>

<div className="flex justify-end gap-3 pt-4">
                          {existingSlot && (
                            <button
                              type="button"
                              onClick={handleDelete}
                              disabled={loading}
                              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete Slot
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                          >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Saving...' : 'Save Slot'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
