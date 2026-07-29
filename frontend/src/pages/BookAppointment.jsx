import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

// The backend's status enum is: "pending", "confirmed", "not_available",
// "completed", "Cancelled" (only Cancelled is capitalized — that's how
// it's defined in the Appointment schema). Compare against these exact
// values; formatStatus() is only for what's shown on screen.
const formatStatus = (status) => {
  if (!status) return "Pending";
  if (status === "not_available") return "Not Available";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const preselectedDoctorId = searchParams.get("doctorId");

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [doctorId, setDoctorId] = useState(preselectedDoctorId || "");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);

  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  // Holds the confirmed booking once it succeeds. While this is set,
  // we show the status card instead of the form.
  const [bookedAppointment, setBookedAppointment] = useState(null);

  const token = localStorage.getItem("token");

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

  

  // Check if the patient already has an active (non-cancelled) booking
  // for this doctor, so the status card shows up on reload instead of
  // letting them book a duplicate appointment.
  useEffect(() => {
    if (!token || !doctorId) return;

    const checkExisting = async () => {
      try {
        setCheckingExisting(true);
        const res = await API.get("/appointments/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const existing = (res.data || [])
          .filter(
            (appt) =>
              extractDoctorId(appt) === doctorId && appt.status !== "Cancelled"
          )
          .sort(
            (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          )[0];

        if (existing) {
          const doctorInfo = extractDoctorInfo(existing);
          setBookedAppointment({
            id: existing._id || existing.id,
            doctorName: doctorInfo.name,
            specialization: doctorInfo.specialization,
            doctorSlug: doctorInfo.slug,
            date: existing.date,
            timeSlot: existing.timeSlot,
            status: existing.status || "pending",
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
  }, [token, doctorId, doctors.length]);

  //new
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!doctorId || !date || !timeSlot) {
  //     return setError("Please fill in all fields.");
  //   }

  //   try {
  //     setSubmitting(true);
  //     setError("");

  //     const res = await API.post(
  //       "/appointments",
  //       { doctorId, date, timeSlot },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     // Adjust these field names if your API returns something different
  //     // (e.g. res.data.appointment._id instead of res.data._id).
  //     const created = res.data;

  //     setBookedAppointment({
  //       id: created._id || created.id,
  //       doctorName: selectedDoctor?.name || created.doctorName,
  //       specialization: selectedDoctor?.specialization || created.specialization,
  //       doctorSlug: selectedDoctor?.slug || created.doctorSlug,
  //       date,
  //       timeSlot,
  //       status: created.status || "pending",
  //     });


  //   } catch (err) {
  //     console.error(err);
  //     setError(err.response?.data?.error || "Failed to book appointment.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId || !date || !timeSlot) {
      return setError("Please fill in all fields.");
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
          consultationFee: selectedDoctor.consultationFee,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  // Prevent picking a past date
  const today = new Date().toISOString().split("T")[0];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
    not_available: "bg-gray-100 text-gray-700 border-gray-300",
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
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    statusColors[bookedAppointment.status] ||
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
              {bookedAppointment.status !== "Cancelled" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
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
            </div>

            {/* Time */}
            <div>
              <label className="block font-semibold text-[#0F2A18] mb-2">
                Select Time
              </label>

              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
                required
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Fee */}
              {selectedDoctor && (
                <div className="border border-[#D8E5DA] rounded-lg p-4 bg-[#F7FAF7] flex justify-between items-center">
                  <span className="font-semibold text-[#0F2A18]">Consultation Fee</span>
                  <span className="text-[#0B3D1E] font-bold text-lg">
                    BDT {selectedDoctor.consultationFee}
                  </span>
                </div>
              )}

            {/* payment */}
          <div>
            <label className="block font-semibold text-[#0F2A18] mb-2">
              Payment Method
            </label>

            <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer">
              <input
                type="radio"
                
                readOnly
              />

              <span>bKash</span>
            </label>
          </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || loadingDoctors || !selectedDoctor}
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