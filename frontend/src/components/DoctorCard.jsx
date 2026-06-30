import React from "react";
import { Link } from "react-router-dom";

const DoctorCard = ({
  id,
  image,
  name,
  specialization,
  experience,
  hospital,
  fee,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#D8E5DA] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <img
        src={image}
        alt={name}
        className="w-32 h-32 rounded-full mx-auto object-cover shadow-md border-4 border-[#EEF5EF]"
      />

      <h2 className="text-xl font-bold text-center mt-4 text-[#0F2A18]">
        {name}
      </h2>

      <p className="text-center text-[#0B3D1E] font-semibold">
        {specialization}
      </p>

      <p className="text-center text-[#3A4D3E] mt-3">
        {experience}
      </p>

      <p className="text-center text-[#3A4D3E]">
        {hospital}
      </p>

      <p className="text-center font-semibold text-[#0F2A18] mt-3">
        Fee: BDT {fee}
      </p>

      <div className="mt-6 text-center">
        <Link
          to={`/doctors/${id}`}
          className="inline-block bg-[#0B3D1E] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;