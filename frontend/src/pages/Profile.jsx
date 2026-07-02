import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";


const Profile = () => {
  const name = localStorage.getItem("email");
  const displayName = name || "User";

  const role = localStorage.getItem("role") || "patient";
  const [profile, setProfile] = useState(null);
  const dashboardRoute =
  role === "doctor"
    ? "/doctor/dashboard"
    : "/patient/dashboard";

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const endpoint = role === "doctor" ? "/doctors/me" : "/users/me";

      const res = await API.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PROFILE DATA:", res.data);

      setProfile(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchProfile();
}, []);

  return (
    <section className="bg-[#F7FAF7] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-6">

        {/* Heading */}
        <div className="bg-white rounded-2xl shadow-md border border-[#D8E5DA] p-8">

          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Profile Image */}
            <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=0B3D1E&color=ffffff`}
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-4 border-[#D8E5DA]"
                />
            {/* <img
              src="https://ui-avatars.com/api/?name=User&background=0B3D1E&color=ffffff&size=180"
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-[#D8E5DA]"
            /> */}

            {/* Basic Info */}
            <div>

              <h2>
                {role === "doctor"
                    ? `Dr. ${profile?.Name || ""}`
                    : profile?.Name || ""}
              </h2>

              <p className="text-[#3A4D3E] mt-2">
                {role === "doctor"
                  ? "General Physician"
                  : "Patient"}
              </p>

              <p className="mt-1 text-gray-500">
                {role === "doctor"
                  ? "Apollo Hospital"
                  : "Regular Patient"}
              </p>

            </div>

          </div>

        </div>

        {/* Information */}

        <div className="bg-white rounded-2xl shadow-md border border-[#D8E5DA] p-8 mt-8">

          <h3 className="text-2xl font-bold text-[#0F2A18] mb-6">
            Personal Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">
                Full Name
              </label>

              <input
  type="text"
  value={role === "doctor" ? `Dr. ${profile?.Name || ""}` : profile?.Name || ""}
  readOnly
  className="w-full mt-2 border rounded-lg p-3"
/>
            </div>

            <div>
              <label className="font-semibold">
                Email
              </label>

              <input
                type="email"
                value={profile?.Email || ""}
                readOnly
                className="w-full mt-2 border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                Phone
              </label>

              <input
                type="text"
                value={profile?.Phone || ""}
                readOnly
                className="w-full mt-2 border rounded-lg p-3"
              />
            </div>

            {role === "patient" && (
              <>
                <div>
                  <label className="font-semibold">
                    Blood Group
                  </label>

                  <input
                    type="text"
                    value={profile?.Blood_Grp || ""}
                    readOnly
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Weight
                  </label>

                  <input
                    type="text"
                    value={profile?.Weight || ""}
                    readOnly
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Address
                  </label>

                  <input
                    type="text"
                    value="Chattogram"
                    readOnly
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>
              </>
            )}

            {role === "doctor" && (
              <>
                <div>
                  <label className="font-semibold">
                    Specialization
                  </label>

                  <input
                    type="text"
                    //value="General Physician"
                    value=""
                    
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Experience
                  </label>

                  <input
                    type="text"
                    //value="8 Years"
                    value=""

                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Hospital
                  </label>

                  <input
                    type="text"
                    //value="Apollo Hospital"
                    value=""
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    License No
                  </label>

                  <input
                    type="text"
                    value={profile?.License_no || ""}
                    readOnly
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Consultation Fee
                  </label>

                  <input
                    type="text"
                    value={profile?.Fee || ""}
                    readOnly
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="font-semibold">
                    Available Time
                  </label>

                  <input
                    type="text"
                    //value="09:00 AM - 05:00 PM"
                    value=""
                    
                    className="w-full mt-2 border rounded-lg p-3"
                  />
                </div>
              </>
            )}

          </div>

          {/* Buttons */}

          <div className="flex gap-4 mt-10">

            <button className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition">
              Edit Profile
            </button>

            <Link
                to={dashboardRoute}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                Back
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Profile;