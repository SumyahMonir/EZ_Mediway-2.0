import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api";

const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

const DoctorDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/doctors/slug/${slug}`);
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
        setError("Doctor not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [slug]);

  // Fetch the weekly schedule once we know the doctor's real id
  useEffect(() => {
    if (!doctor?._id) return;

    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const res = await API.get(`/availability/${doctor._id}`);
        setAvailability(res.data);
      } catch (err) {
        console.error(err);
        setAvailability({ schedule: [] });
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [doctor?._id]);

  const fallbackAvatar = doctor
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0B3D1E&color=ffffff&size=256`
    : "";

  const handleBookAppointment = () => {
    // pre-select this doctor on the booking page
    navigate(`/book-appointment?doctorId=${doctor._id}`);
  };

  if (loading) {
    return (
      <p className="text-center text-[#3A4D3E] mt-20">Loading doctor details...</p>
    );
  }

  if (error || !doctor) {
    return (
      <h2 className="text-center text-2xl mt-20 text-red-500">
        Doctor Not Found
      </h2>
    );
  }

  return (
    <section className="py-16 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-5xl mx-auto px-6">

        <h2 className="text-3xl font-bold text-center text-[#0F2A18] mb-10">
          Doctor Details
        </h2>

        <div className="bg-white rounded-2xl shadow-lg border border-[#D8E5DA] p-8 grid md:grid-cols-2 gap-8">

          <div className="flex justify-center">
            <img
              src={doctor.profileImage || fallbackAvatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackAvatar;
              }}
              alt={doctor.name}
              className="w-64 h-64 rounded-xl object-cover shadow-md"
            />
          </div>

          <div className="space-y-3">

            <h3 className="text-3xl font-bold text-[#0F2A18]">
              Dr. {doctor.name}
            </h3>

            <p className="text-[#0B3D1E] font-semibold">
              {doctor.professionalTitle}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">Specialization:</span>{" "}
              {doctor.specialization}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">Qualifications:</span>{" "}
              {(doctor.qualifications || []).join(", ")}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">Experience:</span>{" "}
              {doctor.experience} Years
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">Hospital:</span>{" "}
              {doctor.hospital}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">Consultation Fee:</span>{" "}
              BDT {doctor.consultationFee}
            </p>

            {doctor.languages?.length > 0 && (
              <p className="text-[#3A4D3E]">
                <span className="font-semibold text-[#0F2A18]">Languages:</span>{" "}
                {doctor.languages.join(", ")}
              </p>
            )}

            {doctor.description && (
              <p className="text-[#3A4D3E] pt-2 leading-relaxed">
                {doctor.description}
              </p>
            )}

            <div className="pt-6 flex gap-4">

              <button
                onClick={handleBookAppointment}
                className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
              >
                Book Appointment
              </button>

              <Link
                to="/doctors"
                className="bg-[#EEF5EF] text-[#0F2A18] px-6 py-3 rounded-lg border border-[#D8E5DA] hover:bg-[#E4EEE5] transition-all duration-300"
              >
                Back
              </Link>

            </div>

          </div>

        </div>

        {/* Weekly availability — same layout style as BookAppointment.jsx */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#D8E5DA] p-8 mt-8">
          <h3 className="text-2xl font-bold text-[#0F2A18] mb-6">Available Slots</h3>

          {loadingAvailability ? (
            <p className="text-[#6B7B6E]">Loading availability...</p>
          ) : (
            <div className="space-y-3">
              {DAY_ORDER.map((dayName) => {
                const day = (availability?.schedule || []).find((d) => d.day === dayName);

                return (
                  <div key={dayName} className="border rounded-lg p-3 bg-[#F7FAF7]">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-[#0F2A18]">{dayName}</p>
                      {!day?.slots?.length && (
                        <span className="text-red-500 text-sm font-medium">Not Available</span>
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

      </div>
    </section>
  );
};

export default DoctorDetails;