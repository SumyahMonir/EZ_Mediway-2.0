import React from 'react'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const Login = () => {

  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role) {
      setError("Please select a role");
      return;
    }

    // simple gmail validation
    if (!email.endsWith("@gmail.com")) {
      setError("Please use a valid @gmail.com email");
      return;
    }

    setError("");
    console.log({ role, email, password });

    // backend connect hole ekhane API call hobe
    alert("Login successful!");
    navigate("/"); // home page e niye jabe
  };

  return (
    <div className="py-16 flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Log In</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role */}
          <div>
            <label className="block mb-1 font-medium">Login as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className=" w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="example@gmail.com"
              required
            />
          </div>
{/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your password"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{" "}
          <Link
            to="/createaccount"
            className="text-gray-600 font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link
            to="/"
            className="text-gray-600 font-medium hover:underline"
          >
            Back
          </Link>
        </p>
        
        
      </div>
    </div>
  )
}
export default Login