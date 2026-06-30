import React from "react";
import { Link } from "react-router-dom";

const BookAppointment = () => {
  return (
    <section className="py-16 bg-[#F7FAF7] min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg border border-[#D8E5DA] rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-center text-[#0F2A18] mb-8">
          Book Appointment
        </h2>

        <form className="space-y-5">

          {/* Doctor */}
          <div>
            <label className="block font-semibold text-[#0F2A18] mb-2">
              Select Doctor
            </label>

            <select className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]">
              <option>Dr. Forhad Ali</option>
              <option>Dr. Alia Rahman</option>
              <option>Dr. Fatima Noor</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold text-[#0F2A18] mb-2">
              Appointment Date
            </label>

            <input
              type="date"
              className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block font-semibold text-[#0F2A18] mb-2">
              Select Time
            </label>

            <select className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]">
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>02:00 PM</option>
              <option>03:00 PM</option>
              <option>04:00 PM</option>
            </select>
          </div>

          {/* Problem */}
          <div>
            <label className="block font-semibold text-[#0F2A18] mb-2">
              Describe Your Problem
            </label>

            <textarea
              rows="4"
              placeholder="Write your health problem..."
              className="w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">

            <button
              type="submit"
              className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
            >
              Confirm Appointment
            </button>

            <Link
              to="/doctors"
              className="bg-[#EEF5EF] text-[#0F2A18] border border-[#D8E5DA] px-6 py-3 rounded-lg hover:bg-[#E4EEE5] transition-all duration-300"
            >
              Cancel
            </Link>

            <Link
              to="/doctors"
              className="bg-[#EEF5EF] text-[#0F2A18] border border-[#D8E5DA] px-6 py-3 rounded-lg hover:bg-[#E4EEE5] transition-all duration-300"
            >
              Back
            </Link>

          </div>

        </form>

      </div>
    </section>
  );
};

export default BookAppointment;