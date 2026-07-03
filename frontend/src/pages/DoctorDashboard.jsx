import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api";


const DoctorDashboard = () => {

const [profile, setProfile] = useState(null);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await API.get("/doctors/me");

      console.log(res.data); // 👈 এখানে বসবে

      setProfile(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  fetchProfile();
}, []);

  return (
    // <div className="flex bg-[#F7FAF7] min-h-screen">
    <div className="flex bg-[#F7FAF7] pt-24 pb-10">

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Welcome */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold text-[#0F2A18]">
              Welcome, Dr. {profile?.Name || "Doctor"} 👋
            </h1>

            <p className="text-[#4A5C4F] mt-2">
              Manage your appointments, patients and availability from one place.
            </p>
          </div>

          <div className="mt-5 md:mt-0 bg-white border border-[#D8E5DA] rounded-xl px-6 py-4 shadow">
            <p className="text-sm text-gray-500">
              Today's Date
            </p>

            <h3 className="text-xl font-bold text-[#0B3D1E]">
              02 July 2026
            </h3>
          </div>

        </div>

        {/* Statistics */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Card */}

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <p className="text-gray-500">
              Today's Appointments
            </p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              08
            </h2>

            <p className="text-sm text-green-600 mt-3">
              +2 from yesterday
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <p className="text-gray-500">
              Upcoming Patients
            </p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              05
            </h2>

            <p className="text-sm text-blue-600 mt-3">
              Next 3 days
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <p className="text-gray-500">
              Available Slots
            </p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              12
            </h2>

            <p className="text-sm text-yellow-700 mt-3">
              Ready to book
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <p className="text-gray-500">
              Completed Today
            </p>

            <h2 className="text-4xl font-bold text-[#0B3D1E] mt-3">
              03
            </h2>

            <p className="text-sm text-green-600 mt-3">
              Successfully completed
            </p>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <Link
              to="#"
              className="bg-[#0B3D1E] text-white rounded-xl p-6 hover:bg-[#082B15] transition"
            >
              <h3 className="text-xl font-semibold">
                Manage Availability
              </h3>

              <p className="text-sm mt-2 text-[#D8E5DA]">
                Update your available days and time slots.
              </p>
            </Link>

            <Link
              to="#"
              className="bg-white border border-[#D8E5DA] rounded-xl p-6 hover:bg-[#EEF5EF] transition"
            >
              <h3 className="text-xl font-semibold text-[#0F2A18]">
                View Appointments
              </h3>

              <p className="text-sm mt-2 text-gray-500">
                See all upcoming appointments.
              </p>
            </Link>

            <Link
              to="/profile"
              className="bg-white border border-[#D8E5DA] rounded-xl p-6 hover:bg-[#EEF5EF] transition"
            >
              <h3 className="text-xl font-semibold text-[#0F2A18]">
                My Profile
              </h3>

              <p className="text-sm mt-2 text-gray-500">
                Update your personal information.
              </p>
            </Link>

          </div>

        </div>
                {/* Today's Appointments + Availability */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10">

          {/* Appointment Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-[#0F2A18]">
                Today's Appointments
              </h2>

              <button className="text-[#0B3D1E] font-medium hover:underline">
                View All
              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-[#D8E5DA]">

                    <th className="text-left py-3 text-[#0F2A18]">
                      Patient
                    </th>

                    <th className="text-left py-3 text-[#0F2A18]">
                      Date
                    </th>

                    <th className="text-left py-3 text-[#0F2A18]">
                      Time
                    </th>

                    <th className="text-left py-3 text-[#0F2A18]">
                      Status
                    </th>

                    <th className="text-left py-3 text-[#0F2A18]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr className="border-b border-[#EEF5EF]">

                    <td className="py-4">John Doe</td>

                    <td>02 Jul</td>

                    <td>10:00 AM</td>

                    <td>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Confirmed
                      </span>

                    </td>

                    <td>

                      <button className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15]">
                        View
                      </button>

                    </td>

                  </tr>

                  <tr className="border-b border-[#EEF5EF]">

                    <td className="py-4">Sarah Ahmed</td>

                    <td>02 Jul</td>

                    <td>11:30 AM</td>

                    <td>

                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                        Pending
                      </span>

                    </td>

                    <td>

                      <button className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15]">
                        View
                      </button>

                    </td>

                  </tr>

                  <tr>

                    <td className="py-4">Rakib Hasan</td>

                    <td>02 Jul</td>

                    <td>02:00 PM</td>

                    <td>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Confirmed
                      </span>

                    </td>

                    <td>

                      <button className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15]">
                        View
                      </button>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          {/* Availability */}

          <div className="space-y-6">

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

              <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">
                Availability
              </h2>

              <div className="space-y-3">

                <div className="flex justify-between">

                  <span>Working Days</span>

                  <span className="font-semibold">
                    Sun - Thu
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>Working Time</span>

                  <span className="font-semibold">
                    09 AM - 05 PM
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>Status</span>

                  <span className="text-green-600 font-semibold">
                    Available
                  </span>

                </div>

              </div>

              <button className="w-full mt-6 bg-[#0B3D1E] text-white py-3 rounded-xl hover:bg-[#082B15] transition">
                Edit Availability
              </button>

            </div>

            <div className="bg-[#EEF5EF] rounded-2xl border border-[#D8E5DA] p-6">

              <h3 className="text-xl font-bold text-[#0F2A18] mb-3">
                Today's Summary
              </h3>

              <p className="text-gray-700 mb-2">
                ✔ 8 Appointments Scheduled
              </p>

              <p className="text-gray-700 mb-2">
                ✔ 3 Completed
              </p>

              <p className="text-gray-700">
                ✔ 5 Remaining
              </p>

            </div>

          </div>

        </div>
                {/* Recent Patients & Notifications */}
        <div className="grid lg:grid-cols-3 gap-8 mt-10">

          {/* Recent Patients */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-[#0F2A18]">
                Recent Patients
              </h2>

              <button className="text-[#0B3D1E] font-medium hover:underline">
                View All
              </button>

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-5">

                <h3 className="text-lg font-bold text-[#0F2A18]">
                  John Doe
                </h3>

                <p className="text-[#3A4D3E] mt-2">
                  General Checkup
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Last Visit: 20 June 2026
                </p>

              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-5">

                <h3 className="text-lg font-bold text-[#0F2A18]">
                  Sarah Ahmed
                </h3>

                <p className="text-[#3A4D3E] mt-2">
                  Heart Consultation
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Last Visit: 18 June 2026
                </p>

              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-5">

                <h3 className="text-lg font-bold text-[#0F2A18]">
                  Rakib Hasan
                </h3>

                <p className="text-[#3A4D3E] mt-2">
                  Follow-up Visit
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Last Visit: 15 June 2026
                </p>

              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-5">

                <h3 className="text-lg font-bold text-[#0F2A18]">
                  Fatema Begum
                </h3>

                <p className="text-[#3A4D3E] mt-2">
                  Diabetes Consultation
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Last Visit: 12 June 2026
                </p>

              </div>

            </div>

          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6">

            <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">
              Notifications
            </h2>

            <div className="space-y-4">

              <div className="border-l-4 border-green-600 bg-[#EEF5EF] p-4 rounded-lg">
                <p className="font-medium text-[#0F2A18]">
                  New Appointment
                </p>

                <p className="text-sm text-gray-600">
                  John Doe booked an appointment.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-lg">
                <p className="font-medium text-[#0F2A18]">
                  Schedule Reminder
                </p>

                <p className="text-sm text-gray-600">
                  Update your availability for next week.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-[#0F2A18]">
                  Patient Message
                </p>

                <p className="text-sm text-gray-600">
                  Sarah Ahmed sent you a message.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;