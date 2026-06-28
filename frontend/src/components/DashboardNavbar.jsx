import React from "react";

const DashboardNavbar = ({ title, subtitle }) => {
  return (
    <div className="bg-white shadow-md p-5 flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {title}
        </h2>

        <p className="text-gray-500">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">

        <button className="text-2xl">
          🔔
        </button>

        <img
          src="https://ui-avatars.com/api/?name=User"
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />

      </div>

    </div>
  );
};

export default DashboardNavbar;