import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

const Login = () => {
  const navigate = useNavigate();

  // Step 1 = role, Step 2 = email + password
  const [step, setStep] = useState(1);

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "w-full border border-[#C8D6CA] rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D1E]";

  const goToCredentialsStep = () => {
    if (!role) {
      return setError("Please select a role");
    }
    setError("");
    setStep(2);
  };

  const goBack = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@gmail.com")) {
      return setError("Please use a valid @gmail.com email");
    }

    if (!password) {
      return setError("Please enter your password");
    }

    try {
      setError("");

      const res = await API.post("/auth/login", {
        Email: email,
        Password: password,
      });

      // Make sure the account's actual role matches what they selected
      if (res.data.Role !== role) {
        return setError(`This account is registered as a ${res.data.Role}, not a ${role}.`);
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.Role);
      localStorage.setItem("email", res.data.Email);

      alert("Login successful!");
      if (role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      console.error(err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong.");
      }
    }
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

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-10 rounded-full transition-all ${s <= step ? "bg-[#0B3D1E]" : "bg-[#D8E5DA]"
                }`}
            />
          ))}
        </div>

        {/* ---- STEP 1: Role only ---- */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block mb-2 font-medium text-[#0F2A18]">
                Login as
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                <option value="">Select role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="button"
              onClick={goToCredentialsStep}
              className="w-full bg-[#0B3D1E] text-white py-3 rounded-lg font-semibold hover:bg-[#082B15] transition-all duration-300"
            >
              Next
            </button>

            <p className="text-center text-sm text-[#3A4D3E] mt-6">
              Don't have an account?{" "}
              <Link to="/createaccount" className="text-[#0B3D1E] font-semibold hover:underline">
                Create Account
              </Link>
            </p>

            <p className="text-center text-sm mt-4">
              <Link to="/" className="text-[#3A4D3E] hover:text-[#0B3D1E] hover:underline">
                Back
              </Link>
            </p>
          </div>
        )}

        {/* ---- STEP 2: Email + Password ---- */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium text-[#0F2A18]">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-[#0F2A18]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className={inputClass}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="w-1/2 bg-white border border-[#0B3D1E] text-[#0B3D1E] py-3 rounded-lg hover:bg-[#F0F5F1] transition-all duration-300"
              >
                Back
              </button>

              <button
                type="submit"
                className="w-1/2 bg-[#0B3D1E] text-white py-3 rounded-lg font-semibold hover:bg-[#082B15] transition-all duration-300"
              >
                Log In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;