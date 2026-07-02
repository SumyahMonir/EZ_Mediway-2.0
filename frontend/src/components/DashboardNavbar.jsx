import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardNavbar = ({ title, subtitle, name, role }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = name || "User";

  // Close dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

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

        {/* Profile + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=0B3D1E&color=ffffff`}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-[#D8E5DA]"
            />

            <span className="font-medium text-[#0F2A18] hidden sm:block">
              {displayName}
            </span>

            <svg
              className={`w-4 h-4 text-[#3A4D3E] transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D8E5DA] rounded-lg shadow-lg overflow-hidden z-10">
              <div className="px-4 py-3 border-b border-[#D8E5DA]">
                <p className="font-medium text-[#0F2A18] truncate">{displayName}</p>
                {role && (
                  <p className="text-xs text-[#3A4D3E] capitalize mt-0.5">{role}</p>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-[#0F2A18] hover:bg-[#F0F5F1] transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default DashboardNavbar;