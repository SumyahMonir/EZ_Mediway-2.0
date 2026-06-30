import React from "react";
import { Link } from "react-router-dom";

const DashboardSidebar = ({ role }) => {

  const dashboardLink =
    role === "doctor"
      ? "/doctor/dashboard"
      : "/patient/dashboard";

  return (
    <div className="w-64 min-h-screen bg-[#0B3D1E] text-white p-6 shadow-xl">

      <h2 className="text-2xl font-bold mb-10 border-b border-white/20 pb-4">
        EZ MediWay
      </h2>

      <nav className="space-y-3">

        <Link
          to={dashboardLink}
          className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-300"
        >
          Dashboard
        </Link>

        <Link
          to="/profile"
          className="block px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-300"
        >
          Profile
        </Link>

        <Link
          to="/"
          className="block px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-300"
        >
          Logout
        </Link>

      </nav>

    </div>
  );
};

export default DashboardSidebar;