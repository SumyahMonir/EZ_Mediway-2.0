import React from "react";

const DashboardNavbar = ({ title, subtitle }) => {
  return (
    <div className="bg-white border-b border-[#D8E5DA] shadow-sm p-5 flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-bold text-[#0F2A18]">
          {title}
        </h2>

        <p className="text-[#3A4D3E]">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">

        <button className="text-2xl text-[#0B3D1E] hover:scale-110 transition-all duration-300">
          🔔
        </button>

        <img
          src="https://ui-avatars.com/api/?name=User&background=0B3D1E&color=ffffff"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-[#D8E5DA]"
        />

      </div>

    </div>
  );
};

export default DashboardNavbar;