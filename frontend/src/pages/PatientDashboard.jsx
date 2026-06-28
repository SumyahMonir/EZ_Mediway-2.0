import React from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardNavbar from "../components/DashboardNavbar";

const Dashboard = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar role="patient" />

      {/* Main Content */}
      <div className="flex-1">

        <DashboardNavbar
    title="Patient Dashboard"
    subtitle="Welcome to EZ MediWay"
        />

        <div className="p-8">

          {/* Welcome */}
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome, Patient 👋
          </h2>
          <p className="text-gray-500 mt-2">
            Manage your appointments and profile here.
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">
                Upcoming Appointment
              </h3>

              <p className="mt-4 text-gray-600">
                Dr. Forhad Ali
              </p>

              <p className="text-sm text-gray-500">
                10 July 2026
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">
                Total Appointments
              </h3>

              <p className="text-3xl font-bold text-sky-600 mt-4">
                12
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold">
                Completed Visits
              </h3>

              <p className="text-3xl font-bold text-green-600 mt-4">
                8
              </p>
            </div>

          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h3 className="text-2xl font-bold mb-4">
              Appointment History
            </h3>

            <table className="w-full text-left">

              <thead>
                <tr className="border-b">
                  <th className="py-3">Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b">
                  <td className="py-3">Dr. Alia Rahman</td>
                  <td>20 June 2026</td>
                  <td className="text-green-600">Completed</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3">Dr. Fatima Noor</td>
                  <td>15 June 2026</td>
                  <td className="text-green-600">Completed</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Recent Doctors */}
          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h3 className="text-2xl font-bold mb-4">
              Recent Doctors
            </h3>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-sky-50 rounded-lg p-4">
                <h4 className="font-semibold">
                  Dr. Forhad Ali
                </h4>

                <p className="text-gray-600">
                  General Physician
                </p>
              </div>

              <div className="bg-sky-50 rounded-lg p-4">
                <h4 className="font-semibold">
                  Dr. Alia Rahman
                </h4>

                <p className="text-gray-600">
                  Cardiologist
                </p>
              </div>

              <div className="bg-sky-50 rounded-lg p-4">
                <h4 className="font-semibold">
                  Dr. Fatima Noor
                </h4>

                <p className="text-gray-600">
                  Pediatrician
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;