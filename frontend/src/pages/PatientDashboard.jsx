import React from "react";
import DashboardSidebar from "../components/DashboardSidebar";
// import DashboardNavbar from "../components/DashboardNavbar";

const PatientDashboard = () => {
  return (
    <div className="flex bg-[#F7FAF7] min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar role="patient" />

      {/* Main Content */}
      <div className="flex-1">

        {/* <DashboardNavbar
          title="Patient Dashboard"
          subtitle="Welcome to EZ MediWay"
        /> */}

        <div className="p-8">

          {/* Welcome */}
          <h2 className="text-3xl font-bold text-[#0F2A18]">
            Welcome, Patient
          </h2>

          <p className="text-[#3A4D3E] mt-2">
            Manage your appointments and profile here.
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Upcoming Appointment
              </h3>

              <p className="mt-4 text-[#3A4D3E]">
                Dr. Forhad Ali
              </p>

              <p className="text-sm text-[#6B7B6E]">
                10 July 2026
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Total Appointments
              </h3>

              <p className="text-3xl font-bold text-[#0B3D1E] mt-4">
                12
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Completed Visits
              </h3>

              <p className="text-3xl font-bold text-[#2E7D32] mt-4">
                8
              </p>
            </div>

          </div>
                    {/* Appointment History */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mt-8">

            <h3 className="text-2xl font-bold text-[#0F2A18] mb-4">
              Appointment History
            </h3>

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-[#D8E5DA]">
                  <th className="py-3 text-[#0F2A18]">Doctor</th>
                  <th className="text-[#0F2A18]">Date</th>
                  <th className="text-[#0F2A18]">Status</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b border-[#D8E5DA]">
                  <td className="py-3 text-[#3A4D3E]">Dr. Alia Rahman</td>
                  <td className="text-[#3A4D3E]">20 June 2026</td>
                  <td className="text-[#2E7D32] font-medium">Completed</td>
                </tr>

                <tr className="border-b border-[#D8E5DA]">
                  <td className="py-3 text-[#3A4D3E]">Dr. Fatima Noor</td>
                  <td className="text-[#3A4D3E]">15 June 2026</td>
                  <td className="text-[#2E7D32] font-medium">Completed</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Recent Doctors */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mt-8">

            <h3 className="text-2xl font-bold text-[#0F2A18] mb-4">
              Recent Doctors
            </h3>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4">
                <h4 className="font-semibold text-[#0F2A18]">
                  Dr. Forhad Ali
                </h4>

                <p className="text-[#3A4D3E]">
                  General Physician
                </p>
              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4">
                <h4 className="font-semibold text-[#0F2A18]">
                  Dr. Alia Rahman
                </h4>

                <p className="text-[#3A4D3E]">
                  Cardiologist
                </p>
              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4">
                <h4 className="font-semibold text-[#0F2A18]">
                  Dr. Fatima Noor
                </h4>

                <p className="text-[#3A4D3E]">
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

export default PatientDashboard