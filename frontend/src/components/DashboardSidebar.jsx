import React from "react";
import { Link } from "react-router-dom";


const DashboardSidebar = ({ role }) => {
    
const dashboardLink =
  role === "doctor"
    ? "/doctor/dashboard"
    : "/patient/dashboard";

  return (
    <div className="w-64 min-h-screen bg-sky-700 text-white p-6">

      <h2 className="text-2xl font-bold mb-10">
        EZ MediWay
      </h2>

      <nav className="space-y-4">

        <Link
          to="/patient/dashboard"
          className="block px-4 py-3 rounded-lg hover:bg-sky-600 transition"
        >
          Dashboard
        </Link>

        <Link
          to="/profile"
          className="block px-4 py-3 rounded-lg hover:bg-sky-600 transition"
        >
          Profile
        </Link>

        <Link
          to="/"
          className="block px-4 py-3 rounded-lg hover:bg-red-500 transition"
        >
          Logout
        </Link>

      </nav>

      

    </div>
  );
};

export default DashboardSidebar;