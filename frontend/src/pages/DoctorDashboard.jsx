import React from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardNavbar from "../components/DashboardNavbar";

const DoctorDashboard = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar role="doctor" />

      {/* Main Content */}
      <div className="flex-1">

        <DashboardNavbar
          title="Doctor Dashboard"
          subtitle="Manage your appointments"
        />

        <div className="p-8">

          {/* Welcome */}
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome, Doctor 👨‍⚕️
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your appointments and availability.
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">
                Today's Appointments
              </h3>

              <p className="text-3xl font-bold text-sky-600 mt-4">
                8
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">
                Upcoming Patients
              </h3>

              <p className="text-3xl font-bold text-green-600 mt-4">
                5
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">
                Available Slots
              </h3>

              <p className="text-3xl font-bold text-orange-500 mt-4">
                12
              </p>
            </div>

          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h3 className="text-2xl font-bold mb-4">
              Today's Appointments
            </h3>

            <table className="w-full text-left">

              <thead>
                <tr className="border-b">
                  <th className="py-3">Patient</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="py-3">John Doe</td>
                  <td>10:00 AM</td>
                  <td className="text-green-600">Confirmed</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Sarah Ahmed</td>
                  <td>11:30 AM</td>
                  <td className="text-green-600">Confirmed</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Rakib Hasan</td>
                  <td>02:00 PM</td>
                  <td className="text-yellow-600">Pending</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h3 className="text-2xl font-bold mb-4">
              Recent Patients
            </h3>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-sky-50 rounded-lg p-4">
                <h4 className="font-semibold">
                  John Doe
                </h4>

                <p className="text-gray-600">
                  General Checkup
                </p>
              </div>

              <div className="bg-sky-50 rounded-lg p-4">
                <h4 className="font-semibold">
                  Sarah Ahmed
                </h4>

                <p className="text-gray-600">
                  Heart Consultation
                </p>
              </div>

              <div className="bg-sky-50 rounded-lg p-4">
                <h4 className="font-semibold">
                  Rakib Hasan
                </h4>

                <p className="text-gray-600">
                  Follow-up Visit
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