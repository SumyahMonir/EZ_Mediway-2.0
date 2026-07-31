import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

// Compares calendar dates using UTC date parts on both sides, so the
// result never depends on the browser's local timezone. Using
// .toDateString() here previously converted the stored UTC date into
// local time before comparing, which could silently shift a date
// across the day boundary and make "today's" appointments vanish.
const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

// For "today"/"yesterday" reference points specifically — these must use the
// browser's LOCAL calendar date, not isoDate()'s UTC conversion. Appointment
// dates are stored as UTC midnight matching the calendar day the patient
// picked, but "right now" converted via toISOString() can land on the wrong
// calendar day during early-morning hours in any UTC+ timezone (e.g. between
// local midnight and 6 AM in Bangladesh, UTC time is still "yesterday").
const localIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const sameDay = (dateStr, referenceNow) => isoDate(dateStr) === localIsoDate(referenceNow);

// Backend status enum: "pending", "confirmed", "not_available",
// "completed", "Cancelled" (only Cancelled is capitalized).
const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  if (status === "not_available") return "Not Available";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// TODO: Appointment model doesn't have a visit-type field yet
// (consultation / report checkup / follow-up). Hardcoded placeholder
// until that field exists on the backend.
const VISIT_TYPE_PLACEHOLDER = "Consultation";

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "HH:MM" (24hr, what the availability schedule stores) -> "h:mm AM/PM"
const formatTime12hr = (time24) => {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${period}`;
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [availability, setAvailability] = useState(null); // { schedule: [{day, slots}] }
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileRes, appointmentsRes] = await Promise.all([
          API.get("/doctors/me"),
          API.get("/appointments/doctor/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(profileRes.data);
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        console.log(error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Real availability schedule for the sidebar card, replacing the old
  // hardcoded "Sun - Thu / 09 AM - 05 PM" placeholder.
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const res = await API.get("/availability/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailability(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [token]);

  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Includes ALL statuses for today, including Cancelled — intentionally
  // not filtered, so cancelled appointments still show (with the red badge).
  const todaysAppointments = appointments.filter((a) => sameDay(a.date, today));
  const yesterdaysAppointments = appointments.filter((a) =>
    sameDay(a.date, yesterday)
  );

  const completedTodayCount = todaysAppointments.filter(
    (a) => a.status === "completed"
  ).length;

  const appointmentsDelta = todaysAppointments.length - yesterdaysAppointments.length;
  const deltaText =
    appointmentsDelta > 0
      ? `+${appointmentsDelta} from yesterday`
      : appointmentsDelta < 0
      ? `${appointmentsDelta} from yesterday`
      : "Same as yesterday";

  // "Upcoming Patients" — distinct patients with an active appointment
  // in the next 3 days (not counting today, not cancelled). Compared
  // as UTC date strings for the same reason as sameDay() above.
  const upcomingStartDate = new Date(today);
  upcomingStartDate.setDate(today.getDate() + 1);
  const upcomingEndDate = new Date(today);
  upcomingEndDate.setDate(today.getDate() + 3);

  const upcomingStart = localIsoDate(upcomingStartDate);
  const upcomingEnd = localIsoDate(upcomingEndDate);

  const upcomingAppointments = appointments.filter((a) => {
    const d = isoDate(a.date);
    return d >= upcomingStart && d <= upcomingEnd && a.status !== "Cancelled";
  });
  const upcomingPatientIds = new Set(
    upcomingAppointments.map((a) => a.patientId?._id || a.patientId)
  );

  // Total configured slot count across the week — drives the "Available
  // Slots" stat card, replacing the old hardcoded "12".
  const totalWeeklySlots = (availability?.schedule || []).reduce(
    (sum, entry) => sum + (entry.slots?.length || 0),
    0
  );

  // Sorted into calendar-week order (Sun..Sat) rather than insertion order,
  // since the backend only stores days that actually have slots.
  const scheduleByDay = DAY_ORDER
    .map((day) => (availability?.schedule || []).find((entry) => entry.day === day))
    .filter(Boolean);

  // Recent Patients — most recent distinct patients across all appointments.
  const sortedByDateDesc = [...appointments].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const recentPatients = [];
  const seenPatientIds = new Set();
  for (const appt of sortedByDateDesc) {
    const pid = appt.patientId?._id || appt.patientId;
    if (pid && !seenPatientIds.has(pid)) {
      seenPatientIds.add(pid);
      recentPatients.push(appt);
    }
    if (recentPatients.length >= 4) break;
  }

  // Opens the per-slot waiting room for a confirmed appointment.
  // profile._id is this doctor's own Doctor document id (from /doctors/me).
  const handleOpenWaitingRoom = (appt) => {
    if (!profile?._id) return;
    const date = isoDate(appt.date);
    navigate(
      `/doctor/waiting-room/${profile._id}/${date}/${encodeURIComponent(appt.timeSlot)}`
    );
  };

  return (
    <div className="flex bg-[#F7FAF7] pt-24 pb-10">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Welcome */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#0F2A18]">
              Welcome, Dr. {profile?.name || "..."}
            </h1>

            <p className="text-[#4A5C4F] mt-2">
              Manage your appointments, patients and availability from one place.
            </p>
          </div>

          <div className="mt-5 md:mt-0 bg-white border border-[#D8E5DA] rounded-xl px-6 py-4 shadow">
            <p className="text-sm text-gray-500">Today's Date</p>

            <h3 className="text-xl font-bold text-[#0B3D1E]">
              {today.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <p className="text-gray-500">Today's Appointments</p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              {loading ? "..." : todaysAppointments.length}
            </h2>

            <p
              className={`text-sm mt-3 ${
                appointmentsDelta > 0
                  ? "text-green-600"
                  : appointmentsDelta < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {loading ? "" : deltaText}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <p className="text-gray-500">Upcoming Patients</p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              {loading ? "..." : upcomingPatientIds.size}
            </h2>

            <p className="text-sm text-blue-600 mt-3">Next 3 days</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <p className="text-gray-500">Available Slots</p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              {loadingAvailability ? "..." : totalWeeklySlots}
            </h2>

            <p className="text-sm text-yellow-700 mt-3">Per week</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <p className="text-gray-500">Completed Today</p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              {loading ? "..." : completedTodayCount}
            </h2>

            <p className="text-sm text-green-600 mt-3">Successfully completed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">Quick Actions</h2>

          <div className="grid md:grid-cols-3 gap-5">
            <Link
              to="/doctor/history"
              className="bg-[#0B3D1E] text-white rounded-xl p-6 hover:bg-[#082B15] transition"
            >
              <h3 className="text-xl font-semibold">Appointment History</h3>
              <p className="text-sm mt-2 text-[#D8E5DA]">
                View your appointment history.
              </p>
            </Link>

            <Link
              to="/doctor/appointments"
              className="bg-white border border-[#D8E5DA] rounded-xl p-6 hover:bg-[#EEF5EF] transition"
            >
              <h3 className="text-xl font-semibold text-[#0F2A18]">
                View Appointments
              </h3>
              <p className="text-sm mt-2 text-gray-500">
                See all upcoming appointments.
              </p>
            </Link>

            <Link
              to="/profile"
              className="bg-white border border-[#D8E5DA] rounded-xl p-6 hover:bg-[#EEF5EF] transition"
            >
              <h3 className="text-xl font-semibold text-[#0F2A18]">
                My Profile
              </h3>
              <p className="text-sm mt-2 text-gray-500">
                Update your personal information.
              </p>
            </Link>
          </div>
        </div>

        {/* Today's Appointments + Availability */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          {/* Appointment Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F2A18]">
                Today's Appointments
              </h2>

              <Link
                to="/doctor/appointments"
                className="text-[#0B3D1E] font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-gray-500 py-4">Loading appointments...</p>
              ) : todaysAppointments.length === 0 ? (
                <p className="text-gray-500 py-4">
                  No appointments scheduled for today.
                </p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D8E5DA]">
                      <th className="text-left py-3 text-[#0F2A18]">Patient</th>
                      <th className="text-left py-3 text-[#0F2A18]">Date</th>
                      <th className="text-left py-3 text-[#0F2A18]">Time</th>
                      <th className="text-left py-3 text-[#0F2A18]">Status</th>
                      <th className="text-left py-3 text-[#0F2A18]">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {todaysAppointments.map((appt) => (
                      <tr
                        key={appt._id || appt.id}
                        className="border-b border-[#EEF5EF]"
                      >
                        <td className="py-4">
                          {appt.patientId?.name || "Unknown"}
                        </td>
                        <td>{formatDate(appt.date)}</td>
                        <td>{appt.timeSlot}</td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              statusStyles[appt.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {formatStatus(appt.status)}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {appt.status === "Confirmed" && (
                              <button
                                onClick={() => handleOpenWaitingRoom(appt)}
                                className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15] whitespace-nowrap"
                              >
                                Open Waiting Room
                              </button>
                            )}

                            {/* Placeholder for future prescription/history
                                view — not functional yet. */}
                            <button className="border border-[#D8E5DA] text-[#0F2A18] px-4 py-2 rounded-lg hover:bg-[#EEF5EF]">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Availability — now pulled from the real weekly schedule */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">
                Availability
              </h2>

              {loadingAvailability ? (
                <p className="text-gray-500">Loading availability...</p>
              ) : scheduleByDay.length === 0 ? (
                <p className="text-gray-500">
                  No availability set yet — add your weekly schedule to start
                  accepting bookings.
                </p>
              ) : (
                <div className="space-y-3">
                  {scheduleByDay.map((entry) => (
                    <div key={entry.day} className="flex justify-between items-start gap-4">
                      <span className="font-medium text-[#0F2A18] whitespace-nowrap">{entry.day}</span>
                      <span className="text-right text-sm text-gray-600">
                        {entry.slots
                          .map((s) => `${formatTime12hr(s.startTime)} - ${formatTime12hr(s.endTime)}`)
                          .join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate("/doctor/availability")}
                className="w-full mt-6 bg-[#0B3D1E] text-white py-3 rounded-xl hover:bg-[#082B15] transition"
              >
                Edit Availability
              </button>
            </div>

            <div className="bg-[#EEF5EF] rounded-2xl border border-[#D8E5DA] p-6">
              <h3 className="text-xl font-bold text-[#0F2A18] mb-3">
                Today's Summary
              </h3>

              <p className="text-gray-700 mb-2">
                ✔ {loading ? "..." : todaysAppointments.length} Appointments
                Scheduled
              </p>

              <p className="text-gray-700 mb-2">
                ✔ {loading ? "..." : completedTodayCount} Completed
              </p>

              <p className="text-gray-700">
                ✔{" "}
                {loading
                  ? "..."
                  : todaysAppointments.length - completedTodayCount}{" "}
                Remaining
              </p>
            </div>
          </div>
        </div>

        {/* Recent Patients & Notifications */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          {/* Recent Patients */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0F2A18]">
                Recent Patients
              </h2>

              {/* Not wired up yet — no patient history/reports route exists. */}
              <button className="text-[#0B3D1E] font-medium hover:underline">
                View All
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading recent patients...</p>
            ) : recentPatients.length === 0 ? (
              <p className="text-gray-500">No patient visits yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {recentPatients.map((appt) => (
                  <div
                    key={appt._id || appt.id}
                    className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-5"
                  >
                    <h3 className="text-lg font-bold text-[#0F2A18]">
                      {appt.patientId?.name || "Unknown"}
                    </h3>

                    {/* TODO: swap for real visit-type field once it exists
                        on the Appointment model. */}
                    <p className="text-[#3A4D3E] mt-2">
                      {VISIT_TYPE_PLACEHOLDER}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Last Visit: {formatDate(appt.date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications — no notifications model/endpoint yet, kept
              hardcoded per your instruction. */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">
            <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-green-600 bg-[#EEF5EF] p-4 rounded-lg">
                <p className="font-medium text-[#0F2A18]">New Appointment</p>
                <p className="text-sm text-gray-600">
                  John Doe booked an appointment.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-[#0F2A18]">Schedule Reminder</p>
                <p className="text-sm text-gray-600">
                  Update your availability for next week.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-[#0F2A18]">Patient Message</p>
                <p className="text-sm text-gray-600">
                  Sarah Ahmed sent you a message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;