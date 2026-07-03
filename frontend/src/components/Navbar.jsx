import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo1_green.png'
import DoctorDashboard from '../pages/DoctorDashboard';
import API from "../api";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  const role = localStorage.getItem("role");

  const [profile, setProfile] = useState(null);
  //const displayName = profile?.Name || "User";
  const name = localStorage.getItem("email");
  const displayName = name || "User";

  const isLoggedIn = Boolean(token);

  useEffect(() => {
  if (!token) return;

  const fetchProfile = async () => {
    try {
      const endpoint = role === "doctor" ? "/doctors/me" : "/users/me";

      const res = await API.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchProfile();
}, [token, role]);

  // Close profile dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setProfileOpen(false);
    setIsOpen(false);
    navigate("/login");
  };
  const handleDashboard = () => {
  setProfileOpen(false);
  setIsOpen(false);

  if (role === "doctor") {
    navigate("/doctor/dashboard");
  } else {
    navigate("/patient/dashboard");
  }
};

const handleProfile = () => {
  setProfileOpen(false);
  setIsOpen(false);

  if (role === "doctor") {
    navigate("/profile");
  } else {
    navigate("/profile");
  }
};


  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="EZ MediWay" className="w-auto h-8" />
          <span className="text-xl font-bold text-[#0F2A18]">EZ MediWay</span>
        </div>

        {/* Menu */}
        <ul className="hidden md:flex items-center gap-8 font-medium text-[#0F2A18]">
          <li><Link to="/home" className="hover:text-[#0B3D1E]">Home</Link></li>
          <li><Link to="/about" className="hover:text-[#0B3D1E]">About</Link></li>
          <li><Link to="/doctors" className="hover:text-[#0B3D1E]">Doctors</Link></li>
          <li><Link to="/contact" className="hover:text-[#0B3D1E]">Contact</Link></li>
          {!isLoggedIn && (
            <li><Link to="/login" className="hover:text-[#0B3D1E]">Log in</Link></li>
          )}
        </ul>

        {/* CTA Button / Profile */}
        <div className="hidden md:block">
          {!isLoggedIn ? (
            <Link
              to="/CreateAccount"
              className="bg-[#0B3D1E] text-white px-5 py-2 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
            >
              Create Account
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=0B3D1E&color=ffffff`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-[#D8E5DA]"
                />

                <span className="font-medium text-[#0F2A18]">
                  {displayName}
                </span>

                <svg
                  className={`w-4 h-4 text-[#3A4D3E] transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
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

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D8E5DA] rounded-lg shadow-lg overflow-hidden z-10">
                  <div className="px-4 py-3 border-b border-[#D8E5DA]">
                    <p className="font-medium text-[#0F2A18] truncate">{displayName}</p>
                    {role && (
                      <p className="text-xs text-[#3A4D3E] capitalize mt-0.5">{role}</p>
                    )}
                  </div>

                  <button
                    onClick={handleDashboard}
                    className="w-full text-left px-4 py-3 text-[#0F2A18] hover:bg-[#F0F5F1] transition-colors duration-200"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={handleProfile}
                    className="w-full text-left px-4 py-3 text-[#0F2A18] hover:bg-[#F0F5F1] transition-colors duration-200"
                  >
                    Profile
                  </button>
                    
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-[#0F2A18] hover:bg-[#F0F5F1] transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl text-[#0F2A18]"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-4 text-[#0F2A18]">
          <Link to="/home" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/doctors" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Doctors
          </Link>
          <Link to="/contact" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          {!isLoggedIn ? (
            <>
              <Link to="/login" className="hover:text-[#0B3D1E] block py-2" onClick={() => setIsOpen(false)}>
                Log in
              </Link>

              <Link
                to="/CreateAccount"
                className="block mt-2 bg-[#0B3D1E] text-white text-center py-2 rounded-lg shadow-md hover:bg-[#082B15] transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Create Account
              </Link>
            </>
          ) : (
            <div className="mt-2 border-t border-[#D8E5DA] pt-3">
              <div className="flex items-center gap-3 py-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=0B3D1E&color=ffffff`}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-[#D8E5DA]"
                />
                <div>
                  <p className="font-medium text-[#0F2A18]">{displayName}</p>
                  {role && (
                    <p className="text-xs text-[#3A4D3E] capitalize">{role}</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleDashboard}
                className="w-full text-left py-2 text-[#0F2A18] hover:text-[#0B3D1E]"
              >
                Dashboard
              </button>

              <button
                onClick={handleProfile}
                className="w-full text-left py-2 text-[#0F2A18] hover:text-[#0B3D1E]"
              >
                Profile
              </button>
              
          {/* <button onClick={handleDashboard} 
          className="w-full text-left py-2 text-[#0F2A18] hover:text-[#0B3D1E]">
            <Link to="/doctor/dashboard" className="hover:text-[#0B3D1E]">
            Dashboard
            </Link>
            </button>

          <button onClick={handleProfile}
          className="w-full text-left py-2 text-[#0F2A18] hover:text-[#0B3D1E]">
            <Link to="/" className="hover:text-[#0B3D1E]">
            Profile
            </Link>
            </button> */}

              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-[#0F2A18] hover:text-[#0B3D1E]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar;