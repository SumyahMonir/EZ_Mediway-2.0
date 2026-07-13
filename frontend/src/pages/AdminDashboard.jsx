import React from "react";


const AdminDashboard = () => {


  // Later API থেকে আসবে
  const stats = {
    totalDoctors: 25,
    pendingDoctors: 6,
    verifiedDoctors: 19,
    totalPatients: 150,
  };

  // Later backend থেকে আসবে
  const pendingDoctors = [
    {
      id:1,
      name:"Dr. Rahim Ahmed",
      specialization:"Cardiologist",
      hospital:"Chittagong Medical College",
      experience:"8 years",
    },

    {
      id:2,
      name:"Dr. Nusrat Jahan",
      specialization:"Dermatologist",
      hospital:"Evercare Hospital",
      experience:"5 years",
    },

    {
      id:3,
      name:"Dr. Fahim Hasan",
      specialization:"Neurologist",
      hospital:"Apollo Hospital",
      experience:"10 years",
    }
  ];


  return (

    <section className="bg-[#F7FAF7] min-h-screen py-10">

      <div className="max-w-7xl mx-auto px-6">


        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-[#0F2A18]">
            Admin Dashboard
          </h1>

          <p className="text-[#3A4D3E] mt-2">
            Manage doctors, patients and system activities.
          </p>

        </div>


        {/* Statistics Cards */}


        <div className="grid md:grid-cols-4 gap-6">


          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">

            <h3 className="text-[#3A4D3E] font-medium">
              Total Doctors
            </h3>

            <p className="text-3xl font-bold text-[#0B3D1E] mt-3">
              {stats.totalDoctors}
            </p>

          </div>

          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">

            <h3 className="text-[#3A4D3E] font-medium">
              Pending Approval
            </h3>

            <p className="text-3xl font-bold text-yellow-600 mt-3">
              {stats.pendingDoctors}
            </p>

          </div>


          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">

            <h3 className="text-[#3A4D3E] font-medium">
              Verified Doctors
            </h3>

            <p className="text-3xl font-bold text-green-700 mt-3">
              {stats.verifiedDoctors}
            </p>

          </div>

          <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6">

            <h3 className="text-[#3A4D3E] font-medium">
              Total Patients
            </h3>

            <p className="text-3xl font-bold text-[#0B3D1E] mt-3">
              {stats.totalPatients}
            </p>

          </div>


        </div>

        {/* Pending Doctor Approval */}


        <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6 mt-10">


          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold text-[#0F2A18]">
              Pending Doctor Approvals
            </h2>


            <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
              {pendingDoctors.length} Pending
            </span>


          </div>


          <div className="overflow-x-auto">


          <table className="w-full text-left">


            <thead>

              <tr className="border-b border-[#D8E5DA]">

                <th className="py-3 text-[#0F2A18]">
                  Doctor
                </th>

                <th className="text-[#0F2A18]">
                  Specialization
                </th>

                <th className="text-[#0F2A18]">
                  Hospital
                </th>

                <th className="text-[#0F2A18]">
                  Experience
                </th>

                <th className="text-[#0F2A18]">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>


            {
              pendingDoctors.map((doctor)=>(


                <tr 
                key={doctor.id}
                className="border-b border-[#D8E5DA]"
                >


                  <td className="py-4 text-[#3A4D3E] font-medium">

                    {doctor.name}

                  </td>

                  <td className="text-[#3A4D3E]">

                    {doctor.specialization}

                  </td>

                  <td className="text-[#3A4D3E]">

                    {doctor.hospital}

                  </td>

                  <td className="text-[#3A4D3E]">

                    {doctor.experience}

                  </td>

                  <td>

                    <div className="flex gap-3">

                    <button
                    className="bg-[#0B3D1E] text-white px-4 py-2 rounded-lg hover:bg-[#082B15]"
                    >
                      Approve
                    </button>

                    <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>

                    </div>

                  </td>

                </tr>

              ))
            }

            </tbody>

          </table>

          </div>

        </div>

        {/* Recent Activity */}


        <div className="bg-white border border-[#D8E5DA] shadow-md rounded-2xl p-6 mt-10">


          <h2 className="text-2xl font-bold text-[#0F2A18] mb-5">
            Recent Activities
          </h2>

          <div className="space-y-4">


            <div className="bg-[#EEF5EF] p-4 rounded-xl">

              New doctor registration request received.

            </div>

            <div className="bg-[#EEF5EF] p-4 rounded-xl">

              10 appointments completed today.

            </div>

            <div className="bg-[#EEF5EF] p-4 rounded-xl">

              5 new patients joined EZ MediWay.

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default AdminDashboard;