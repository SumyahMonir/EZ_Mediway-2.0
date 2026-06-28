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
    <div className="bg-sky-50 rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300">
      <img
        src={image}
        alt={name}
        className="w-32 h-32 rounded-full mx-auto object-cover"
      />

      <h2 className="text-xl font-bold text-center mt-4">
        {name}
      </h2>

      <p className="text-center text-gray-500 font-medium">
        {specialization}
      </p>

      <p className="text-center text-gray-600 mt-2">
        {experience}
      </p>

      <p className="text-center text-gray-600">
        {hospital}
      </p>

      <p className="text-center font-semibold mt-2">
        Fee: BDT {fee}
      </p>

      <div className="mt-5 text-center">
        <Link
          to={`/doctors/${id}`}
          className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;