import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const Field = ({ label, children }) => (
  <div>
    <label className="font-semibold text-[#0F2A18]">{label}</label>
    {children}
  </div>
);

const ReadOnlyInput = ({ value }) => (
  <input
    type="text"
    value={value || ""}
    readOnly
    className="w-full mt-2 border rounded-lg p-3 bg-gray-50 text-gray-700"
  />
);

const EditableInput = ({ value, onChange, type = "text" }) => (
  <input
    type={type}
    value={value ?? ""}
    onChange={onChange}
    className="w-full mt-2 border rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E] outline-none"
  />
);

const Profile = () => {
  const role = localStorage.getItem("role") || "patient";
  const token = localStorage.getItem("token");
  const emailFallback = localStorage.getItem("email") || "User";

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dashboardRoute = role === "doctor" ? "/doctor/dashboard" : role === "admin"
    ? "/admin/dashboard"
    :  "/patient/dashboard";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = role === "doctor" ? "/doctors/me" : "/users/me";

        const res = await API.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // setProfile(res.data);
        // setFormData(res.data);
        const data = res.data;

      setProfile(data);

      setFormData({
          ...data,
          qualificationsInput: (data.qualifications || []).join(", "),
      });

      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, [role, token]);

  const displayName = profile?.name || emailFallback;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=0B3D1E&color=ffffff&size=180`;

  const avatarUrl = profile?.profileImage || fallbackAvatar;

  const handleFieldChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleQualificationsChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      qualificationsInput: e.target.value, // raw text while typing
    }));
  };

  const startEditing = () => {
    setFormData({
      ...profile,
      qualificationsInput: (profile?.qualifications || []).join(", "),
    });
    setIsEditing(true);
    setError("");
  };

  const cancelEditing = () => {
    setFormData(profile);
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!profile?._id) {
      return setError("Missing profile ID — cannot save.");
    }

    try {
      setSaving(true);
      setError("");

      let payload;

      if (role === "doctor") {
        payload = {
          name: formData.name,
          phone: formData.phone,
          professionalTitle: formData.professionalTitle,
          specialization: formData.specialization,
          qualifications: formData.qualificationsInput
            .split(",")
            .map((q) => q.trim())
            .filter(Boolean),
          hospital: formData.hospital,
          experience: Number(formData.experience),
          consultationFee: Number(formData.consultationFee),
          description: formData.description,
        };
      } else {
        // ASSUMPTION: patient (Users) schema uses these field names.
        // Not yet confirmed against your actual usermodel.js.
        payload = {
          name: formData.name,
          phone: formData.phone,
          weight: Number(formData.weight),
          bloodGroup: formData.bloodGroup,
        };
      }

      const endpoint = role === "doctor" ? `/doctors/${profile._id}` : `/users/${profile._id}`;

      const res = await API.patch(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-[#F7FAF7] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-6">

        {/* Heading */}
        <div className="bg-white rounded-2xl shadow-md border border-[#D8E5DA] p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={avatarUrl}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackAvatar;
              }}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-[#D8E5DA] object-cover"
            />

            <div>
              <h2 className="text-2xl font-bold text-[#0F2A18]">
                {role === "doctor" ? `Dr. ${profile?.name || ""}` : profile?.name || ""}
              </h2>

              <p className="text-[#3A4D3E] mt-2">
                {role === "doctor" ? profile?.professionalTitle || "—" : "Patient"}
              </p>

              <p className="mt-1 text-gray-500">
                {role === "doctor" ? profile?.hospital || "—" : profile?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-white rounded-2xl shadow-md border border-[#D8E5DA] p-8 mt-8">
          <h3 className="text-2xl font-bold text-[#0F2A18] mb-6">Personal Information</h3>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid md:grid-cols-2 gap-6">

            <Field label="Full Name">
              {isEditing ? (
                <EditableInput value={formData?.name} onChange={handleFieldChange("name")} />
              ) : (
                <ReadOnlyInput value={role === "doctor" ? `Dr. ${profile?.name || ""}` : profile?.name} />
              )}
            </Field>

            <Field label="Email">
              {/* email intentionally not editable — tied to auth account */}
              <ReadOnlyInput value={profile?.email} />
            </Field>

            <Field label="Phone">
              {isEditing ? (
                <EditableInput value={formData?.phone} onChange={handleFieldChange("phone")} />
              ) : (
                <ReadOnlyInput value={profile?.phone} />
              )}
            </Field>

            <Field label="Gender">
              <ReadOnlyInput value={profile?.gender} />
            </Field>

            {role === "patient" && (
              <>
                <Field label="Blood Group">
                  {isEditing ? (
                    <EditableInput
                      value={formData?.bloodGroup}
                      onChange={handleFieldChange("bloodGroup")}
                    />
                  ) : (
                    <ReadOnlyInput value={profile?.bloodGroup} />
                  )}
                </Field>

                <Field label="Weight (kg)">
                  {isEditing ? (
                    <EditableInput
                      type="number"
                      value={formData?.weight}
                      onChange={handleFieldChange("weight")}
                    />
                  ) : (
                    <ReadOnlyInput value={profile?.weight} />
                  )}
                </Field>
              </>
            )}

            {role === "doctor" && (
              <>
                <Field label="Professional Title">
                  {isEditing ? (
                    <EditableInput
                      value={formData?.professionalTitle}
                      onChange={handleFieldChange("professionalTitle")}
                    />
                  ) : (
                    <ReadOnlyInput value={profile?.professionalTitle} />
                  )}
                </Field>

                <Field label="Specialization">
                  {isEditing ? (
                    <EditableInput
                      value={formData?.specialization}
                      onChange={handleFieldChange("specialization")}
                    />
                  ) : (
                    <ReadOnlyInput value={profile?.specialization} />
                  )}
                </Field>

                <Field label="Qualifications">
                  {isEditing ? (
                    <EditableInput
                      value={formData?.qualificationsInput}
                      onChange={handleQualificationsChange}
                    />
                  ) : (
                    <ReadOnlyInput value={(profile?.qualifications || []).join(", ")} />
                  )}
                </Field>

                <Field label="Registration Number">
                  {/* not editable — tied to verified credentials */}
                  <ReadOnlyInput value={profile?.registrationNumber} />
                </Field>

                <Field label="Experience (years)">
                  {isEditing ? (
                    <EditableInput
                      type="number"
                      value={formData?.experience}
                      onChange={handleFieldChange("experience")}
                    />
                  ) : (
                    <ReadOnlyInput value={profile?.experience} />
                  )}
                </Field>

                <Field label="Hospital">
                  {isEditing ? (
                    <EditableInput value={formData?.hospital} onChange={handleFieldChange("hospital")} />
                  ) : (
                    <ReadOnlyInput value={profile?.hospital} />
                  )}
                </Field>

                <Field label="Consultation Fee">
                  {isEditing ? (
                    <EditableInput
                      type="number"
                      value={formData?.consultationFee}
                      onChange={handleFieldChange("consultationFee")}
                    />
                  ) : (
                    <ReadOnlyInput value={profile?.consultationFee} />
                  )}
                </Field>

                <div className="md:col-span-2">
                  <Field label="Description">
                    {isEditing ? (
                      <textarea
                        value={formData?.description ?? ""}
                        onChange={handleFieldChange("description")}
                        maxLength={1000}
                        rows={4}
                        className="w-full mt-2 border rounded-lg p-3 focus:ring-2 focus:ring-[#0B3D1E]/30 focus:border-[#0B3D1E] outline-none"
                      />
                    ) : (
                      <p className="mt-2 text-gray-700">{profile?.description || "—"}</p>
                    )}
                  </Field>
                </div>
              </>
            )}

          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-10">
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#0B3D1E] text-white px-6 py-3 rounded-lg hover:bg-[#082B15] transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="bg-white border border-[#0B3D1E] text-[#0B3D1E] px-6 py-3 rounded-lg hover:bg-[#F0F5F1] transition"
                >
                  Cancel
                </button>
              </>
            )}

            <Link
              to={dashboardRoute}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Back
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Profile;