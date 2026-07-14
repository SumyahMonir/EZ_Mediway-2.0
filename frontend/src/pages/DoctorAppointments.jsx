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
  const [actingId, setActingId] = useState(null); // appointment currently being confirmed/declined

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
  const pendingAppointments = appointments
    .filter((a) => a.status === "pending")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleUpdateStatus = async (apptId, status, doctorMessage) => {
    try {
      setActingId(apptId);
      setError("");

      await API.patch(
        `/appointments/${apptId}/status`,
        { status, doctorMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove it from the pending list locally instead of refetching.
      setAppointments((prev) =>
        prev.map((appt) =>
          (appt._id || appt.id) === apptId ? { ...appt, status } : appt
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

  const handleConfirm = (apptId) => {
    handleUpdateStatus(apptId, "confirmed");
  };

  const handleNotAvailable = (apptId) => {
    const message = window.prompt(
      "Optional: let the patient know why you're not available for this slot."
    );
    // window.prompt returns null if cancelled — don't submit in that case.
    if (message === null) return;
    handleUpdateStatus(apptId, "not_available", message);
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

                    return (
                      <tr key={apptId} className="border-b border-[#EEF5EF]">
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
                              disabled={isActing}
                              className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15] transition disabled:opacity-60"
                            >
                              {isActing ? "..." : "Confirm"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleNotAvailable(apptId)}
                              disabled={isActing}
                              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
                            >
                              Not Available
                            </button>
                          </div>
                        </td>
                      </tr>
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