import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api";

const DoctorDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        console.log("Fetching doctor details for slug:", slug);
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

      </div>
    </section>
  );
};

export default DoctorDetails;