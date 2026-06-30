import React from "react";
import DashboardSidebar from "../components/DashboardSidebar";
// import DashboardNavbar from "../components/DashboardNavbar";

const DoctorDashboard = () => {
  return (
    <div className="flex bg-[#F7FAF7] min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar role="doctor" />

      {/* Main Content */}
      <div className="flex-1">

        {/* <DashboardNavbar
          title="Doctor Dashboard"
          subtitle="Manage your appointments"
        /> */}

        <div className="p-8">

          {/* Welcome */}
          <h2 className="text-3xl font-bold text-[#0F2A18]">
            Welcome, Doctor
          </h2>

          <p className="text-[#3A4D3E] mt-2">
            Manage your appointments and availability.
          </p>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Today's Appointments
              </h3>

              <p className="text-3xl font-bold text-[#0B3D1E] mt-4">
                8
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Upcoming Patients
              </h3>

              <p className="text-3xl font-bold text-[#2E7D32] mt-4">
                5
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F2A18]">
                Available Slots
              </h3>

              <p className="text-3xl font-bold text-[#C77D00] mt-4">
                12
              </p>
            </div>

          </div>
                    {/* Today's Appointments */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mt-8">

            <h3 className="text-2xl font-bold text-[#0F2A18] mb-4">
              Today's Appointments
            </h3>

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-[#D8E5DA]">
                  <th className="py-3 text-[#0F2A18]">Patient</th>
                  <th className="text-[#0F2A18]">Time</th>
                  <th className="text-[#0F2A18]">Status</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-b border-[#D8E5DA]">
                  <td className="py-3 text-[#3A4D3E]">John Doe</td>
                  <td className="text-[#3A4D3E]">10:00 AM</td>
                  <td className="text-[#2E7D32] font-medium">Confirmed</td>
                </tr>

                <tr className="border-b border-[#D8E5DA]">
                  <td className="py-3 text-[#3A4D3E]">Sarah Ahmed</td>
                  <td className="text-[#3A4D3E]">11:30 AM</td>
                  <td className="text-[#2E7D32] font-medium">Confirmed</td>
                </tr>

                <tr className="border-b border-[#D8E5DA]">
                  <td className="py-3 text-[#3A4D3E]">Rakib Hasan</td>
                  <td className="text-[#3A4D3E]">02:00 PM</td>
                  <td className="text-[#C77D00] font-medium">Pending</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl border border-[#D8E5DA] shadow-md p-6 mt-8">

            <h3 className="text-2xl font-bold text-[#0F2A18] mb-4">
              Recent Patients
            </h3>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4">
                <h4 className="font-semibold text-[#0F2A18]">
                  John Doe
                </h4>

                <p className="text-[#3A4D3E]">
                  General Checkup
                </p>
              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4">
                <h4 className="font-semibold text-[#0F2A18]">
                  Sarah Ahmed
                </h4>

                <p className="text-[#3A4D3E]">
                  Heart Consultation
                </p>
              </div>

              <div className="bg-[#EEF5EF] rounded-xl border border-[#D8E5DA] p-4">
                <h4 className="font-semibold text-[#0F2A18]">
                  Rakib Hasan
                </h4>

                <p className="text-[#3A4D3E]">
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