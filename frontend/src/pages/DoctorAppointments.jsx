import React, { useState, useEffect } from "react";
import API from "../api";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null); // appointment currently being confirmed/cancelled
  const [cancellingId, setCancellingId] = useState(null); // apptId whose reason textarea is open
  const [reasonDrafts, setReasonDrafts] = useState({}); // apptId -> in-progress reason text
  const [errReasonId, setErrReasonId] = useState(null);
  const [subError, setSubError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/appointments/doctor/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched appointments:", res.data);
      setAppointments(res.data || []);
    } catch (err) {
      console.log(err);
      setError("Failed to load appointment requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Only pending requests belong on this page — confirmed/completed/
  // cancelled/not_available appointments are handled elsewhere.
  // NOTE: value must match the backend enum exactly ("pending", lowercase —
  // see STATUS_OPTIONS in AppointmentHistory.jsx). This previously compared
  // against "Pending" (capital P) and so silently matched nothing.
  const pendingAppointments = appointments
    .filter((a) => a.status === "Pending")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleUpdateStatus = async (apptId, status, doctorMessage) => {
    try {
      setActingId(apptId);
      setError("");

      const payload = doctorMessage !== undefined ? { status, doctorMessage } : { status };
      await API.patch(`/appointments/${apptId}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update status locally so it drops out of the pending list immediately
      // instead of waiting for a refetch.
      setAppointments((prev) =>
        prev.map((appt) =>
          (appt._id || appt.id) === apptId
            ? { ...appt, status, ...(doctorMessage !== undefined ? { doctorMessage } : {}) }
            : appt
        )
      );
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.error || "Failed to update appointment status."
      );
    } finally {
      setActingId(null);
    }
  };

  // Enum value must match backend casing exactly — lowercase "confirmed".
  const handleConfirm = (apptId) => {
    handleUpdateStatus(apptId, "Confirmed");
  };

  // "Cancel" opens an inline textarea (in the row below) instead of a
  // window.prompt — the doctor types the reason there and submits it.
  const openCancelReason = (apptId) => {
    setCancellingId(apptId);
    setErrReasonId(null);
    setSubError("");
  };

  const dismissCancelReason = (apptId) => {
    setCancellingId(null);
    setErrReasonId((prev) => (prev === apptId ? null : prev));
    setSubError("");
  };

  const handleCancelSubmit = async (apptId) => {
    const reason = (reasonDrafts[apptId] ?? "").trim();
    if (!reason) {
      setErrReasonId(apptId);
      setSubError("A cancellation reason is required.");
      return;
    }
    await handleUpdateStatus(apptId, "Cancelled", reason);
    // Row disappears from the pending list once status flips, but clean up
    // the local UI state either way.
    setCancellingId(null);
    setErrReasonId(null);
    setSubError("");
    setReasonDrafts((prev) => {
      const next = { ...prev };
      delete next[apptId];
      return next;
    });
  };

  return (
    <section className="pt-24 pb-10 px-8 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0F2A18] mb-2">
          Appointment Requests
        </h1>
        <p className="text-[#4A5C4F] mb-8">
          Review and respond to pending appointment requests from patients.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
          {loading ? (
            <p className="text-gray-500 py-4">Loading appointment requests...</p>
          ) : pendingAppointments.length === 0 ? (
            <p className="text-gray-500 py-4">
              No pending appointment requests right now.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D8E5DA]">
                    <th className="py-3 text-[#0F2A18]">Patient</th>
                    <th className="text-[#0F2A18]">Phone</th>
                    <th className="text-[#0F2A18]">Date</th>
                    <th className="text-[#0F2A18]">Time</th>
                    <th className="text-[#0F2A18]"></th>
                  </tr>
                </thead>

                <tbody>
                  {pendingAppointments.map((appt) => {
                    const apptId = appt._id || appt.id;
                    const isActing = actingId === apptId;

                    const isCancelling = cancellingId === apptId;

                    return (
                      <React.Fragment key={apptId}>
                        <tr className={isCancelling ? "" : "border-b border-[#EEF5EF]"}>
                          <td className="py-4 font-medium text-[#0F2A18]">
                            {appt.patientId?.name || "Unknown"}
                          </td>
                          <td className="text-[#3A4D3E]">
                            {appt.patientId?.phone || "—"}
                          </td>
                          <td className="text-[#3A4D3E]">
                            {formatDate(appt.date)}
                          </td>
                          <td className="text-[#3A4D3E]">{appt.timeSlot}</td>
                          <td>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleConfirm(apptId)}
                                disabled={isActing || isCancelling}
                                className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15] transition disabled:opacity-60"
                              >
                                {isActing ? "..." : "Confirm"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  isCancelling ? dismissCancelReason(apptId) : openCancelReason(apptId)
                                }
                                disabled={isActing}
                                className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                              >
                                {isCancelling ? "Never mind" : "Cancel"}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isCancelling && (
                          <tr className="border-b border-[#EEF5EF]">
                            <td colSpan={5} className="pb-4">
                              <div className="bg-[#FAFCFA] border border-[#D8E5DA] rounded-lg p-4">
                                <p className="font-semibold text-[#0F2A18] mb-2 text-sm">
                                  Reason for declining
                                </p>
                                <textarea
                                  autoFocus
                                  value={reasonDrafts[apptId] ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setReasonDrafts((prev) => ({ ...prev, [apptId]: value }));
                                    if (errReasonId === apptId) {
                                      setErrReasonId(null);
                                      setSubError("");
                                    }
                                  }}
                                  rows={2}
                                  placeholder="Reason shown to the patient..."
                                  className="w-full border border-[#D8E5DA] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                                />
                                {errReasonId === apptId && subError && (
                                  <p className="text-red-500 text-sm mt-1">{subError}</p>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleCancelSubmit(apptId)}
                                    disabled={isActing}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-60"
                                  >
                                    {isActing ? "Submitting..." : "Submit & Decline"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => dismissCancelReason(apptId)}
                                    disabled={isActing}
                                    className="border border-[#D8E5DA] text-[#0F2A18] px-4 py-2 rounded-lg hover:bg-[#EEF5EF] transition text-sm disabled:opacity-60"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DoctorAppointments;