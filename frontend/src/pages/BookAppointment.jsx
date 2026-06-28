import React from "react";
import { Link } from "react-router-dom";

const BookAppointment = () => {
  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto bg-sky-50 shadow-lg rounded-xl p-8">

        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
          Book Appointment
        </h2>

        <form className="space-y-5">

          {/* Doctor */}
          <div>
            <label className="block font-semibold mb-2">
              Select Doctor
            </label>

            <select className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400">
              <option>Dr. Forhad Ali</option>
              <option>Dr. Alia Rahman</option>
              <option>Dr. Fatima Noor</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold mb-2">
              Appointment Date
            </label>

            <input
              type="date"
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block font-semibold mb-2">
              Select Time
            </label>

            <select className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400">
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
            <label className="block font-semibold mb-2">
              Describe Your Problem
            </label>

            <textarea
              rows="4"
              placeholder="Write your health problem..."
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 pt-4">

            <button
              type="submit"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition"
            >
              Confirm Appointment
            </button>

            <Link
              to="/doctors"
              className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </Link>
            <Link
            to="/doctors"
            className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
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