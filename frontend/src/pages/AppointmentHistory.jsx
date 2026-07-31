import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const PAGE_SIZE = 15;

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  if (status === "Cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// The 4 options exposed to the doctor here — mapped to the backend's exact
// enum casing ("Cancelled" is the only capitalized one).
const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Confirm", value: "Confirmed" },
  { label: "Completed", value: "Completed" },
  { label: "Cancel", value: "Cancelled" },
];

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errReasonId, setErrReasonId] = useState(null);
  const [subError, setSubError] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [reasonDrafts, setReasonDrafts] = useState({}); // apptId -> in-progress edit text
  const [savingReasonId, setSavingReasonId] = useState(null);
  const [savedReason, setSavedReason] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await API.get("/appointments/doctor/me", authHeaders);
        const sorted = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(sorted);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment history.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const totalPages = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const pageItems = appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleStatusChange = async (apptId, status, doctorMessage) => {
    try {
      setUpdatingId(apptId);
      setError("");
      const payload = doctorMessage !== undefined ? { status, doctorMessage } : { status };
      await API.patch(`/appointments/${apptId}/status`, payload, authHeaders);
      setAppointments((prev) =>
        prev.map((a) =>
          (a._id || a.id) === apptId
            ? { ...a, status, ...(doctorMessage !== undefined ? { doctorMessage } : {}) }
            : a
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to update status. If this keeps failing, the backend may still need to allow doctors to set this status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Cancelling requires a reason up front — same window.prompt pattern the
  // app already uses for "Not Available" in DoctorAppointments.jsx.
  const handleCancelClick = (apptId) => {
    const reason = "I am Not Available For the Slot";
    handleStatusChange(apptId, "Cancelled", reason.trim());
  };

  // Lets the doctor edit the reason after the fact, independent of the
  // status buttons — status stays "Cancelled", only doctorMessage changes.
  
  const handleSaveReason = async (apptId) => {
    const reason = (reasonDrafts[apptId] ?? "").trim();
    if (!reason) {
    setErrReasonId(apptId);
      setSubError("A cancellation reason is required.");
      return;
    }
    try {
      setSavingReasonId(apptId);
      setError("");
      await API.patch(
        `/appointments/${apptId}/status`,
        { status: "Cancelled", doctorMessage: reason },
        authHeaders
      );
      setAppointments((prev) =>
        prev.map((a) => ((a._id || a.id) === apptId ? { ...a, doctorMessage: reason } : a))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update cancellation reason.");
    } finally {
      setSavingReasonId(null);
      setSavedReason(true);
      setErrReasonId(null);
      setSubError("");
    }
  };

  const goToPatientProfile = (patientId) => {
    if (!patientId) return;
    navigate(`/doctor/patients/${patientId}`);
  };

  return (
    <section className="pt-24 pb-10 px-6 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0F2A18] mb-2">Appointment History</h1>
        <p className="text-[#3A4D3E] mb-8">All appointments booked with you, newest first.</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">No appointments yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {pageItems.map((appt) => {
                const apptId = appt._id || appt.id;
                const isExpanded = expandedId === apptId;
                const patientId = appt.patientId?._id || appt.patientId;

                return (
                  <div key={apptId} className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                      <div>
                        <button
                          onClick={() => goToPatientProfile(patientId)}
                          className="font-semibold text-[#0B3D1E] hover:underline"
                        >
                          {appt.patientId?.name || "Unknown Patient"}
                        </button>
                        <p className="text-sm text-[#3A4D3E]">
                          {formatDate(appt.date)} &bull; {appt.timeSlot}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[appt.status] || "bg-gray-100 text-gray-700"}`}>
                          {formatStatus(appt.status)}
                        </span>
                        <button
                          onClick={() => toggleExpand(apptId)}
                          className="border border-[#D8E5DA] text-[#0F2A18] px-4 py-2 rounded-lg hover:bg-[#EEF5EF] text-sm whitespace-nowrap"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#EEF5EF] p-5 bg-[#FAFCFA] space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <p><span className="font-semibold text-[#0F2A18]">Patient Phone:</span> {appt.patientId?.phone || "-"}</p>
                          <p><span className="font-semibold text-[#0F2A18]">Consultation Fee:</span> BDT {appt.consultationFee ?? "-"}</p>
                          <p><span className="font-semibold text-[#0F2A18]">Date:</span> {formatDate(appt.date)}</p>
                          <p><span className="font-semibold text-[#0F2A18]">Time Slot:</span> {appt.timeSlot}</p>
                          <p><span className="font-semibold text-[#0F2A18]">Status:</span> {formatStatus(appt.status)}</p>
                          <p><span className="font-semibold text-[#0F2A18]">Rating:</span> {appt.rating ?? "Not rated"}</p>
                          {appt.doctorMessage && appt.status !== "Cancelled" && (
                            <p className="sm:col-span-2"><span className="font-semibold text-[#0F2A18]">Doctor Message:</span> {appt.doctorMessage}</p>
                          )}
                          {/* Payment fields — rendered defensively since the exact
                              field names depend on the bKash integration; adjust
                              these keys if they differ from what's actually stored. */}
                          {appt.paymentStatus && (
                            <p><span className="font-semibold text-[#0F2A18]">Payment Status:</span> {appt.paymentStatus}</p>
                          )}
                          {appt.paymentMethod && (
                            <p><span className="font-semibold text-[#0F2A18]">Payment Method:</span> {appt.paymentMethod}</p>
                          )}
                          {appt.transactionId && (
                            <p><span className="font-semibold text-[#0F2A18]">Transaction ID:</span> {appt.transactionId}</p>
                          )}
                        </div>

                        {appt.status === "Cancelled" && (
                          <div>
                            <p className="font-semibold text-[#0F2A18] mb-2 text-sm">Cancellation Reason</p>
                            <textarea
                              value={reasonDrafts[apptId] ?? appt.doctorMessage ?? ""}
                              onChange={(e) => {
  setReasonDrafts((prev) => ({
    ...prev,
    [apptId]: e.target.value,
  }));

  setSavedReason(false);
}}
                              rows={2}
                              placeholder="Reason shown to the patient..."
                              className="w-full border border-[#D8E5DA] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                            />
                             {errReasonId === apptId && subError && <p className="text-red-500 mb-4">{subError}</p>}
                            <button
                              onClick={() => handleSaveReason(apptId)}
                              disabled={savingReasonId === apptId}
                              className="mt-2 bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15] transition text-sm disabled:opacity-50"
                            >
                              {savedReason && savingReasonId !== apptId ? "Saved" : savingReasonId === apptId ? "Saving..." : "Save Reason"}
                            </button>
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-[#0F2A18] mb-2 text-sm">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  opt.value === "Cancelled"
                                    ? handleCancelClick(apptId)
                                    : handleStatusChange(apptId, opt.value)
                                }
                                disabled={updatingId === apptId || appt.status === opt.value}
                                className={`px-4 py-2 rounded-lg text-sm border transition disabled:opacity-50 ${
                                  appt.status === opt.value
                                    ? "bg-[#0B3D1E] text-white border-[#0B3D1E]"
                                    : "border-[#D8E5DA] text-[#0F2A18] hover:bg-[#EEF5EF]"
                                }`}
                              >
                                {updatingId === apptId ? "..." : opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border border-[#D8E5DA] px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-[#EEF5EF]"
                >
                  Previous
                </button>
                <span className="text-sm text-[#3A4D3E]">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border border-[#D8E5DA] px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-[#EEF5EF]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AppointmentHistory;