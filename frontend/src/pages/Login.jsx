import React from "react";
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
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F8F5] py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#D8E5DA] p-8">

        <h1 className="text-3xl font-bold text-center text-[#0F2A18] mb-2">
          Log In
        </h1>

        <p className="text-center text-[#3A4D3E] mb-6">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Role */}
          <div>
            <label className="block mb-2 font-medium text-[#0F2A18]">
              Login as
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-[#C8D6CA] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D1E]"
              required
            >
              <option value="">Select role</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-[#0F2A18]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full border border-[#C8D6CA] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B3D1E]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-medium text-[#0F2A18]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full border border-[#C8D6CA] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B3D1E]"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#0B3D1E] text-white py-3 rounded-lg font-semibold hover:bg-[#082B15] transition-all duration-300"
          >
            Log In
          </button>

        </form>

        <p className="text-center text-sm text-[#3A4D3E] mt-6">
          Don't have an account?{" "}
          <Link
            to="/createaccount"
            className="text-[#0B3D1E] font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>

        <p className="text-center text-sm mt-4">
          <Link
            to="/"
            className="text-[#3A4D3E] hover:text-[#0B3D1E] hover:underline"
          >
            Back
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;