import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

// Small reusable wrapper so every input has a title above it
const Field = ({ label, children }) => (
  <div>
    <label className="block mb-2 font-medium text-[#0F2A18]">{label}</label>
    {children}
  </div>
);

// Step list depends on role — doctor gets 4 dedicated info slides
const getSteps = (role) => {
  if (role === "doctor") {
    return [
      "role",
      "personal",
      "doctor-professional", // slide 1/4
      "doctor-credentials",  // slide 2/4
      "doctor-practice",     // slide 3/4
      "doctor-photo",        // slide 4/4
      "password",
    ];
  }
  if (role === "patient") {
    return ["role", "personal", "patient-info", "password"];
  }
  return ["role"];
};

const CreateAccount = () => {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);

  const [role, setRole] = useState("");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Patient fields
  const [weight, setWeight] = useState("");
  const [blood, setBlood] = useState("");

  // Doctor fields
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualifications, setQualifications] = useState(""); // comma-separated input
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [hospital, setHospital] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  // Doctor profile picture
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const steps = getSteps(role);
  const currentStepKey = steps[stepIndex] || "role";

  // ---- Image select handler ----

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setError("Please select a valid image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError("Image must be smaller than 5MB.");
    }

    setError("");
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview("");
  };

  // ---- Step validation ----

  const validateStep = () => {
    switch (currentStepKey) {
      case "role":
        if (!role) return "Please select a role.";
        break;

      case "personal":
        if (!name || !nid || !email || !phone || !gender) {
          return "Please fill in all fields.";
        }
        if (!email.endsWith("@gmail.com")) {
          return "Please use a valid @gmail.com email.";
        }
        break;

      case "patient-info":
        if (!weight || !blood) return "Please fill in all fields.";
        break;

      case "doctor-professional":
        if (!professionalTitle || !specialization) {
          return "Please fill in all fields.";
        }
        break;

      case "doctor-credentials":
        if (!qualifications || !registrationNumber) {
          return "Please fill in all fields.";
        }
        break;

      case "doctor-practice":
        if (!experience || !hospital || !consultationFee) {
          return "Please fill in all fields.";
        }
        break;

      case "doctor-photo":
        // optional — no validation, doctors can skip and add later
        break;

      default:
        break;
    }
    return "";
  };

  // ---- Navigation ----

  const goNext = (e) => {
    if (e) e.preventDefault();
    const validationError = validateStep();
    if (validationError) return setError(validationError);

    setError("");
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    setError("");
    setStepIndex((i) => Math.max(i - 1, 0));
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
      setSubmitting(true);

      let res;

      if (role === "patient") {
        res = await API.post("/auth/register", {
          Role: role,
          Name: name,
          NID: nid,
          Phone: Number(phone),
          Email: email,
          Gender: gender,
          Password: password,
          Weight: Number(weight),
          Blood_Grp: blood,
        });

        alert("Patient account created successfully!");
      }

      if (role === "doctor") {
        res = await API.post("/auth/register", {
          Role: role,
          Name: name,
          NID: nid,
          Phone: Number(phone),
          Email: email,
          Gender: gender,
          Password: password,
          ConsultationFee: Number(consultationFee),
          RegistrationNumber: registrationNumber.trim(),
          ProfessionalTitle: professionalTitle.trim(),
          Specialization: specialization.trim(),
          Qualifications: qualifications
            .split(",")
            .map((q) => q.trim())
            .filter(Boolean),
          Experience: Number(experience),
          Hospital: hospital.trim(),
        });

        // If a profile picture was selected, upload it right after registration.
        // ASSUMPTION: /auth/register returns a token we can use to authenticate
        // this follow-up request. Adjust the field name below to match your
        // actual response shape (e.g. res.data.token, res.data.accessToken...).
        const token = res?.data?.token;

        if (profileImageFile && token) {
          const formData = new FormData();
          formData.append("image", profileImageFile);

          try {
            await API.post("/doctors/upload-profile-image", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (imgErr) {
            console.error("Profile image upload failed:", imgErr);
            // Registration already succeeded, so we don't block on this —
            // just let the user know they can add a photo later.
            alert(
              "Account created, but the profile picture upload failed. You can add it later from your profile."
            );
          }
        }

        alert("Doctor account created successfully!");
      }

      navigate("/login");
    } 
    
    catch (err) {
  console.error("FULL ERROR:", err.response?.data);
  console.error(err);

  if (err.response?.data?.error) {
    setError(err.response.data.error);
  } else if (err.response?.data?.msg) {
    setError(err.response.data.msg);
  } else {
    setError("Something went wrong.");
  }
} finally {
  setSubmitting(false);
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
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-all ${
                i <= stepIndex ? "bg-[#0B3D1E]" : "bg-[#D8E5DA]"
              }`}
            />
          ))}
        </div>

        {/* ---- STEP: Role ---- */}
        {currentStepKey === "role" && (
          <div className="space-y-4">
            <Field label="Select Role">
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setStepIndex(0); // reset if role changes after some progress
                }}
                className={inputClass}
              >
                <option value="">Choose Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </Field>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="button"
              onClick={goNext}
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

        {/* ---- STEP: Personal info (common) ---- */}
        {currentStepKey === "personal" && (
          <form onSubmit={goNext} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Personal Information
            </h2>

            <Field label="Full Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="NID Number">
              <input
                type="text"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Phone Number">
              <input
                type="string"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Gender">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </Field>

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

        {/* ---- STEP: Patient info ---- */}
        {currentStepKey === "patient-info" && (
          <form onSubmit={goNext} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Health Information
            </h2>

            <Field label="Weight (kg)">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Blood Group">
              <input
                type="text"
                placeholder="e.g. A+, O-, AB+"
                value={blood}
                onChange={(e) => setBlood(e.target.value)}
                className={inputClass}
                required
              />
              <select
                value={blood}
                onChange={(e) => setBlood(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </Field>

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

        {/* ---- STEP: Doctor slide 1/4 — Professional identity ---- */}
        {currentStepKey === "doctor-professional" && (
          <form onSubmit={goNext} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Professional Details <span className="text-sm text-[#3A4D3E] font-normal">(1 of 4)</span>
            </h2>

            <Field label="Professional Title">
              <input
                type="text"
                placeholder="e.g. Consultant Cardiologist"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Specialization">
              <input
                type="text"
                placeholder="e.g. Cardiology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

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

        {/* ---- STEP: Doctor slide 2/4 — Credentials ---- */}
        {currentStepKey === "doctor-credentials" && (
          <form onSubmit={goNext} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Credentials <span className="text-sm text-[#3A4D3E] font-normal">(2 of 4)</span>
            </h2>

            <Field label="Qualifications">
              <input
                type="text"
                placeholder="Comma-separated, e.g. MBBS, FCPS (Medicine)"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Registration Number">
              <input
                type="text"
                placeholder="e.g. BMDC-A-12345"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

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

        {/* ---- STEP: Doctor slide 3/4 — Practice details ---- */}
        {currentStepKey === "doctor-practice" && (
          <form onSubmit={goNext} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Practice Details <span className="text-sm text-[#3A4D3E] font-normal">(3 of 4)</span>
            </h2>

            <Field label="Years of Experience">
              <input
                type="number"
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Hospital / Clinic">
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Consultation Fee">
              <input
                type="number"
                min="0"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

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

        {/* ---- STEP: Doctor slide 4/4 — Profile picture ---- */}
        {currentStepKey === "doctor-photo" && (
          <form onSubmit={goNext} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Profile Picture <span className="text-sm text-[#3A4D3E] font-normal">(4 of 4)</span>
            </h2>

            <p className="text-sm text-[#3A4D3E]">
              Add a professional photo so patients can recognize you. This step is optional — you can add it later.
            </p>

            {profileImagePreview && (
              <div className="flex justify-center">
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-28 h-28 rounded-full object-cover border border-[#D8E5DA]"
                />
              </div>
            )}

            <Field label="Upload Photo">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={inputClass}
              />
            </Field>

            {profileImageFile && (
              <button
                type="button"
                onClick={removeImage}
                className="text-sm text-red-500 hover:underline"
              >
                Remove photo
              </button>
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

        {/* ---- STEP: Password ---- */}
        {currentStepKey === "password" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F2A18]">
              Set Your Password
            </h2>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Confirm Password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="w-1/2 bg-white border border-[#0B3D1E] text-[#0B3D1E] py-3 rounded-lg hover:bg-[#F0F5F1] transition-all duration-300"
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 bg-[#0B3D1E] hover:bg-[#082B15] text-white py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default CreateAccount;