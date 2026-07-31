import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ManageAvailability = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Always has all 7 day keys present so rendering doesn't need to guess —
  // days simply have an empty slots array when the doctor isn't available.
  const [scheduleMap, setScheduleMap] = useState(
    Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, []]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get("/availability/me", authHeaders);
        const map = Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, []]));
        (res.data?.schedule || []).forEach((entry) => {
          map[entry.day] = entry.slots || [];
        });
        setScheduleMap(map);
      } catch (err) {
        console.error(err);
        setError("Failed to load availability.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSlot = (day) => {
    setScheduleMap((prev) => ({
      ...prev,
      [day]: [...prev[day], { startTime: "", endTime: "" }],
    }));
    setSavedMessage("");
    setSaved(false);
  };

  const updateSlot = (day, index, field, value) => {
    setScheduleMap((prev) => ({
      ...prev,
      [day]: prev[day].map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
    setSavedMessage("");
    setSaved(false);
  };

  const removeSlot = (day, index) => {
    setScheduleMap((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
    setSavedMessage("");
    setSaved(false);
  };

  const handleSave = async () => {
    const hasIncomplete = DAYS_OF_WEEK.some((day) =>
      scheduleMap[day].some((s) => (s.startTime && !s.endTime) || (!s.startTime && s.endTime))
    );
    if (hasIncomplete) {
      setError("Every slot needs both a start and end time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSavedMessage("");

      const schedule = DAYS_OF_WEEK.map((day) => ({
        day,
        slots: scheduleMap[day].filter((s) => s.startTime && s.endTime),
      }));

      await API.put("/availability/me", { schedule }, authHeaders);
      setSavedMessage("Availability saved.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save availability.");
    } finally {
      setSaving(false);
      setSaved(true);
    }
  };

  if (loading) {
    return <p className="text-center text-[#3A4D3E] pt-40">Loading availability...</p>;
  }

  return (
    <section className="pt-24 pb-10 px-6 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0F2A18] mb-2">Manage Availability</h1>
        <p className="text-[#3A4D3E] mb-8">
          Set which days you're available and add one or more time ranges for each day.
          This repeats every week.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {savedMessage && <p className="text-green-700 mb-4">{savedMessage}</p>}

        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#0F2A18]">{day}</h2>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    scheduleMap[day].length > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {scheduleMap[day].length > 0 ? "Available" : "Not available"}
                </span>
              </div>

              {scheduleMap[day].length > 0 && (
                <div className="space-y-2 mb-3">
                  {scheduleMap[day].map((slot, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-3">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(day, i, "startTime", e.target.value)}
                        className="border border-[#D8E5DA] rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                      />
                      <span className="text-[#3A4D3E]">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(day, i, "endTime", e.target.value)}
                        className="border border-[#D8E5DA] rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(day, i)}
                        className="text-red-500 hover:text-red-700 text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => addSlot(day)}
                className="text-[#0B3D1E] font-medium hover:underline text-sm"
              >
                + Add Slot
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/doctor/dashboard")}
            className="border border-[#D8E5DA] text-[#0F2A18] px-6 py-3 rounded-lg hover:bg-[#EEF5EF] transition"
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition disabled:opacity-50"
          >
            {saved ? "Saved" : saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ManageAvailability;