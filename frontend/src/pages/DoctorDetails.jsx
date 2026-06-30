import React from "react";
import { Link, useParams } from "react-router-dom";

import doc1 from "../assets/images/doc1.png";
import doc2 from "../assets/images/doc2.png";
import doc3 from "../assets/images/doc3.png";

const doctors = [
  {
    id: 1,
    image: doc1,
    name: "Dr. Forhad Ali",
    specialization: "General Physician",
    experience: "8 Years",
    hospital: "Apollo Hospital",
    fee: 800,
    days: "Sunday -Thursday",
    time: "10:00 AM - 4:00 PM",
    description:
      "Experienced General Physician dedicated to providing quality healthcare.",
  },
  {
    id: 2,
    image: doc2,
    name: "Dr. Alia Rahman",
    specialization: "Cardiologist",
    experience: "10 Years",
    hospital: "Square Hospital",
    fee: 1200,
    days: "Saturday - Wednesday",
    time: "9:00 AM - 3:00 PM",
    description:
      "Experienced Cardiologist specializing in heart disease diagnosis and treatment.",
  },
  {
    id: 3,
    image: doc3,
    name: "Dr. Fatima Noor",
    specialization: "Pediatrician",
    experience: "6 Years",
    hospital: "Evercare Hospital",
    fee: 700,
    days: "Sunday - Thursday",
    time: "11:00 AM - 5:00 PM",
    description:
      "Dedicated Pediatrician providing complete child healthcare services.",
  },
];

const DoctorDetails = () => {
  const { id } = useParams();

  const doctor = doctors.find((doc) => doc.id === Number(id));

  if (!doctor) {
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
              src={doctor.image}
              alt={doctor.name}
              className="w-64 h-64 rounded-xl object-cover shadow-md"
            />
          </div>

          <div className="space-y-3">

            <h3 className="text-3xl font-bold text-[#0F2A18]">
              {doctor.name}
            </h3>

            <p className="text-[#0B3D1E] font-semibold">
              {doctor.specialization}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">
                Experience:
              </span>{" "}
              {doctor.experience}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">
                Hospital:
              </span>{" "}
              {doctor.hospital}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">
                Consultation Fee:
              </span>{" "}
              BDT {doctor.fee}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">
                Available Days:
              </span>{" "}
              {doctor.days}
            </p>

            <p className="text-[#3A4D3E]">
              <span className="font-semibold text-[#0F2A18]">
                Available Time:
              </span>{" "}
              {doctor.time}
            </p>

            <p className="text-[#3A4D3E] pt-2 leading-relaxed">
              {doctor.description}
            </p>

            <div className="pt-6 flex gap-4">

              <Link
                to="/book-appointment"
                className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
              >
                Book Appointment
              </Link>

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