import React, { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import API from "../api";

const DAY_ABBR = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };
const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({}); // doctorId -> ["Sun", "Wed", ...]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get("/doctors");
        setDoctors(res.data);

        // Fetch each doctor's weekly schedule in parallel and reduce it
        // down to just the abbreviated day names that have slots — that's
        // all the card needs to show.
        const results = await Promise.all(
          (res.data || []).map((doc) =>
            API.get(`/availability/${doc._id}`)
              .then((availRes) => ({
                id: doc._id,
                days: DAY_ORDER
                  .filter((day) => (availRes.data?.schedule || []).some((e) => e.day === day && e.slots?.length > 0))
                  .map((day) => DAY_ABBR[day]),
              }))
              .catch(() => ({ id: doc._id, days: [] }))
          )
        );

        const map = {};
        results.forEach((r) => { map[r.id] = r.days; });
        setAvailabilityMap(map);
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
              availableDays={availabilityMap[doc._id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Doctors;