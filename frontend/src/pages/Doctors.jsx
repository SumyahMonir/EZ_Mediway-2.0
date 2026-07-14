import React, { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import API from "../api";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get("/doctors");
        console.log("doctors from API:", res.data); // ← add this
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section className="py-16 bg-[#F7FAF7]">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="text-3xl font-bold text-center text-[#0F2A18]">
          Our Doctors
        </h2>

        {loading && (
          <p className="text-center text-[#3A4D3E] mt-10">Loading doctors...</p>
        )}

        {error && (
          <p className="text-center text-red-500 mt-10">{error}</p>
        )}

        {!loading && !error && doctors.length === 0 && (
          <p className="text-center text-[#3A4D3E] mt-10">No doctors available right now.</p>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc._id}
              slug={doc.slug}
              image={
                doc.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0B3D1E&color=ffffff`
              }
              name={`Dr. ${doc.name}`}
              specialization={doc.specialization}
              experience={`${doc.experience} Years Experience`}
              hospital={doc.hospital}
              fee={doc.consultationFee}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Doctors;