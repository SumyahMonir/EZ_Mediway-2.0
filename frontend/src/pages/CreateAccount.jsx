import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api"; // axios instance

const CreateAccount = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");

  // common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");

  // patient only
  const [weight, setWeight] = useState("");
  const [blood, setBlood] = useState("");

  // doctor only
  const [fee, setFee] = useState("");
  const [license, setLicense] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) return setError("Select role first");

    if (!email.endsWith("@gmail.com")) {
      return setError("Only @gmail.com allowed");
    }

    try {
      setError("");

      // 👤 PATIENT
      if (role === "patient") {
        await API.post("/users", {
          Name: name,
          NID: nid,
          Email: email,
          Phone: phone,
          Weight: weight,
          Blood_Grp: blood,
        });

        navigate("/patient-dashboard");
      }

      // 🧑‍⚕️ DOCTOR
      else if (role === "doctor") {
        await API.post("/doctors", {
          Name: name,
          NID: nid,
          Email: email,
          Phone: phone,
          Fee: fee,
          License_no: license,
        });

        navigate("/doctor-dashboard");
      }

    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-4">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ROLE */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Role</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          {/* COMMON FIELDS */}
          <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} className="w-full border p-2 rounded" />
          <input placeholder="NID" value={nid} onChange={(e)=>setNid(e.target.value)} className="w-full border p-2 rounded" />
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border p-2 rounded" />
          <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full border p-2 rounded" />

          {/* CONDITIONAL UI */}

          {role === "patient" && (
            <>
              <input placeholder="Weight" value={weight} onChange={(e)=>setWeight(e.target.value)} className="w-full border p-2 rounded" />
              <input placeholder="Blood Group" value={blood} onChange={(e)=>setBlood(e.target.value)} className="w-full border p-2 rounded" />
            </>
          )}

          {role === "doctor" && (
            <>
              <input placeholder="Fee" value={fee} onChange={(e)=>setFee(e.target.value)} className="w-full border p-2 rounded" />
              <input placeholder="License No" value={license} onChange={(e)=>setLicense(e.target.value)} className="w-full border p-2 rounded" />
            </>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <button className="w-full bg-gray-700 text-white py-2 rounded">
            Create Account
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateAccount;