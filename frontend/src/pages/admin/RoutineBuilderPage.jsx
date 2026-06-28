/**
 * Routine Builder Page - Most complex page in the app
 */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  getSemesters,
  getSemesterSlots,
  publishSemester,
  unpublishSemester,
  cloneSemester,
  getBatches,
  checkConflicts as checkConflictsApi,
} from "../../api/routine";
import RoutineGrid from "../../components/routine/RoutineGrid";
import SlotModal from "../../components/routine/SlotModal";
import { DAYS_OF_WEEK, TIME_SLOTS, BATCH_COLORS } from "../../utils/constants";
import { formatDay } from "../../utils/formatters";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import useToastStore from "../../store/toastStore";

export default function RoutineBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showWarning, showError } = useToastStore();
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [slots, setSlots] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAllConflicts, setCheckingAllConflicts] = useState(false);
  const [conflicts, setConflicts] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchSemesters();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSlots();
    }
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);

      const semesterId = searchParams.get("semester");
      if (semesterId) {
        const found = data.find((s) => s.id === parseInt(semesterId));
        if (found) {
          setSelectedSemester(found);
        }
      } else {
        const active = data.find((s) => s.is_active);
        if (active) {
          setSelectedSemester(active);
        }
      }
      if (selectedSemester) {
        const updated = data.find((s) => s.id === selectedSemester.id);
        if (updated) setSelectedSemester(updated);
      }
    } catch (err) {
      console.error("Failed to fetch semesters:", err);
      showError("Failed to load semesters. Please refresh the page.");
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getBatches();
      setBatches(data);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await getSemesterSlots(selectedSemester.id);
      setSlots(data);
      setConflicts({});
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      showError("Failed to load slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    navigate(`/admin/routine-builder?semester=${semester.id}`);
  };

  const handlePublish = async () => {
    try {
      await publishSemester(selectedSemester.id);
      await fetchSemesters();
      showSuccess(`Routine is now published for ${selectedSemester.name}`);
    } catch (err) {
      console.error("Failed to publish semester:", err);
      showError("Failed to publish semester. Please try again.");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishSemester(selectedSemester.id);
      await fetchSemesters();
      showWarning("Routine hidden from public view");
    } catch (err) {
      console.error("Failed to unpublish semester:", err);
      showError("Failed to unpublish semester. Please try again.");
    }
  };

  const handleCheckAllConflicts = async () => {
    if (!selectedSemester) return;

    setCheckingAllConflicts(true);
    const newConflicts = {};

    for (const slot of slots) {
      try {
        const result = await checkConflictsApi(selectedSemester.id, {
          batch: slot.batch.id,
          room: slot.room.id,
          time_slot: slot.time_slot.id,
          day_of_week: slot.day,
          week_type: slot.week_type,
          teacher_ids: slot.teachers.map((t) => t.id),
        });

        if (result.conflicts && result.conflicts.length > 0) {
          newConflicts[slot.id] = result.conflicts;
        }
      } catch (err) {
        console.error(`Failed to check conflicts for slot ${slot.id}:`, err);
      }
    }

    setConflicts(newConflicts);
    setCheckingAllConflicts(false);
  };

  const handleCellClick = (day, timeSlot, batch, clickedSlot, suggestedWeekType = null) => {
    setModalData({ day, timeSlot, batch, slot: clickedSlot, suggestedWeekType })
    setModalOpen(true)
  }

  const handleSlotSaved = () => {
    fetchSlots();
  };

  const handleSlotDeleted = () => {
    fetchSlots();
  };

  const totalConflicts = Object.values(conflicts).flat().length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Routine Builder
            </h1>
            {selectedSemester && (
              <p className="text-gray-600 mt-1">
                Editing: {selectedSemester.name}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCheckAllConflicts}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
              disabled={checkingAllConflicts}
            >
              <RefreshCw
                size={16}
                className={checkingAllConflicts ? "animate-spin" : ""}
              />
              Check All Conflicts
            </button>
            {selectedSemester && !selectedSemester.is_published && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <CheckCircle size={16} />
                Publish
              </button>
            )}
            {selectedSemester && selectedSemester.is_published && (
              <button
                onClick={handleUnpublish}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                Unpublish
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Semester:</label>
          <select
            value={selectedSemester?.id || ""}
            onChange={(e) =>
              handleSemesterChange(
                semesters.find((s) => s.id === parseInt(e.target.value)),
              )
            }
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
                {semester.is_active &&
                  semester.is_published &&
                  " (Active & Published)"}
                {semester.is_active &&
                  !semester.is_published &&
                  " (Active Draft)"}
                {!semester.is_active && " (Archived)"}
              </option>
            ))}
          </select>

          {totalConflicts > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              <span>
                {totalConflicts} conflict{totalConflicts > 1 ? "s" : ""}{" "}
                detected
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading routine..." />
        ) : (
          <RoutineGrid
            slots={slots}
            isEditable={true}
            onCellClick={handleCellClick}
            conflicts={conflicts}
            batches={batches}
          />
        )}

        {modalOpen && modalData && (
          <SlotModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSaved={handleSlotSaved}
            onDeleted={handleSlotDeleted}
            day={modalData.day}
            timeSlot={modalData.timeSlot}
            batch={modalData.batch}
            existingSlot={modalData.slot}
            semesterId={selectedSemester.id}
            suggestedWeekType={modalData.suggestedWeekType}
          />
        )}
      </div>
    </div>
  );
}