import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr; // fall back to raw string if unparseable
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// The backend's status enum is: "pending", "confirmed", "not_available",
// "completed", "Cancelled" (yes, only Cancelled is capitalized — that's
// how it's defined in the Appointment schema). Compare against these
// exact values; use formatStatus() only for what's shown on screen.
const statusColor = (status) => {
  switch (status) {
    case "completed":
      return "text-[#2E7D32]";
    case "Cancelled":
      return "text-red-600";
    case "confirmed":
      return "text-[#0B3D1E]";
    case "not_available":
      return "text-gray-500";
    default:
      return "text-yellow-600"; // pending / anything else
  }
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  if (status === "not_available") return "Not Available";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Is this appointment's date today (local calendar day)?
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const apptDate = new Date(dateStr);
  const today = new Date();
  return (
    apptDate.getFullYear() === today.getFullYear() &&
    apptDate.getMonth() === today.getMonth() &&
    apptDate.getDate() === today.getDate()
  );
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // fallback lookup if doctorId isn't populated
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileRes, appointmentsRes] = await Promise.all([
          API.get("/users/me"),
          API.get("/appointments/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log("Fetched profile:", appointmentsRes.data);

        setProfile(profileRes.data);
        setAppointments(appointmentsRes.data || []);

        // Only needed if doctorId comes back unpopulated (just an id string),
        // and to get each doctor's slug for linking to their page.
        try {
          const doctorsRes = await API.get("/doctors");
          setDoctors(doctorsRes.data || []);
        } catch (err) {
          console.log("Could not load doctors list for name lookup:", err);
        }
      } catch (error) {
        console.log(error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Handles both populated doctorId objects and raw id strings. Some
  // backend populate() calls only select a subset of fields (e.g. just
  // name + specialization), so we always fall back to the separately
  // fetched /doctors list to fill in anything missing (like slug).
  const getDoctorInfo = (appt) => {
    const populated =
      appt.doctorId && typeof appt.doctorId === "object" ? appt.doctorId : null;
    const id = populated ? populated._id : appt.doctorId;
    const match = doctors.find((doc) => doc._id === id);

    return {
      id,
      name: populated?.name || match?.name,
      specialization: populated?.specialization || match?.specialization,
      slug: populated?.slug || match?.slug,
    };
  };

  // Renders "Dr. X" as a link to their profile page if we have a slug,
  // otherwise falls back to plain text so we never render a dead link.
  const DoctorNameLink = ({ info, className }) => {
    const label = `Dr. ${info.name || "Unknown"}`;
    if (info.slug) {
      return (
        <Link
          to={`/doctors/${info.slug}`}
          className={`hover:underline ${className || ""}`}
        >
          {label}
        </Link>
      );
    }
    return <span className={className}>{label}</span>;
  };

  const handleCancel = async (apptId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmed) return;

    try {
      setCancellingId(apptId);
      await API.patch(
        `/appointments/${apptId}/status`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          (appt._id || appt.id) === apptId
            ? { ...appt, status: "Cancelled" }
            : appt
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  // Navigates into the per-slot waiting room for this appointment.
  const handleJoinWaitingRoom = (appt) => {
    const info = getDoctorInfo(appt);
    if (!info.id) return;

    const isoDate = new Date(appt.date).toISOString().split("T")[0];
    navigate(
      `/patient/waiting-room/${info.id}/${isoDate}/${encodeURIComponent(appt.timeSlot)}`
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const upcomingAppointment = [...appointments]
    .filter((a) => a.status !== "Cancelled" && new Date(a.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const totalAppointments = appointments.length;
  const completedVisits = appointments.filter(
    (a) => a.status === "completed"
  ).length;

  // Most recent distinct doctors the patient has booked with.
  const recentDoctors = [];
  const seenDoctorIds = new Set();
  for (const appt of sortedAppointments) {
    const info = getDoctorInfo(appt);
    if (info.id && !seenDoctorIds.has(info.id)) {
      seenDoctorIds.add(info.id);
      recentDoctors.push(info);
    }
    if (recentDoctors.length >= 3) break;
  }

  return (
    <div className="flex bg-[#F7FAF7] min-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8 pt-28">
          {/* Welcome */}
          <h2 className="text-3xl font-bold text-[#0F2A18]">
            Welcome, {profile?.name || "..."}
          </h2>

          <p className="text-[#3A4D3E] mt-2">
            Manage your appointments and profile here.
          </p>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Upcoming Appointment
              </h3>

              {loading ? (
                <p className="mt-4 text-[#6B7B6E]">Loading...</p>
              ) : upcomingAppointment ? (
                <>
                  <DoctorNameLink
                    info={getDoctorInfo(upcomingAppointment)}
                    className="mt-4 text-[#3A4D3E] block"
                  />
                  <p className="text-sm text-[#6B7B6E]">
                    {formatDate(upcomingAppointment.date)}
                    {upcomingAppointment.timeSlot
                      ? ` • ${upcomingAppointment.timeSlot}`
                      : ""}
                  </p>

                  {upcomingAppointment.status === "confirmed" &&
                    isToday(upcomingAppointment.date) && (
                      <button
                        type="button"
                        onClick={() => handleJoinWaitingRoom(upcomingAppointment)}
                        className="mt-3 mr-2 text-sm bg-[#0B3D1E] text-white rounded-lg px-3 py-1.5 hover:bg-[#082B15] transition-all duration-200"
                      >
                        Join Waiting Room
                      </button>
                    )}

                  {upcomingAppointment.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCancel(
                          upcomingAppointment._id || upcomingAppointment.id
                        )
                      }
                      disabled={
                        cancellingId ===
                        (upcomingAppointment._id || upcomingAppointment.id)
                      }
                      className="mt-3 text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 transition-all duration-200 disabled:opacity-60"
                    >
                      {cancellingId ===
                      (upcomingAppointment._id || upcomingAppointment.id)
                        ? "Cancelling..."
                        : "Cancel Appointment"}
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-4 text-[#6B7B6E]">No upcoming appointments</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Total Appointments
              </h3>

              <p className="text-3xl font-bold text-[#0B3D1E] mt-4">
                {loading ? "..." : totalAppointments}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Completed Visits
              </h3>

              <p className="text-3xl font-bold text-[#2E7D32] mt-4">
                {loading ? "..." : completedVisits}
              </p>
            </div>
          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mt-8">
            <h3 className="text-2xl font-bold text-[#0F2A18] mb-4">
              Appointment History
            </h3>

            {loading ? (
              <p className="text-[#6B7B6E]">Loading appointment history...</p>
            ) : sortedAppointments.length === 0 ? (
              <p className="text-[#6B7B6E]">No appointments yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D8E5DA]">
                    <th className="py-3 text-[#0F2A18]">Doctor</th>
                    <th className="text-[#0F2A18]">Date</th>
                    <th className="text-[#0F2A18]">Time</th>
                    <th className="text-[#0F2A18]">Status</th>
                    <th className="text-[#0F2A18]"></th>
                  </tr>
                </thead>

                <tbody>
                  {sortedAppointments.map((appt) => {
                    const apptId = appt._id || appt.id;
                    return (
                      <tr key={apptId} className="border-b border-[#D8E5DA]">
                        <td className="py-3 text-[#3A4D3E]">
                          <DoctorNameLink
                            info={getDoctorInfo(appt)}
                            className="text-[#3A4D3E]"
                          />
                        </td>
                        <td className="text-[#3A4D3E]">
                          {formatDate(appt.date)}
                        </td>
                        <td className="text-[#3A4D3E]">
                          {appt.timeSlot || "—"}
                        </td>
                        <td className={`font-medium ${statusColor(appt.status)}`}>
                          {formatStatus(appt.status)}
                        </td>
                        <td>
                          <div className="flex gap-2 justify-end">
                            {appt.status === "confirmed" && isToday(appt.date) && (
                              <button
                                type="button"
                                onClick={() => handleJoinWaitingRoom(appt)}
                                className="text-sm bg-[#0B3D1E] text-white rounded-lg px-3 py-1 hover:bg-[#082B15] transition-all duration-200"
                              >
                                Join Waiting Room
                              </button>
                            )}
                            {appt.status !== "completed" &&
                              appt.status !== "Cancelled" && (
                                <button
                                  type="button"
                                  onClick={() => handleCancel(apptId)}
                                  disabled={cancellingId === apptId}
                                  className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 transition-all duration-200 disabled:opacity-60"
                                >
                                  {cancellingId === apptId
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Doctors */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mt-8">
            <h3 className="text-2xl font-bold text-[#0F2A18] mb-4">
              Recent Doctors
            </h3>

            {loading ? (
              <p className="text-[#6B7B6E]">Loading recent doctors...</p>
            ) : recentDoctors.length === 0 ? (
              <p className="text-[#6B7B6E]">
                You haven't booked with any doctors yet.
              </p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {recentDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4"
                  >
                    <DoctorNameLink
                      info={doc}
                      className="font-semibold text-[#0F2A18] block"
                    />
                    <p className="text-[#3A4D3E]">
                      {doc.specialization || "General Physician"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;