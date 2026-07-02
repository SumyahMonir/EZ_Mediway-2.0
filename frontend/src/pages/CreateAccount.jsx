import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

const CreateAccount = () => {
  const navigate = useNavigate();

  // Wizard step: 1 = role, 2 = info, 3 = password
  const [step, setStep] = useState(1);

  const [role, setRole] = useState("");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Patient fields
  const [weight, setWeight] = useState("");
  const [blood, setBlood] = useState("");

  // Doctor fields
  const [fee, setFee] = useState("");
  const [license, setLicense] = useState("");

  const [error, setError] = useState("");

  // ---- Step navigation ----

  const goToInfoStep = () => {
    if (!role) {
      return setError("Please select a role.");
    }
    setError("");
    setStep(2);
  };

  const goToPasswordStep = (e) => {
    e.preventDefault();

    if (!name || !nid || !email || !phone) {
      return setError("Please fill in all fields.");
    }

    if (!email.endsWith("@gmail.com")) {
      return setError("Please use a valid @gmail.com email.");
    }

    if (role === "patient" && (!weight || !blood)) {
      return setError("Please fill in all fields.");
    }

    if (role === "doctor" && (!fee || !license)) {
      return setError("Please fill in all fields.");
    }

    setError("");
    setStep(3);
  };

  const goBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // ---- Final submit ----

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setError("");

      if (role === "patient") {
        await API.post("/auth/register", {
          Role: role,
          Name: name,
          NID: nid,
          Phone: Number(phone),
          Email: email,
          Password: password,
          Weight: Number(weight),
          Blood_Grp: blood,
        });

        alert("Patient account created successfully!");
        navigate("/login");
      }

      if (role === "doctor") {
        await API.post("/auth/register", {
          Role: role,
          Name: name,
          NID: nid,
          Phone: Number(phone),
          Email: email,
          Password: password,
          Fee: Number(fee),
          License_no: Number(license),
        });

        alert("Doctor account created successfully!");
        navigate("/login");
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

  const inputClass =
    "w-full border border-[#D8E5DA] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAF7] py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#D8E5DA] w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-[#0F2A18] mb-2">
          Create Account
        </h1>

        <p className="text-center text-[#3A4D3E] mb-6">
          Create your EZ MediWay account
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-10 rounded-full transition-all ${
                s <= step ? "bg-[#0B3D1E]" : "bg-[#D8E5DA]"
              }`}
            />
          ))}
        </div>

        {/* ---- STEP 1: Role only ---- */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-[#0F2A18]">
                Select Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                <option value="">Choose Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="button"
              onClick={goToInfoStep}
              className="w-full bg-[#0B3D1E] hover:bg-[#082B15] text-white py-3 rounded-lg shadow-md transition-all duration-300"
            >
              Next
            </button>

            <p className="text-center text-sm text-[#3A4D3E]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0B3D1E] font-semibold hover:underline">
                Log In
              </Link>
            </p>

            <p className="text-center text-sm">
              <Link to="/" className="text-[#0B3D1E] hover:underline">
                Back
              </Link>
            </p>
          </div>
        )}

        {/* ---- STEP 2: Info fields (role-specific) ---- */}
        {step === 2 && (
          <form onSubmit={goToPasswordStep} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />

            <input
              type="text"
              placeholder="NID Number"
              value={nid}
              onChange={(e) => setNid(e.target.value)}
              className={inputClass}
              required
            />

            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />

            <input
              type="number"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              required
            />

            {role === "patient" && (
              <>
                <input
                  type="number"
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputClass}
                  required
                />

                <input
                  type="text"
                  placeholder="Blood Group"
                  value={blood}
                  onChange={(e) => setBlood(e.target.value)}
                  className={inputClass}
                  required
                />
              </>
            )}

            {role === "doctor" && (
              <>
                <input
                  type="number"
                  placeholder="Consultation Fee"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className={inputClass}
                  required
                />

                <input
                  type="number"
                  placeholder="License Number"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className={inputClass}
                  required
                />
              </>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

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
                className="w-1/2 bg-[#0B3D1E] hover:bg-[#082B15] text-white py-3 rounded-lg shadow-md transition-all duration-300"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* ---- STEP 3: Password ---- */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

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
                className="w-1/2 bg-[#0B3D1E] hover:bg-[#082B15] text-white py-3 rounded-lg shadow-md transition-all duration-300"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default CreateAccount;