import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Force-parses a "YYYY-MM-DD" date-only string as UTC, then reads the UTC
// day-of-week — this must match how the date was stored/interpreted
// elsewhere (see the isoDate/localIsoDate split in DoctorDashboard.jsx and
// waitingRoomController.js). Using the browser's local timezone here could
// shift which calendar day is picked, and therefore which day's slots show.
const getDayName = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return DAY_NAMES[d.getUTCDay()];
};

// "HH:MM" (24hr, from the availability schedule) -> "h:mm AM/PM"
const formatTime12hr = (time24) => {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${period}`;
};

const slotLabel = (slot) => `${formatTime12hr(slot.startTime)} - ${formatTime12hr(slot.endTime)}`;

// The backend's status enum is capitalized: "Pending", "Confirmed",
// "Completed", "Cancelled". formatStatus() is only for what's shown on
// screen — compare against the exact enum values everywhere else.
const formatStatus = (status) => {
  if (!status) return "Pending";
  if (status === "Cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Statuses that count as an "active" booking blocking a new one. Only
// Pending/Confirmed are still "in progress" — Completed AND Cancelled are
// both finished, so neither should block booking again. (Cancelled was
// mistakenly included here before, which would have silently blocked
// rebooking and made a "Book Again" button after cancelling not work.)
const ACTIVE_STATUSES_BLOCKING_REBOOK = ["Pending", "Confirmed"];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const preselectedDoctorId = searchParams.get("doctorId");

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [doctorId, setDoctorId] = useState(preselectedDoctorId || "");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  // The doctor's full weekly schedule, fetched once per doctor — the day's
  // slots are derived from this + the selected date, not fetched per-date.
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [payAmount, setPayAmount] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  // Holds the confirmed booking once it succeeds. While this is set,
  // we show the status card instead of the form.
  const [bookedAppointment, setBookedAppointment] = useState(null);

  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [checkingExisting, setCheckingExisting] = useState(true);

  // Fetch real verified doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get("/doctors");
        setDoctors(res.data);

        if (!preselectedDoctorId && res.data.length > 0) {
          setDoctorId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [preselectedDoctorId]);

  // The doctor is fixed once chosen (either passed in via ?doctorId=
  // or defaulted to the first doctor above) — we never let the user
  // swap it via a dropdown anymore.
  const selectedDoctor = doctors.find((doc) => doc._id === doctorId);

  // Prefill the "amount to pay" box with the doctor's listed fee once
  // they're known — the patient can still change it before submitting.
  useEffect(() => {
    if (selectedDoctor?.consultationFee && !payAmount) {
      setPayAmount(String(selectedDoctor.consultationFee));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor?.consultationFee]);

  // Fetch this doctor's weekly availability once we know who they are
  useEffect(() => {
    if (!doctorId || !token) return;

    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const res = await API.get(`/availability/${doctorId}`, authHeaders);
        setAvailability(res.data);
      } catch (err) {
        console.error(err);
        setAvailability({ schedule: [] });
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, token]);

  // The specific day's slots, derived from the selected date + the fetched
  // weekly schedule — empty if the doctor isn't available that day at all.
  const daySlots = (() => {
    if (!date || !availability) return [];
    const dayName = getDayName(date);
    const entry = (availability.schedule || []).find((e) => e.day === dayName);
    return entry?.slots || [];
  })();

  // Whenever the available slots for the chosen date change, make sure the
  // selected timeSlot is still one of them — reset to the first one
  // otherwise (or clear it if there are none).
  useEffect(() => {
    if (daySlots.length === 0) {
      setTimeSlot("");
      return;
    }
    const labels = daySlots.map(slotLabel);
    if (!labels.includes(timeSlot)) {
      setTimeSlot(labels[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, availability]);

  // Helper: some appointment models populate doctorId with the full
  // doctor doc, others just store the raw id string. Handle both.
  const extractDoctorId = (appt) =>
    typeof appt.doctorId === "object" && appt.doctorId !== null
      ? appt.doctorId._id
      : appt.doctorId;

  // Some backend populate() calls only select a subset of fields (e.g.
  // just name + specialization), so we always fall back to the
  // separately fetched /doctors list to fill in anything missing
  // (like slug) rather than trusting the populated object alone.
  const extractDoctorInfo = (appt) => {
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
  const DoctorNameLink = ({ name, slug, className }) => {
    const label = `Dr. ${name || "Unknown"}`;
    if (slug) {
      return (
        <Link to={`/doctors/${slug}`} className={`hover:underline ${className || ""}`}>
          {label}
        </Link>
      );
    }
    return <span className={className}>{label}</span>;
  };

  // Check if the patient already has an ACTIVE (Pending/Confirmed) booking
  // for this doctor, so the status card shows up on reload instead of
  // letting them book a duplicate appointment. Cancelled AND Completed
  // appointments don't block a new booking — both are finished.
  useEffect(() => {
    if (!token || !doctorId) return;

    const checkExisting = async () => {
      try {
        setCheckingExisting(true);
        const res = await API.get("/appointments/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appt = (res.data || []).find((a) => extractDoctorId(a) === doctorId);

        const existing = (res.data || [])
          .filter(
            (appt) =>
              extractDoctorId(appt) === doctorId &&
              ACTIVE_STATUSES_BLOCKING_REBOOK.includes(appt.status)
          )
          .sort(
            (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          )[0];


        if (existing) {
          const doctorInfo = extractDoctorInfo(existing);
          console.log("Existing active appointment found:", existing, doctorInfo);
          setBookedAppointment({
          id: appt._id,
          doctorName: appt.doctorId.name,
          specialization: appt.doctorId.specialization,
          doctorSlug: appt.doctorId.slug,
          date: appt.date,
          timeSlot: appt.timeSlot,
          status: appt.status,

          consultationFee: appt.consultationFee,
          paymentStatus: appt.paymentStatus,
          paymentMethod: appt.paymentMethod,
          transactionId: appt.transactionId,
        });
        }
      } catch (err) {
        // Non-fatal — just means we can't confirm an existing booking,
        // so we fall back to showing the booking form.
        console.error(err);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, doctorId, doctors.length,appointmentId]);

  // Loads the booking status card straight from an appointmentId in the URL
  // (e.g. after returning from the bKash redirect).
  useEffect(() => {
    if (!appointmentId) return;

    const fetchAppointment = async () => {
      try {
        const res = await API.get(`/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const appt = res.data;

        setBookedAppointment({
          id: appt._id,
          doctorName: appt.doctorId.name,
          specialization: appt.doctorId.specialization,
          doctorSlug: appt.doctorId.slug,
          date: appt.date,
          timeSlot: appt.timeSlot,
          status: appt.status,

          consultationFee: appt.consultationFee,
          paymentStatus: appt.paymentStatus,
          paymentMethod: appt.paymentMethod,
          transactionId: appt.transactionId,
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId || !date || !timeSlot) {
      return setError("Please fill in all fields.");
    }

    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      return setError("Please enter a valid amount to pay.");
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await API.post(
        "/payment/bkash/create",
        {
          doctorId,
          date,
          timeSlot,
          // NOTE: field name kept as "consultationFee" to match what the
          // bKash creation endpoint already expects — its VALUE currently
          // just mirrors the doctor's fee since the editable amount input
          // is temporarily removed from the form (see comment below).
          consultationFee: amount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("bKash create response:", res.data);

      if (res.data.success && res.data.bkashURL) {
        window.location.href = res.data.bkashURL;
      } else {
        setError("Failed to initiate payment. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to initiate payment.");
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!bookedAppointment?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");

      await API.patch(
        `/appointments/${bookedAppointment.id}/status`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookedAppointment((prev) =>
        prev ? { ...prev, status: "Cancelled" } : prev
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  // "Fresh page, no previous info" — a plain client-side navigate wouldn't
  // reset state that was only initialized once on mount (doctorId, date,
  // payAmount, etc. would all still hold the old booking's values since
  // this is the same component instance). A hard reload guarantees a truly
  // blank form with nothing preselected.
  const handleBookAgain = () => {
    window.location.href = "/book-appointment";
  };

  // Prevent picking a past date
  const today = new Date().toISOString().split("T")[0];

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Confirmed: "bg-green-100 text-green-800 border-green-300",
    Completed: "bg-blue-100 text-blue-800 border-blue-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <section className="py-16 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg border border-[#D8E5DA] rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-[#0F2A18] mb-8">
          {bookedAppointment ? "Appointment Status" : "Book Appointment"}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {checkingExisting ? (
          <p className="text-center text-[#3A4D3E]">Checking your bookings...</p>
        ) : bookedAppointment ? (

          // ---------- STATUS VIEW (shown after a successful booking) ----------
          <div className="space-y-5">
            <div className="border border-[#D8E5DA] rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0F2A18]">Doctor</span>
                <span className="text-[#3A4D3E]">
                  <DoctorNameLink
                    name={bookedAppointment.doctorName}
                    slug={bookedAppointment.doctorSlug}
                  />
                  {bookedAppointment.specialization
                    ? ` — ${bookedAppointment.specialization}`
                    : ""}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0F2A18]">Date</span>
                <span className="text-[#3A4D3E]">{bookedAppointment.date}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0F2A18]">Time</span>
                <span className="text-[#3A4D3E]">{bookedAppointment.timeSlot}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#0F2A18]">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[bookedAppointment.status] ||
                    "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                >
                  {formatStatus(bookedAppointment.status)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Payment Status</span>

                <span>{bookedAppointment.paymentStatus}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Payment Method</span>

                <span>{bookedAppointment.paymentMethod}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Transaction ID</span>

                <span>{bookedAppointment.transactionId}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold">Consultation Fee</span>

                <span>BDT {bookedAppointment.consultationFee}</span>
              </div>

            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {bookedAppointment.status !== "Cancelled" ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBookAgain}
                  className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
                >
                  Book Again
                </button>
              )}

              <Link
                to="/doctors"
                className="bg-[#EEF5EF] text-[#0F2A18] border border-[#D8E5DA] px-6 py-3 rounded-lg hover:bg-[#E4EEE5] transition-all duration-300"
              >
                Back to Doctors
              </Link>
            </div>
          </div>
        ) : (
          // ---------- BOOKING FORM ----------
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Doctor (fixed, not editable) */}
            <div>
              <label className="block font-semibold text-[#0F2A18] mb-2">
                Doctor
              </label>

              {loadingDoctors ? (
                <p className="text-[#3A4D3E]">Loading doctor...</p>
              ) : selectedDoctor ? (
                <div className="w-full border border-[#D8E5DA] rounded-lg p-3 bg-[#F7FAF7] flex justify-between items-center">
                  <span className="text-[#0F2A18] font-medium">
                    <DoctorNameLink
                      name={selectedDoctor.name}
                      slug={selectedDoctor.slug}
                    />{" "}
                    — {selectedDoctor.specialization}
                  </span>
                  <Link
                    to="/doctors"
                    className="text-sm text-[#0B3D1E] underline hover:no-underline"
                  >
                    Choose a different doctor
                  </Link>
                </div>
              ) : (
                <p className="text-red-500">
                  No doctor selected.{" "}
                  <Link to="/doctors" className="underline">
                    Pick a doctor
                  </Link>
                  .
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#0F2A18] mb-2">
                Available Slots
              </label>

              {loadingAvailability ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-3">
                  {DAY_NAMES.map((dayName) => {
                    const day = (availability?.schedule || []).find(
                      (d) => d.day === dayName
                    );

                    return (
                      <div
                        key={dayName}
                        className="border rounded-lg p-3 bg-[#F7FAF7]"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">{dayName}</p>

                          {!day?.slots?.length && (
                            <span className="text-red-500 text-sm font-medium">
                              Not Available
                            </span>
                          )}
                        </div>

                        {day?.slots?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {day.slots.map((slot, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm"
                              >
                                {slotLabel(slot)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block font-semibold text-[#0F2A18] mb-2">
                Appointment Date
              </label>

              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                required
              />
              {date && (
                <p className="text-sm text-[#6B7B6E] mt-2">
                  {getDayName(date)}
                </p>
              )}
            </div>

            {/* Time — now driven by the doctor's real weekly availability */}
            <div>
              <label className="block font-semibold text-[#0F2A18] mb-2">
                Select Time
              </label>

              {!date ? (
                <p className="text-[#6B7B6E] text-sm">Pick a date first.</p>
              ) : loadingAvailability ? (
                <p className="text-[#6B7B6E] text-sm">Loading available times...</p>
              ) : daySlots.length === 0 ? (
                <p className="text-red-500 text-sm">
                  Dr. {selectedDoctor?.name || "this doctor"} isn't available on {getDayName(date)}. Please pick a different date.
                </p>
              ) : (
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                  required
                >
                  {daySlots.map((slot, i) => (
                    <option key={i} value={slotLabel(slot)}>
                      {slotLabel(slot)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Consultation Fee + Amount to Pay — currently disabled here.
                payAmount still exists in state (prefilled from the doctor's
                fee) and is what actually gets sent to /payment/bkash/create,
                it just isn't user-editable in the form right now. Let me
                know if this was supposed to stay removed or come back. */}

            {/* payment */}
            <div>
              <label className="block font-semibold text-[#0F2A18] mb-2">
                Payment Method
              </label>

              <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
                <input
                  type="radio"
                  checked
                  readOnly
                />

                <span>bKash</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || loadingDoctors || !selectedDoctor || daySlots.length === 0}
                className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? "Redirecting to bKash..." : "Pay & Book Appointment"}
              </button>

              <Link
                to="/doctors"
                className="bg-[#EEF5EF] text-[#0F2A18] border border-[#D8E5DA] px-6 py-3 rounded-lg hover:bg-[#E4EEE5] transition-all duration-300"
              >
                Cancel
              </Link>
            </div>

          </form>
        )}

      </div>
    </section>
  );
};

export default BookAppointment;